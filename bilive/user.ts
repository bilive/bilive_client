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
  private _coin2silver = false
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
    this._coin2silver = false
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
    this.coin2silver()
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
    const signInfo = await tools.XHR<signInfo>({
      uri: `${apiLiveOrigin}/AppUser/getSignInfo?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }, 'Android')
    if (signInfo !== undefined && signInfo.response.statusCode === 200 && signInfo.body.code === 0) {
      ok++
      tools.Log(this.nickname, '每日签到', '已签到')
    }
    // 道具包裹
    const getBagGift = await tools.XHR<getBagGift>({
      uri: `${apiLiveOrigin}/AppBag/getSendGift?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }, 'Android')
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
    const currentTask = await tools.XHR<currentTask>({
      uri: `${apiLiveOrigin}/mobile/freeSilverCurrentTask?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }, 'Android')
    if (currentTask !== undefined && currentTask.response.statusCode === 200) {
      if (currentTask.body.code === 0) {
        await tools.Sleep(currentTask.body.data.minute * 6e4)
        await tools.XHR<award>({
          uri: `${apiLiveOrigin}/mobile/freeSilverAward?${AppClient.signQueryBase(this.tokenQuery)}`,
          json: true,
          headers: this.headers
        }, 'Android')
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
        const taskres = await tools.XHR({
          method: 'POST',
          uri: `${apiLiveOrigin}/activity/v1/task/receive_award`,
          body: `task_id=${taskID}`,
          jar: this.jar,
          json: true,
          headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
        })
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
    const roomID = _options.config.defaultRoomID
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
    const silver2coin = await tools.XHR<silver2coin>({
      method: 'POST',
      uri: `${apiLiveOrigin}/AppExchange/silver2coin?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }, 'Android')
    checkExchange(silver2coin)
    await tools.Sleep(3000)
    const silver2coinWeb = await tools.XHR<silver2coin>({
      method: 'POST',
      uri: `${apiLiveOrigin}/exchange/silver2coin`,
      jar: this.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
    })
    checkExchange(silver2coinWeb)
  }
  /**
   * 硬币兑换银瓜子
   *
   * @memberof User
   */
  public async coin2silver() {
    if (this._coin2silver || !this.userData.coin2silver) return
    var avail_coin = 0
    const coinstat = await tools.XHR<coin_status>({
      uri: `https://api.live.bilibili.com/pay/v1/Exchange/getStatus?platform=pc`,
      jar: this.jar,
      json: true,
      headers: this.headers
    })
    if (coinstat === undefined) return
    if (coinstat.response.statusCode === 200 && coinstat.body.code === 0) {
      avail_coin = coinstat.body.data.coin_2_silver_left
      if (coinstat.body.data.vip === 0 && avail_coin > 10) avail_coin = 10
      if (coinstat.body.data.vip === 1 && avail_coin > 20) avail_coin = 20
    }
    const exchangeWeb = await tools.XHR<coin2silver>({
      method: 'POST',
      uri: `https://live.bilibili.com/exchange/coin2silver`,
      body: `coin=${avail_coin}`,
      jar: this.jar,
      json: true,
      headers: this.headers
    })
    if (exchangeWeb === undefined) return
    if (exchangeWeb.response.statusCode === 200 && exchangeWeb.body.code === 0) {
      tools.Log(this.nickname, '硬币兑换银瓜子','获得银瓜子', exchangeWeb.body.data.silver)
    }
    if (exchangeWeb.response.statusCode === 200 && exchangeWeb.body.code === -403) {
      tools.Log(this.nickname, '硬币兑换银瓜子出错，可能已达上限')
    }
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
    const roomInfo = await tools.XHR<roomInfo>({
      uri: `${apiLiveOrigin}/AppRoom/index?${AppClient.signQueryBase(`room_id=${roomID}`)}`,
      json: true
    }, 'Android')
    if (roomInfo === undefined || roomInfo.response.statusCode !== 200) return
    if (roomInfo.body.code === 0) {
      // masterID
      const mid = roomInfo.body.data.mid
      const room_id = roomInfo.body.data.room_id
      // 获取包裹信息
      const bagInfo = await tools.XHR<bagInfo>({
        uri: `${apiLiveOrigin}/gift/v2/gift/m_bag_list?${AppClient.signQueryBase(this.tokenQuery)}`,
        json: true,
        headers: this.headers
      }, 'Android')
      if (bagInfo === undefined || bagInfo.response.statusCode !== 200) return
      if (bagInfo.body.code === 0) {
        if (bagInfo.body.data.length > 0) {
          for (const giftData of bagInfo.body.data) {
            if (giftData.expireat > 0 && giftData.expireat < 12 * 60 * 60) {
              // expireat单位为分钟, 永久礼物值为0
              const sendBag = await tools.XHR<sendBag>({
                method: 'POST',
                uri: `${apiLiveOrigin}/gift/v2/live/bag_send`,
                body: AppClient.signQueryBase(`bag_id=${giftData.id}&biz_code=live&biz_id=${room_id}&gift_id=${giftData.gift_id}&gift_num=${giftData.gift_num}&ruid=${mid}&uid=${giftData.uid}&rnd=${AppClient.RND}&${this.tokenQuery}`),
                json: true,
                headers: this.headers
              }, 'Android')
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
    else tools.Log(this.nickname, '自动送礼', '获取房间信息失败', roomInfo.body)
  }
  /**
   * 自动送礼V2？
   *
   * @memberof User
   */
  public async autoSend() {
    if (!this.userData.autoSend) return
    // 获取佩戴勋章信息
    const uid = this.userData.biliUID
    const MInfo = await tools.XHR<MInfo>({
      method: `POST`,
      uri: `${apiLiveOrigin}/live_user/v1/UserInfo/get_weared_medal`,
      body: `source=1&uid=${uid}&target_id=11153765&csrf_token=${tools.getCookie(this.jar, 'bili_jct')}`,//使用3号直播间查询
      json: true,
      jar: this.jar,
      headers: this.headers
    })
    if (MInfo === undefined || MInfo.response.statusCode !== 200 || MInfo.body.code !== 0) return
    if (MInfo.body.data !== null) {
      const room_id = MInfo.body.data.roominfo.room_id
      const ruid = MInfo.body.data.roominfo.uid
      const day_limit = MInfo.body.data.day_limit
      const today_feed  = parseInt(MInfo.body.data.today_feed)
      var intimacy_needed = day_limit - today_feed
      if (intimacy_needed === 0) {
        tools.Log(this.nickname,`亲密度已达上限`)
        return
      }
      // 获取包裹信息
      var gift_value = 0
      var bag_value = 0
      var send_num = 0
      const bagInfo = await tools.XHR<bagInfoW>({
        uri: `${apiLiveOrigin}/gift/v2/gift/bag_list`,
        json: true,
        jar: this.jar,
        headers: this.headers
      })
      if (bagInfo === undefined || bagInfo.response.statusCode !== 200) return
      if (bagInfo.body.code === 0) {
        if (bagInfo.body.data.list.length > 0) {
          for (const giftData of bagInfo.body.data.list) {
            if (giftData.expire_at > 0) {
              switch (giftData.gift_id) {//Gift_Config from http://api.live.bilibili.com/gift/v3/live/gift_config
                case 1:
                  gift_value = 1
                  bag_value = gift_value * giftData.gift_num//辣条
                break
                case 3:
                  gift_value = 99
                  bag_value = gift_value * giftData.gift_num//B坷垃
                break
                case 4:
                  gift_value = 52
                  bag_value = gift_value * giftData.gift_num//喵娘
                break
                case 6:
                  gift_value = 10
                  bag_value = gift_value * giftData.gift_num//亿圆
                break
                case 9:
                  gift_value = 4500
                  bag_value = gift_value * giftData.gift_num//爱心便当
                break
                case 10:
                  gift_value = 19900
                  bag_value = gift_value * giftData.gift_num//蓝白胖次
                break
                case 12:
                  gift_value = 100
                  bag_value = gift_value * giftData.gift_num//游戏机（活动礼物）
                break
                case 121:
                  gift_value = 200
                  bag_value = gift_value * giftData.gift_num//闪耀之星（活动礼物）
                break
              }
              if (intimacy_needed >= bag_value) {
                send_num = giftData.gift_num
              }
              else {
                send_num = Math.floor(intimacy_needed / gift_value)
              }
              if (send_num > 0) {
                const sendBagW = await tools.XHR<sendBagW>({
                  method: 'POST',
                  uri: `${apiLiveOrigin}/gift/v2/live/bag_send`,
                  body: `uid=${uid}&gift_id=${giftData.gift_id}&ruid=${ruid}&gift_num=${send_num}&bag_id=${giftData.bag_id}&platform=pc&biz_code=live&biz_id=${room_id}&rnd=${AppClient.RND}&storm_beat_id=0&metadata=&price=0&csrf_token=${tools.getCookie(this.jar, 'bili_jct')}`,
                  json: true,
                  jar: this.jar,
                  headers: this.headers
                })
                if (sendBagW === undefined || sendBagW.response.statusCode !== 200) continue
                if (sendBagW.body.code === 0) {
                  const sendBagWData = sendBagW.body.data
                  tools.Log(this.nickname, '自动送礼V2', `向房间 ${room_id} 赠送 ${sendBagWData.gift_num} 个${sendBagWData.gift_name}`)
                  intimacy_needed = intimacy_needed - send_num * gift_value
                  if (intimacy_needed === 0) {
                    tools.Log(this.nickname,`亲密度已达上限`)
                    return
                  }
                }
                else tools.Log(this.nickname, '自动送礼V2', `向房间 ${room_id} 赠送 ${giftData.gift_num} 个${giftData.gift_name} 失败`, sendBagW.body)
                await tools.Sleep(5000)
              }
            }
          }
          tools.Log(this.nickname,`已完成送礼`)
        }
        else tools.Log(this.nickname,`包裹空空的`)
      }
      else tools.Log(this.nickname,`获取包裹信息失败`)
    }
    else tools.Log(this.nickname,`获取佩戴勋章信息失败`)
  }
  /**
   * 应援团签到
   *
   * @memberof User
   */
  public async signGroup() {
    if (!this.userData.signGroup) return
    // 获取已加入应援团列表
    const linkGroup = await tools.XHR<linkGroup>({
      uri: `${apiVCOrigin}/link_group/v1/member/my_groups?${AppClient.signQueryBase(this.tokenQuery)}`,
      json: true,
      headers: this.headers
    }, 'Android')
    if (linkGroup === undefined || linkGroup.response.statusCode !== 200) return
    if (linkGroup.body.code === 0) {
      if (linkGroup.body.data.list.length > 0) {
        for (const groupInfo of linkGroup.body.data.list) {
          const signGroup = await tools.XHR<signGroup>({
            uri: `${apiVCOrigin}/link_setting/v1/link_setting/sign_in?${AppClient.signQueryBase(`group_id=${groupInfo.group_id}&owner_id=${groupInfo.owner_uid}&${this.tokenQuery}`)}`,
            json: true,
            headers: this.headers
          }, 'Android')
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
  /**
   * 获取个人信息
   *
   * @memberof User
   */
  public async GetUserInfo() {
    if (!this.userData.getUserInfo) return
    const UserInfo = await tools.XHR<UserInfo>({
      uri: `${apiLiveOrigin}/User/getUserInfo?ts=${AppClient.TS}`,
      json: true,
      jar: this.jar,
      headers: this.headers
    })
    if (UserInfo === undefined) return
    if (UserInfo.response.statusCode === 200 && UserInfo.body.code === 0) {
      const InfoData = UserInfo.body.data
      tools.Log(this.nickname,`ID:${InfoData.uname}  LV${InfoData.user_level} EXP:${InfoData.user_intimacy}/${InfoData.user_next_intimacy} 排名:${InfoData.user_level_rank}`)
      tools.Log(`金瓜子：${InfoData.gold} 银瓜子：${InfoData.silver} 硬币：${InfoData.billCoin}`);
    }
    else tools.Log(this.nickname,'获取个人信息失败')
    var MedalNum = 0
    const MedalInfo = await tools.XHR<MedalInfo>({
      uri: `${apiLiveOrigin}/i/api/medal?page=1&pageSize=25`,
      json: true,
      jar: this.jar,
      headers: this.headers
    })
    if (MedalInfo === undefined) return
    else {
      if (MedalInfo.response.statusCode === 200 && MedalInfo.body.code === 0) {
        const MedalData = MedalInfo.body.data
        if (MedalInfo.body.data.count === 0) {
          tools.Log(this.nickname,`无勋章`)
        }
        else {
          MedalInfo.body.data.fansMedalList.forEach(async (MedalData) => {
  					if (MedalData.status === 1) {
  						tools.Log(this.nickname,`佩戴勋章:${MedalData.medal_name}${MedalData.level} 亲密度:${MedalData.intimacy}/${MedalData.next_intimacy} 排名:${MedalData.rank}`);
  					}
  					else
  						MedalNum++
  				});
  				if (MedalNum === MedalData.count)
  					tools.Log(this.nickname,`未佩戴勋章`)
        }
      }
      else tools.Log(this.nickname,'获取勋章信息失败')
    }
  }
}
export default User
