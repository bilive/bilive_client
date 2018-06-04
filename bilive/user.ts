import request from 'request'
import tools, { response } from './lib/tools'
import Online from './online'
import AppClient from './lib/app_client'
import { liveOrigin, apiVCOrigin, apiLiveOrigin, _options, _user } from './index'
/**
 * Creates an instance of User.
 * 
 * @class User
 * @extends {Online}
 */
class User extends Online {
  /**
   * Creates an instance of User.
   * @param {string} uid 
   * @param {userData} userData 
   * @memberof User
   */
  constructor(uid: string, userData: userData) {
    super(userData)
    this.uid = uid
  }
  // 存储用户信息
  public uid: string
  // 用户状态
  private _sign = false
  private _treasureBox = false
  private _eventRoom = false
  private _silver2coin = false
  /**
   * 当账号出现异常时, 会返回'captcha'或'stop'
   * 'captcha'为登录需要验证码, 若无法处理需Stop()
   * 
   * @returns {(Promise<'captcha' | 'stop' | void>)} 
   * @memberof User
   */
  public Start(): Promise<'captcha' | 'stop' | void> {
    if (!_user.has(this.uid)) _user.set(this.uid, this)
    return super.Start()
  }
  /**
   * 停止挂机
   * 
   * @memberof User
   */
  public Stop() {
    _user.delete(this.uid)
    return super.Stop()
  }
  /**
   * 零点重置
   * 为了少几个定时器, 统一由外部调用
   * 
   * @memberof User
   */
  public async nextDay() {
    // 每天刷新token和cookie
    const refresh = await this.refresh()
    if (refresh.status === AppClient.status.success) {
      this.jar = tools.setCookie(this.cookieString)
      tools.Options(_options)
    }
    else if (refresh.status === AppClient.status.error) {
      const status = await this._tokenError()
      if (status !== undefined) return this.Stop()
    }
    this._sign = false
    this._treasureBox = false
    this._eventRoom = false
    this._silver2coin = false
  }
  /**
   * 日常
   * 
   * @memberof User
   */
  public async daily() {
    await this.sign()
    this.treasureBox()
    this.eventRoom()
    this.silver2coin()
    this.sendGift()
    this.signGroup()
  }
  /**
   * 每日签到
   * 
   * @memberof User
   */
  public async sign() {
    if (this._sign || !this.userData.doSign) return
    let ok = 0
    // 签到
    const sign: request.Options = {
      uri: `${apiLiveOrigin}/AppUser/getSignInfo?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }
    const signInfo = await tools.XHR<signInfo>(sign, 'Android')
    if (signInfo !== undefined && signInfo.response.statusCode === 200 && signInfo.body.code === 0) {
      ok++
      tools.Log(this.nickname, '每日签到', '已签到')
    }
    // 道具包裹
    const getBag: request.Options = {
      uri: `${apiLiveOrigin}/AppBag/getSendGift?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }
    const getBagGift = await tools.XHR<getBagGift>(getBag, 'Android')
    if (getBagGift !== undefined && getBagGift.response.statusCode === 200 && getBagGift.body.code === 0) {
      ok++
      tools.Log(this.nickname, '每日签到', '已获取每日包裹')
    }
    if (ok === 2) this._sign = true
  }
  /**
   * 每日宝箱
   * 
   * @memberof User
   */
  public async treasureBox() {
    if (this._treasureBox || !this.userData.treasureBox) return
    // 获取宝箱状态,换房间会重新冷却
    const current: request.Options = {
      uri: `${apiLiveOrigin}/mobile/freeSilverCurrentTask?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }
    const currentTask = await tools.XHR<currentTask>(current, 'Android')
    if (currentTask !== undefined && currentTask.response.statusCode === 200) {
      if (currentTask.body.code === 0) {
        await tools.Sleep(currentTask.body.data.minute * 6e4)
        const award: request.Options = {
          uri: `${apiLiveOrigin}/mobile/freeSilverAward?${AppClient.signQueryBase(this.tokenQuery)}`,
          json: true,
          headers: this.headers
        }
        await tools.XHR<award>(award, 'Android')
        this.treasureBox()
      }
      else if (currentTask.body.code === -10017) {
        this._treasureBox = true
        tools.Log(this.nickname, '每日宝箱', '已领取所有宝箱')
      }
    }
  }
  /**
   * 每日任务
   * 
   * @memberof User
   */
  public async eventRoom() {
    if (this._eventRoom || !this.userData.eventRoom) return
    const tasks = []
    // 获取任务列表
    const roomID = _options.config.eventRooms[0]
    const taskInfo = await tools.XHR<taskInfo>({
      uri: `${apiLiveOrigin}/i/api/taskInfo`,
      jar: this.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
    })
    if (taskInfo === undefined || taskInfo.response.statusCode !== 200) return
    if (taskInfo.body.code == 0) {
      const taskData = taskInfo.body.data
      for (const i in taskData) if (taskData[i].task_id !== undefined) tasks.push(taskData[i].task_id)
      // 做任务
      let ok = 0
      for (const taskID of tasks) {
        const task: request.Options = {
          method: 'POST',
          uri: `${apiLiveOrigin}/activity/v1/task/receive_award`,
          body: `task_id=${taskID}`,
          jar: this.jar,
          json: true,
          headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
        }
        const taskres = await tools.XHR(task)
        if (taskres !== undefined && taskres.response.statusCode === 200
          && (taskres.response.body.code === 0 || taskres.response.body.code === -400)) ok++
        if (ok === tasks.length) {
          this._eventRoom = true
          tools.Log(this.nickname, '每日任务', '每日任务已完成')
        }
        await tools.Sleep(3000)
      }
    }
    else tools.Log(this.nickname, '每日任务', taskInfo.body.msg)
  }
  /**
   * 银瓜子兑换硬币
   * 
   * @memberof User
   */
  public async silver2coin() {
    if (this._silver2coin || !this.userData.silver2coin) return
    const roomID = _options.config.eventRooms[0]
    let ok = 0
    const checkExchange = (exchangeRes: response<silver2coin> | undefined) => {
      if (exchangeRes === undefined || exchangeRes.response.statusCode !== 200) return
      if (exchangeRes.body.code === 0) {
        ok++
        tools.Log(this.nickname, '银瓜子兑换硬币', '成功兑换 1 个硬币')
      }
      else if (exchangeRes.body.code === 403 || exchangeRes.body.code === -403) {
        ok++
        tools.Log(this.nickname, '银瓜子兑换硬币', exchangeRes.body.msg)
      }
      else tools.Log(this.nickname, '银瓜子兑换硬币', '兑换失败', exchangeRes.body)
      if (ok === 2) this._silver2coin = true
    }
    const exchange: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/AppExchange/silver2coin?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }
    const silver2coin = await tools.XHR<silver2coin>(exchange, 'Android')
    checkExchange(silver2coin)
    await tools.Sleep(3000)
    const exchangeWeb: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/exchange/silver2coin`,
      jar: this.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
    }
    const silver2coinWeb = await tools.XHR<silver2coin>(exchangeWeb)
    checkExchange(silver2coinWeb)
  }
  /**
   * 自动送礼
   * 
   * @memberof User
   */
  public async sendGift() {
    if (!this.userData.sendGift || this.userData.sendGiftRoom === 0) return
    const roomID = this.userData.sendGiftRoom
    // 获取房间信息
    const room: request.Options = {
      uri: `${apiLiveOrigin}/room/v1/Room/mobileRoomInit?id=${roomID}}`,
      json: true
    }
    const roomInit = await tools.XHR<roomInit>(room, 'Android')
    if (roomInit === undefined || roomInit.response.statusCode !== 200) return
    if (roomInit.body.code === 0) {
      // masterID
      const mid = roomInit.body.data.uid
      const room_id = roomInit.body.data.room_id
      // 获取包裹信息
      const bagInfo = await this.checkBag()
      if (bagInfo === undefined || bagInfo.response.statusCode !== 200) return
      if (bagInfo.body.code === 0) {
        if (bagInfo.body.data.length > 0) {
          for (const giftData of bagInfo.body.data) {
            if (giftData.expireat > 0 && giftData.expireat < 24 * 60 * 60) {
              // expireat单位为分钟, 永久礼物值为0
              const send: request.Options = {
                method: 'POST',
                uri: `${apiLiveOrigin}/gift/v2/live/bag_send?${AppClient.signQueryBase(this.tokenQuery)}`,
                body: `uid=${giftData.uid}&ruid=${mid}&gift_id=${giftData.gift_id}&gift_num=${giftData.gift_num}&bag_id=${giftData.id}\
&biz_id=${room_id}&rnd=${AppClient.RND}&biz_code=live&jumpFrom=21002`,
                json: true,
                headers: this.headers
              }
              const sendBag = await tools.XHR<sendBag>(send, 'Android')
              if (sendBag === undefined || sendBag.response.statusCode !== 200) continue
              if (sendBag.body.code === 0) {
                const sendBagData = sendBag.body.data
                tools.Log(this.nickname, '自动送礼', `向房间 ${roomID} 赠送 ${sendBagData.gift_num} 个${sendBagData.gift_name}`)
              }
              else tools.Log(this.nickname, '自动送礼', `向房间 ${roomID} 赠送 ${giftData.gift_num} 个${giftData.gift_name} 失败`, sendBag.body)
              await tools.Sleep(3000)
            }
          }
        }
      }
      else tools.Log(this.nickname, '自动送礼', '获取包裹信息失败', bagInfo.body)
    }
    else tools.Log(this.nickname, '自动送礼', '获取房间信息失败', roomInit.body)
  }
  /**
   * 获取包裹信息
   * 
   * @returns {(Promise<response<bagInfo> | undefined>)} 
   * @memberof User
   */
  public checkBag() {
    const bag: request.Options = {
      uri: `${apiLiveOrigin}/gift/v2/gift/m_bag_list?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }
    return tools.XHR<bagInfo>(bag, 'Android')
  }
  /**
   * 应援团签到
   * 
   * @memberof User
   */
  public async signGroup() {
    if (!this.userData.signGroup) return
    // 获取已加入应援团列表
    const group: request.Options = {
      uri: `${apiVCOrigin}/link_group/v1/member/my_groups?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }
    const linkGroup = await tools.XHR<linkGroup>(group, 'Android')
    if (linkGroup === undefined || linkGroup.response.statusCode !== 200) return
    if (linkGroup.body.code === 0) {
      if (linkGroup.body.data.list.length > 0) {
        for (const groupInfo of linkGroup.body.data.list) {
          const sign: request.Options = {
            uri: `${apiVCOrigin}/link_setting/v1/link_setting/sign_in?${AppClient.signQueryBase(`${this.tokenQuery}&group_id=${groupInfo.group_id}\
&owner_id=${groupInfo.owner_uid}`)}`,
            json: true,
            headers: this.headers
          }
          // 应援团自动签到
          const signGroup = await tools.XHR<signGroup>(sign, 'Android')
          if (signGroup === undefined || signGroup.response.statusCode !== 200) continue
          if (signGroup.body.data.add_num > 0)
            tools.Log(this.nickname, '应援团签到', `在${groupInfo.group_name}签到获得 ${signGroup.body.data.add_num} 点亲密度`)
          else tools.Log(this.nickname, '应援团签到', `已在${groupInfo.group_name}签到过`)
          await tools.Sleep(3000)
        }
      }
    }
    else tools.Log(this.nickname, '应援团签到', '获取应援团列表失败', linkGroup.body)
  }
}
export default User