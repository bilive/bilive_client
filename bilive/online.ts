import * as crypto from 'crypto'
import * as request from 'request'
import * as tools from './lib/tools'
import { EventEmitter } from 'events'
import { AppClient } from './lib/app_client'
import { apiLiveOrigin, _options, cookieJar } from './index'
/**
 * 挂机得经验
 * 
 * @export
 * @class Online
 * @extends {EventEmitter}
 */
export class Online extends EventEmitter {
  constructor() {
    super()
  }
  public doLoop: NodeJS.Timer
  public onlineHeart: NodeJS.Timer
  /**
   * 开始挂机
   * 
   * @memberof Online
   */
  public Start() {
    this.DoLoop()
    this.OnlineHeart()
    // 为以后可能的END做准备
    this.doLoop = setInterval(() => { this.DoLoop() }, 288e5) // 8小时
    this.onlineHeart = setInterval(() => { this.OnlineHeart() }, 3e5) // 5分钟
  }
  /**
   * 发送在线心跳包, 检查cookie是否失效
   * 
   * @memberof Online
   */
  public async OnlineHeart() {
    let roomID = _options.config.defaultRoomID
      , usersData = _options.user
    for (let uid in usersData) {
      let userData = usersData[uid]
      if (userData.status) {
        // PC
        let online: request.Options = {
          method: 'POST',
          uri: `${apiLiveOrigin}/User/userOnlineHeart`,
          jar: cookieJar[uid],
          json: true,
          headers: {
            'Referer': `https://live.bilibili.com/${roomID}`
          }
        }
          , heartPC = await tools.XHR<userOnlineHeart>(online)
        if (heartPC.response.statusCode === 200 && heartPC.body.code === 3) this.emit('cookieError', uid)
        // 客户端
        let heartbeatQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
          , heartbeat: request.Options = {
            method: 'POST',
            uri: `${apiLiveOrigin}/mobile/userOnlineHeart?${AppClient.ParamsSign(heartbeatQuery)}`,
            body: `room_id=${roomID}&scale=xxhdpi`,
            json: true
          }
          , heart = await tools.XHR<userOnlineHeart>(heartbeat, 'Android')
        if (heart.response.statusCode === 200 && heart.body.code === 3) this.emit('tokenError', uid)
      }
    }
  }
  /**
   * 八小时循环, 用于签到, 宝箱, 日常活动, 自动送礼
   * 
   * @memberof Online
   */
  public DoLoop() {
    let usersData = _options.user
      , eventRooms = _options.config.eventRooms
    for (let uid in usersData) {
      let userData = usersData[uid]
      if (!userData.status) continue
      // 每日签到
      if (userData.doSign) this._DoSign(uid).catch((reject) => { tools.Error(userData.nickname, reject) })
      // 每日宝箱
      if (userData.treasureBox) this._TreasureBox(uid).catch((reject) => { tools.Error(userData.nickname, reject) })
      // 日常活动
      if (userData.eventRoom && eventRooms.length > 0) this._EventRoom(uid, eventRooms).catch((reject) => { tools.Error(userData.nickname, reject) })
      // 自动送礼
      if (userData.sendGift && userData.sendGiftRoom !== '') this._sendGift(uid).catch((reject) => { tools.Error(userData.nickname, reject) })
    }
  }
  /**
   * 每日签到
   * 
   * @private
   * @param {string} uid
   * @memberof Online
   */
  private async _DoSign(uid: string) {
    let userData = _options.user[uid]
      , baseQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      // 签到
      , sign: request.Options = {
        uri: `${apiLiveOrigin}/AppUser/getSignInfo?${AppClient.ParamsSign(baseQuery)}`,
        json: true
      }
      , signInfo = await tools.XHR<signInfo>(sign, 'Android')
    if (signInfo.response.statusCode === 200 && signInfo.body.code === 0) tools.Log(userData.nickname, '已签到')
    // 道具包裹
    let getBag: request.Options = {
      uri: `${apiLiveOrigin}/AppBag/getSendGift?${AppClient.ParamsSign(baseQuery)}`,
      json: true
    }
      , getBagGift = await tools.XHR<getBagGift>(getBag, 'Android')
    if (getBagGift.response.statusCode === 200 && getBagGift.body.code === 0) tools.Log(userData.nickname, '已获取每日包裹')
  }
  /**
   * 每日宝箱
   * 
   * @private
   * @param {string} uid
   * @memberof Online
   */
  private async _TreasureBox(uid: string) {
    let userData = _options.user[uid]
      , baseQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      // 获取宝箱状态,换房间会重新冷却
      , current: request.Options = {
        uri: `${apiLiveOrigin}/mobile/freeSilverCurrentTask?${AppClient.ParamsSign(baseQuery)}`,
        json: true
      }
      , currentTask = await tools.XHR<currentTask>(current, 'Android')
    if (currentTask.response.statusCode === 200) {
      if (currentTask.body.code === 0) {
        await tools.Sleep(currentTask.body.data.minute * 6e4)
        let award: request.Options = {
          uri: `${apiLiveOrigin}/mobile/freeSilverAward?${AppClient.ParamsSign(baseQuery)}`,
          json: true
        }
        await tools.XHR<award>(award, 'Android')
        this._TreasureBox(uid)
      }
      else if (currentTask.body.code === -10017) tools.Log(userData.nickname, '已领取所有宝箱')
    }
  }
  /**
   * 日常活动
   * 
   * @private
   * @param {string} uid
   * @param {number[]} roomIDs
   * @memberof Online
   */
  private async _EventRoom(uid: string, roomIDs: number[]) {
    // 分享房间
    let userData = _options.user[uid]
      , biliUID = tools.getCookie(cookieJar[uid], apiLiveOrigin, 'DedeUserID')
      , md5 = crypto.createHash('md5').update(`${biliUID}${roomIDs[0]}bilibili`).digest('hex')
      , sha1 = crypto.createHash('sha1').update(`${md5}bilibili`).digest('hex')
      , baseQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      , share: request.Options = {
        uri: `${apiLiveOrigin}/activity/v1/Common/shareCallback?${AppClient.ParamsSign(`roomid=${roomIDs[0]}&sharing_plat=weibo&share_sign=${sha1}&${baseQuery}`)}`,
        json: true
      }
    await tools.XHR(share, 'Android')
    // 做任务
    let task = ['single_watch_task', 'double_watch_task', 'share_task']
    task.forEach(value => {
      let task: request.Options = {
        method: 'POST',
        uri: `${apiLiveOrigin}/activity/v1/task/receive_award`,
        body: `task_id=${value}`,
        jar: cookieJar[uid],
        json: true,
        headers: {
          'Referer': `https://live.bilibili.com/${roomIDs[0]}`
        }
      }
      tools.XHR(task, 'WebView').catch(tools.Error)
    })
  }
  /**
   * 自动送礼
   * 
   * @private
   * @param {string} uid 
   * @memberof Online
   */
  private async _sendGift(uid: string) {
    let userData = _options.user[uid]
      , roomID = userData.sendGiftRoom
      , baseQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      // 获取房间信息
      , room: request.Options = {
        uri: `${apiLiveOrigin}/AppRoom/index?${AppClient.ParamsSign(`room_id=${roomID}&${baseQuery}`)}`,
        json: true
      }
      , roomInfo = await tools.XHR<roomInfo>(room, 'Android')
    if (roomInfo.response.statusCode === 200 && roomInfo.body.code === 0) {
      // masterID
      let mid = roomInfo.body.data.mid
        // 获取包裹信息
        , bag: request.Options = {
          uri: `${apiLiveOrigin}/gift/v2/gift/m_bag_list?${AppClient.ParamsSign(baseQuery)}`,
          json: true
        }
        , bagInfo = await tools.XHR<bagInfo>(bag, 'Android')
      if (bagInfo.response.statusCode === 200 && bagInfo.body.code === 0) {
        let gift = bagInfo.body.data
        gift.forEach(async giftData => {
          // 永久礼物expireat值为0
          if (giftData.expireat > 0 && giftData.expireat < 86400) {
            // 送出礼物
            let send: request.Options = {
              method: 'POST',
              uri: `${apiLiveOrigin}/gift/v2/live/bag_send`,
              body: AppClient.ParamsSign(`bag_id=${giftData.id}&biz_code=live&biz_id=${roomID}&gift_id=${giftData.gift_id}&gift_num=${giftData.gift_num}&ruid=${mid}&uid=${giftData.uid}&rnd=${AppClient.RND}&${baseQuery}`),
              json: true
            }
              , sendBag = await tools.XHR<sendBag>(send, 'Android')
            if (sendBag.response.statusCode === 200 && sendBag.body.code === 0) {
              let sendBagData = sendBag.body.data
              tools.Log(userData.nickname, `向房间 ${roomID} 赠送 ${sendBagData.gift_num} 个${sendBagData.gift_name}`)
            }
            else tools.Log(userData.nickname, `向房间 ${roomID} 赠送 ${giftData.gift_num} 个${giftData.gift_name} 失败`)
          }
        })
      }
      else tools.Log(userData.nickname, '获取包裹信息失败')
    }
    else tools.Log(userData.nickname, '获取房间信息失败')
  }
}
/**
 * 签到信息
 * 
 * @export
 * @interface signInfo
 */
interface signInfo {
  code: number
  msg: string
  data: signInfoData
}
interface signInfoData {
  text: string
  status: number
  allDays: string
  curMonth: string
  newTask: number
  hadSignDays: number
  remindDays: number
}
/**
 * 在线心跳返回
 * 
 * @interface userOnlineHeart
 */
interface userOnlineHeart {
  code: number
  msg: string
}
/**
 * 在线领瓜子宝箱
 * 
 * @interface currentTask
 */
interface currentTask {
  code: number
  msg: string
  data: currentTaskData
}
interface currentTaskData {
  minute: number
  silver: number
  time_start: number
  time_end: number
}
/**
 * 领瓜子答案提交返回
 * 
 * @interface award
 */
interface award {
  code: number
  msg: string
  data: awardData
}
interface awardData {
  silver: number
  awardSilver: number
  isEnd: number
}
/**
 * 房间信息
 * 
 * @interface roomInfo
 */
interface roomInfo {
  code: number
  data: roomInfoData
}
interface roomInfoData {
  room_id: number
  mid: number
}
/**
 * 每日包裹
 * 
 * @interface getBagGift
 */
interface getBagGift {
  code: number
}
/**
 * 包裹信息
 * 
 * @interface bagInfo
 */
interface bagInfo {
  code: number
  msg: string
  message: string
  data: bagInfoData[]
}
interface bagInfoData {
  id: number
  uid: number
  gift_id: number
  gift_num: number
  expireat: number
  gift_type: number
  gift_name: string
  gift_price: string
  img: string
  count_set: string
  combo_num: number
  super_num: number
}
/**
 * 赠送包裹礼物
 * 
 * @interface sendBag
 */
interface sendBag {
  code: number
  msg: string
  message: string
  data: sendBagData
}
interface sendBagData {
  tid: string
  uid: number
  uname: string
  ruid: number
  rcost: number
  gift_id: number
  gift_type: number
  gift_name: string
  gift_num: number
  gift_action: string
  gift_price: number
  coin_type: string
  total_coin: number
  metadata: string
  rnd: string
}