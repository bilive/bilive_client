import * as request from 'request'
import * as tools from './lib/tools'
import { AppClient } from './lib/app_client'
import { apiLiveOrigin, _options, liveOrigin, _user } from './index'

export class User {
  /**
   * Creates an instance of User.
   * @param {string} uid 
   * @param {userData} userData 
   * @memberof User
   */
  constructor(uid: string, userData: userData) {
    this.uid = uid
    this.userData = userData
  }
  // 存储用户信息, 懒得再把值取出来了
  public uid: string
  public userData: userData
  public jar: request.CookieJar
  // 用户状态
  private _sign = false
  private _treasureBox = false
  private _eventRoom = false
  private _signGroup = false
  /**
   * 如果抽奖做到外面的话应该有用
   * 
   * @readonly
   * @memberof User
   */
  public get baseQuery() {
    return `access_key=${this.userData.accessToken}&${AppClient.baseQuery}`
  }
  /**
   * 负责心跳定时
   * 
   * @private
   * @type {NodeJS.Timer}
   * @memberof User
   */
  private _heartloop: NodeJS.Timer
  public async Start() {
    this.jar = tools.setCookie(this.userData.cookie, [apiLiveOrigin])
    let test = await this._heart().catch(error => { return error })
    if (test === 'stop') return
    this._heartloop = setInterval(() => this._heart(), 3e+5) // 5min
  }
  public Stop() {
    _user.delete(this.uid)
    if (this._heartloop != null) clearInterval(this._heartloop)
  }
  /**
   * 零点重置
   * 为了少几个定时器, 统一由外部调用
   * 
   * @memberof User
   */
  public nextDay() {
    this._sign = false
    this._treasureBox = false
    this._eventRoom = false
    this._signGroup = false
  }
  /**
   * 心跳以及检查cookie
   * 
   * @private
   * @memberof User
   */
  private async _heart() {
    let heartTest = await this._onlineHeart().catch(error => { return error })
    if (typeof heartTest === 'string') await this._cookieError().catch(error => { return error })
  }
  /**
   * 发送在线心跳包
   * 
   * @memberof User
   */
  private async _onlineHeart() {
    let online: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/User/userOnlineHeart`,
      jar: this.jar,
      json: true,
      headers: {
        'Referer': `${liveOrigin}/${_options.config.defaultRoomID}`
      }
    }
      , heartPC = await tools.XHR<userOnlineHeart>(online)
    if (heartPC.response.statusCode === 200 && heartPC.body.code === 3) throw 'cookieError'
    // 客户端
    let heartbeat: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/mobile/userOnlineHeart?${AppClient.ParamsSign(this.baseQuery)}`,
      body: `room_id=${_options.config.defaultRoomID}&scale=xxhdpi`,
      json: true
    }
      , heart = await tools.XHR<userOnlineHeart>(heartbeat, 'Android')
    if (heart.response.statusCode === 200 && heart.body.code === 3) throw 'tokenError'
  }
  /**
   * cookie失效
   * 
   * @private
   * @memberof User
   */
  private async _cookieError() {
    tools.Log(this.userData.nickname, 'Cookie已失效')
    let cookie = await AppClient.GetCookie(this.userData.accessToken)
    if (cookie != null) {
      this.jar = cookie
      this.userData.cookie = cookie.getCookieString(apiLiveOrigin)
      this.userData.biliUID = parseInt(tools.getCookie(cookie, 'DedeUserID'))
      tools.Options(_options)
      tools.Log(this.userData.nickname, 'Cookie已更新')
    }
    else return this._tokenError()
  }
  /**
   * token失效
   * 
   * @private
   * @memberof User
   */
  private async _tokenError() {
    tools.Log(this.userData.nickname, 'Token已失效')
    let token = await AppClient.GetToken({
      userName: this.userData.userName,
      passWord: this.userData.passWord
    })
    if (typeof token === 'string') {
      this.userData.accessToken = token
      tools.Options(_options)
      tools.Log(this.userData.nickname, 'Token已更新')
      await this._cookieError()
    }
    else if (token != null && token.response.statusCode === 200) {
      this.Stop()
      this.userData.status = false
      tools.Options(_options)
      tools.Log(this.userData.nickname, 'Token更新失败', token.body)
      throw 'stop'
    }
    else tools.Log(this.userData.nickname, 'Token更新失败')
  }
  /**
   * 日常
   * 
   * @memberof User
   */
  public async daily() {
    await this.sign().catch(error => { tools.Error(this.userData.nickname, error) })
    this.treasureBox().catch(error => { tools.Error(this.userData.nickname, error) })
    this.eventRoom().catch(error => { tools.Error(this.userData.nickname, error) })
    this.sendGift().catch(error => { tools.Error(this.userData.nickname, error) })
    this.signGroup().catch(error => { tools.Error(this.userData.nickname, error) })
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
    let sign: request.Options = {
      uri: `${apiLiveOrigin}/AppUser/getSignInfo?${AppClient.ParamsSign(this.baseQuery)}`,
      json: true
    }
      , signInfo = await tools.XHR<signInfo>(sign, 'Android')
    if (signInfo.response.statusCode === 200 && signInfo.body.code === 0) {
      ok += 1
      tools.Log(this.userData.nickname, '每日签到', '已签到')
    }
    // 道具包裹
    let getBag: request.Options = {
      uri: `${apiLiveOrigin}/AppBag/getSendGift?${AppClient.ParamsSign(this.baseQuery)}`,
      json: true
    }
      , getBagGift = await tools.XHR<getBagGift>(getBag, 'Android')
    if (getBagGift.response.statusCode === 200 && getBagGift.body.code === 0) {
      ok += 1
      tools.Log(this.userData.nickname, '每日签到', '已获取每日包裹')
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
    let current: request.Options = {
      uri: `${apiLiveOrigin}/mobile/freeSilverCurrentTask?${AppClient.ParamsSign(this.baseQuery)}`,
      json: true
    }
      , currentTask = await tools.XHR<currentTask>(current, 'Android')
    if (currentTask.response.statusCode === 200) {
      if (currentTask.body.code === 0) {
        await tools.Sleep(currentTask.body.data.minute * 6e4)
        let award: request.Options = {
          uri: `${apiLiveOrigin}/mobile/freeSilverAward?${AppClient.ParamsSign(this.baseQuery)}`,
          json: true
        }
        await tools.XHR<award>(award, 'Android')
        this.treasureBox()
      }
      else if (currentTask.body.code === -10017) {
        this._treasureBox = true
        tools.Log(this.userData.nickname, '每日宝箱', '已领取所有宝箱')
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
    // 分享房间
    let roomID = _options.config.eventRooms[0]
      , biliUID = this.userData.biliUID
      , md5 = tools.Hash('md5', `${biliUID}${roomID}bilibili`)
      , sha1 = tools.Hash('sha1', `${md5}bilibili`)
      , baseQuery = `access_key=${this.userData.accessToken}&${AppClient.baseQuery}`
      , share: request.Options = {
        uri: `${apiLiveOrigin}/activity/v1/Common/shareCallback?${AppClient.ParamsSign(`roomid=${roomID}&sharing_plat=weibo&share_sign=${sha1}&${baseQuery}`)}`,
        json: true
      }
    let shareCallback = await tools.XHR<shareCallback>(share, 'Android')
    if (shareCallback.response.statusCode === 200 && shareCallback.body.code === 0) tools.Log(this.userData.nickname, '每日任务', `分享房间 ${roomID} 成功`)
    else tools.Log(this.userData.nickname, '每日任务', shareCallback.body.msg)
    // 做任务
    let ok = 0
      , task = ['single_watch_task', 'double_watch_task', 'share_task']
    task.forEach(value => {
      let task: request.Options = {
        method: 'POST',
        uri: `${apiLiveOrigin}/activity/v1/task/receive_award`,
        body: `task_id=${value}`,
        jar: this.jar,
        json: true,
        headers: {
          'Referer': `${liveOrigin}/${roomID}`
        }
      }
      tools.XHR(task, 'WebView')
        .then(taskres => {
          if (taskres.response.statusCode === 200) ok += 1
          if (ok = 3) this._eventRoom = true
        })
        .catch(error => { tools.Error(this.userData.nickname, '每日任务', error) })
    })
  }
  /**
   * 自动送礼
   * 
   * @memberof User
   */
  public async sendGift() {
    if (!this.userData.sendGift) return
    let roomID = this.userData.sendGiftRoom
      // 获取房间信息
      , room: request.Options = {
        uri: `${apiLiveOrigin}/AppRoom/index?${AppClient.ParamsSign(`room_id=${roomID}&${AppClient.baseQuery}`)}`,
        json: true
      }
      , roomInfo = await tools.XHR<roomInfo>(room, 'Android')
    if (roomInfo.response.statusCode === 200 && roomInfo.body.code === 0) {
      // masterID
      let mid = roomInfo.body.data.mid
        // 获取包裹信息
        , bag: request.Options = {
          uri: `${apiLiveOrigin}/gift/v2/gift/m_bag_list?${AppClient.ParamsSign(this.baseQuery)}`,
          json: true
        }
        , bagInfo = await tools.XHR<bagInfo>(bag, 'Android')
      if (bagInfo.response.statusCode === 200 && bagInfo.body.code === 0) {
        if (bagInfo.body.data.length > 0) {
          for (let giftData of bagInfo.body.data) {
            // 永久礼物expireat值为0
            if (giftData.expireat > 0 && giftData.expireat < 8.64e+4) /* 24h */ {
              // 送出礼物
              let send: request.Options = {
                method: 'POST',
                uri: `${apiLiveOrigin}/gift/v2/live/bag_send`,
                body: AppClient.ParamsSign(`bag_id=${giftData.id}&biz_code=live&biz_id=${roomID}&gift_id=${giftData.gift_id}&gift_num=${giftData.gift_num}&ruid=${mid}&uid=${giftData.uid}&rnd=${AppClient.RND}&${this.baseQuery}`),
                json: true
              }
                , sendBag = await tools.XHR<sendBag>(send, 'Android')
              if (sendBag.response.statusCode === 200 && sendBag.body.code === 0) {
                let sendBagData = sendBag.body.data
                tools.Log(this.userData.nickname, '自动送礼', `向房间 ${roomID} 赠送 ${sendBagData.gift_num} 个${sendBagData.gift_name}`)
              }
              else tools.Log(this.userData.nickname, '自动送礼', `向房间 ${roomID} 赠送 ${giftData.gift_num} 个${giftData.gift_name} 失败`, sendBag.body)
              await tools.Sleep(3e+3) //3s
            }
          }
        }
      }
      else tools.Log(this.userData.nickname, '自动送礼', '获取包裹信息失败', bagInfo.body)
    }
    else tools.Log(this.userData.nickname, '自动送礼', '获取房间信息失败', roomInfo.body)
  }
  /**
   * 应援团签到
   * 
   * @memberof User
   */
  public async signGroup() {
    if (this._signGroup || !this.userData.signGroup) return
    // 获取已加入应援团列表
    let group: request.Options = {
      uri: `${apiLiveOrigin}/link_group/v1/member/my_groups?${AppClient.ParamsSign(this.baseQuery)}`,
      json: true
    }
      , linkGroup = await tools.XHR<linkGroup>(group, 'Android')
    if (linkGroup.response.statusCode === 200 && linkGroup.body.code === 0) {
      this._signGroup = true
      if (linkGroup.body.data.list.length > 0) {
        for (let groupInfo of linkGroup.body.data.list) {
          // 应援团自动签到
          let sign: request.Options = {
            uri: `${apiLiveOrigin}/link_setting/v1/link_setting/sign_in?${AppClient.ParamsSign(`group_id=${groupInfo.group_id}&owner_id=${groupInfo.owner_uid}&${this.baseQuery}`)}`,
            json: true
          }
            , signGroup = await tools.XHR<signGroup>(sign, 'Android')
          if (signGroup.response.statusCode === 200 && signGroup.body.data.add_num > 0) tools.Log(this.userData.nickname, '应援团签到', `在${groupInfo.group_name}签到获得 ${signGroup.body.data.add_num} 点亲密度`)
          else tools.Log(this.userData.nickname, '应援团签到', `已在${groupInfo.group_name}签到过`)
          await tools.Sleep(3e+3) //3s
        }
      }
    }
    else tools.Log(this.userData.nickname, '应援团签到', '获取应援团列表失败', linkGroup.body)
  }
}