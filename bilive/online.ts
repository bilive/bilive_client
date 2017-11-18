import * as request from 'request'
import * as tools from './lib/tools'
import { EventEmitter } from 'events'
import { AppClient } from './lib/app_client'
import { DeCaptcha } from './lib/boxcaptcha'
import { apiLiveOrigin, options, cookieJar } from './index'
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
  /**
   * 开始挂机
   * 
   * @memberof Online
   */
  public Start() {
    this.DoLoop()
    this.OnlineHeart()
  }
  /**
   * 发送在线心跳包, 检查cookie是否失效
   * 
   * @memberof Online
   */
  public async OnlineHeart() {
    let roomID = options.defaultRoomID,
      usersData = options.usersData
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
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Referer': `http://live.bilibili.com/${roomID}`
          }
        }
        let userOnlineHeartResponsePC = await tools.XHR<userOnlineHeartResponse>(online)
          .catch((reject) => { tools.Error(userData.nickname, reject) })
        if (userOnlineHeartResponsePC != null && userOnlineHeartResponsePC.body.code === -101) this.emit('cookieError', uid)
        // 客户端
        let heartbeatQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
          , heartbeat: request.Options = {
            method: 'POST',
            uri: `${apiLiveOrigin}/mobile/userOnlineHeart?${AppClient.ParamsSign(heartbeatQuery)}`,
            body: `room_id=${roomID}&scale=xxhdpi`,
            json: true,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        let userOnlineHeartResponse = await tools.XHR<userOnlineHeartResponse>(heartbeat, 'Android')
          .catch((reject) => { tools.Error(userData.nickname, reject) })
        if (userOnlineHeartResponse != null && userOnlineHeartResponse.body.code === -101) this.emit('tokenError', uid)
      }
    }
    setTimeout(() => {
      this.OnlineHeart()
    }, 3e5) // 5分钟
  }
  /**
   * 八小时循环, 用于签到, 宝箱, 日常活动
   * 
   * @memberof Online
   */
  public DoLoop() {
    let eventRooms = options.eventRooms,
      usersData = options.usersData
    for (let uid in usersData) {
      let userData = usersData[uid]
      // 每日签到
      if (userData.status && userData.doSign) this._DoSign(uid)
      // 每日宝箱
      if (userData.status && userData.treasureBox) this._TreasureBox(uid)
      // 日常活动
      if (userData.status && userData.eventRoom && eventRooms.length > 0) this._EventRoom(uid, eventRooms)
    }
    setTimeout(() => {
      this.DoLoop()
    }, 288e5) // 8小时
  }
  /**
   * 每日签到
   * 
   * @private
   * @param {string} uid
   * @memberof Online
   */
  private async _DoSign(uid: string) {
    let userData = options.usersData[uid],
      signQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`,
      sign: request.Options = {
        uri: `${apiLiveOrigin}/AppUser/getSignInfo?${AppClient.ParamsSign(signQuery)}`,
        json: true
      }
    let signInfoResponse = await tools.XHR<signInfoResponse>(sign, 'Android')
      .catch((reject) => { tools.Error(userData.nickname, reject) })
    if (signInfoResponse != null && signInfoResponse.body.code === 0) tools.Log(userData.nickname, '已签到')
  }
  /**
   * 每日签到PC
   * 
   * @private
   * @param {string} uid
   * @memberof Online
   */
  private async _DoSignPC(uid: string) {
    let userData = options.usersData[uid],
      sign: request.Options = {
        uri: `${apiLiveOrigin}/sign/doSign`,
        jar: cookieJar[uid],
        json: true,
        headers: {
          'Referer': `http://live.bilibili.com/${options.defaultRoomID}`
        }
      }
    let signInfoResponse = await tools.XHR<signInfoResponse>(sign)
      .catch((reject) => { tools.Error(userData.nickname, reject) })
    if (signInfoResponse != null && signInfoResponse.body.code === 0) tools.Log(userData.nickname, '已签到')
  }
  /**
   * 每日宝箱
   * 
   * @private
   * @param {string} uid
   * @memberof Online
   */
  private async _TreasureBox(uid: string) {
    let userData = options.usersData[uid]
      // 获取宝箱状态,换房间会重新冷却
      , currentTaskUrl = `${apiLiveOrigin}/mobile/freeSilverCurrentTask`
      , currentTaskQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      , currentTask: request.Options = {
        uri: `${currentTaskUrl}?${AppClient.ParamsSign(currentTaskQuery)}`,
        json: true
      }
      , currentTaskResponse = await tools.XHR<currentTaskResponse>(currentTask, 'Android')
        .catch((reject) => { tools.Error(userData.nickname, reject) })
    if (currentTaskResponse != null) {
      if (currentTaskResponse.body.code === 0) {
        await tools.Sleep(currentTaskResponse.body.data.minute * 6e4)
        let awardUrl = `${apiLiveOrigin}/mobile/freeSilverAward`,
          awardQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`,
          award: request.Options = {
            uri: `${awardUrl}?${AppClient.ParamsSign(awardQuery)}`,
            json: true
          }
        await tools.XHR<awardResponse>(award, 'Android')
          .catch((reject) => { tools.Error(userData.nickname, reject) })
        this._TreasureBox(uid)
      }
      else if (currentTaskResponse.body.code === -10017) tools.Log(userData.nickname, '已领取所有宝箱')
    }
  }
  /**
   * 每日宝箱PC
   * 
   * @private
   * @param {string} uid
   * @memberof Online
   */
  private async _TreasureBoxPC(uid: string) {
    let userData = options.usersData[uid]
      , jar = cookieJar[uid]
      // 获取宝箱状态,换房间会重新冷却
      , getCurrentTask: request.Options = {
        uri: `${apiLiveOrigin}/FreeSilver/getCurrentTask?_=${Date.now()}`,
        jar,
        json: true,
        headers: {
          'Referer': `http://live.bilibili.com/${options.defaultRoomID}`
        }
      }
      , currentTaskResponse = await tools.XHR<currentTaskResponse>(getCurrentTask)
        .catch((reject) => { tools.Error(userData.nickname, reject) })
    if (currentTaskResponse != null) {
      if (currentTaskResponse.body.code === 0) {
        await tools.Sleep(currentTaskResponse.body.data.minute * 6e4)
        let getCaptcha: request.Options = {
          uri: `${apiLiveOrigin}/freeSilver/getCaptcha?ts=${Date.now()}`,
          encoding: null,
          jar,
          headers: {
            'Referer': `http://live.bilibili.com/${options.defaultRoomID}`
          }
        }
          , gCaptcha = await tools.XHR<Buffer>(getCaptcha)
            .catch((reject) => { tools.Error(userData.nickname, reject) })
        if (gCaptcha != null) {
          let captcha = DeCaptcha(gCaptcha.body)
          if (captcha > -1) {
            let getAward: request.Options = {
              uri: `${apiLiveOrigin}/FreeSilver/getAward?time_start=${currentTaskResponse.body.data.time_start}&time_end=${currentTaskResponse.body.data.time_end}&captcha=${captcha}&_=${Date.now()}`,
              jar,
              json: true,
              headers: {
                'Referer': `http://live.bilibili.com/${options.defaultRoomID}`
              }
            }
            await tools.XHR<awardResponse>(getAward)
              .catch((reject) => { tools.Error(userData.nickname, reject) })
          }
        }
        this._TreasureBoxPC(uid)
      }
      else if (currentTaskResponse.body.code === -10017) tools.Log(userData.nickname, '已领取所有宝箱')
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
  private _EventRoom(uid: string, roomIDs: number[]) {
    let userData = options.usersData[uid]
    roomIDs.forEach(async roomID => {
      let getInfo: request.Options = {
        uri: `${apiLiveOrigin}/live/getInfo?roomid=${roomID}`,
        json: true,
        headers: {
          'Referer': `http://live.bilibili.com/${roomID}`
        }
      }
      let roomInfoResponse = await tools.XHR<roomInfoResponse>(getInfo)
        .catch((reject) => { tools.Error(userData.nickname, reject) })
      if (roomInfoResponse != null && roomInfoResponse.body.data != null) {
        let index: request.Options = {
          uri: `${apiLiveOrigin}/eventRoom/index?ruid=${roomInfoResponse.body.data.MASTERID}`,
          jar: cookieJar[uid],
          json: true,
          headers: {
            'Referer': `http://live.bilibili.com/${roomID}`
          }
        }
          , eventRoomResponse = await tools.XHR<eventRoomResponse>(index)
            .catch((reject) => { tools.Error(userData.nickname, reject) })
        if (eventRoomResponse != null && eventRoomResponse.body.code === 0 && eventRoomResponse.body.data.heart) {
          let heartTime = eventRoomResponse.body.data.heartTime * 1000
          await tools.Sleep(heartTime)
          this._EventRoomHeart(uid, heartTime, roomID)
        }
      }
    })
  }
  /**
   * 发送活动心跳包
   * 
   * @private
   * @param {string} uid
   * @param {number} heartTime
   * @param {number} roomID
   * @memberof Online
   */
  private async _EventRoomHeart(uid: string, heartTime: number, roomID: number) {
    let userData = options.usersData[uid],
      heart: request.Options = {
        uri: `${apiLiveOrigin}/eventRoom/heart?roomid=${roomID}`,
        jar: cookieJar[uid],
        json: true,
        headers: {
          'Referer': `http://live.bilibili.com/${roomID}`
        }
      }
      , eventRoomHeartResponse = await tools.XHR<eventRoomHeartResponse>(heart)
        .catch((reject) => { tools.Error(userData.nickname, reject) })
    if (eventRoomHeartResponse != null && eventRoomHeartResponse.body.data != null && eventRoomHeartResponse.body.data.heart) {
      await tools.Sleep(heartTime)
      this._EventRoomHeart(uid, heartTime, roomID)
    }
  }
}
/**
 * 签到信息
 * 
 * @export
 * @interface signInfoResponse
 */
interface signInfoResponse {
  code: number
  msg: string
  data: signInfoResponseData
}
interface signInfoResponseData {
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
 * @interface userOnlineHeartResponse
 */
interface userOnlineHeartResponse {
  code: number
  msg: string
}
/**
 * 在线领瓜子宝箱
 * 
 * @interface currentTaskResponse
 */
interface currentTaskResponse {
  code: number
  msg: string
  data: currentTaskResponseData
}
interface currentTaskResponseData {
  minute: number
  silver: number
  time_start: number
  time_end: number
}
/**
 * 领瓜子答案提交返回
 * 
 * @interface awardResponse
 */
interface awardResponse {
  code: number
  msg: string
  data: awardResponseData
}
interface awardResponseData {
  silver: number
  awardSilver: number
  isEnd: number
}
/**
 * 活动信息
 * 
 * @interface eventRoomResponse
 */
interface eventRoomResponse {
  code: number
  msg: string
  data: eventRoomResponseData
}
interface eventRoomResponseData {
  eventList: eventRoomResponseDataEventList[]
  heart: boolean
  heartTime: number
}
interface eventRoomResponseDataEventList {
  status: boolean
  score: number
  giftId: number
  type: string
  masterTitle: string
  keyword: string
  bagId: number
  num: number
  kingMoney: number
  isGoldBinBin: number
  goldBinBinInRoom: number
  team_id: number
  goldBinBinHeart: number
  is2233: number
}
/**
 * 活动心跳返回
 * 
 * @interface eventRoomHeartResponse
 */
interface eventRoomHeartResponse {
  code: number
  msg: string
  data: eventRoomHeartResponseData
}
interface eventRoomHeartResponseData {
  uid: number
  gift: eventRoomHeartResponseDataGift
  heart: boolean
}
interface eventRoomHeartResponseDataGift {
  '43': eventRoomHeartResponseDataGiftOrange; // 命格转盘
}
interface eventRoomHeartResponseDataGiftOrange {
  num: number
  bagId: number
  dayNum: number
}
/**
 * 房间信息
 * 
 * @interface roomInfoResponse
 */
interface roomInfoResponse {
  code: number
  msg: string
  data: roomInfoResponseData
}
interface roomInfoResponseData {
  UID: number
  IS_NEWBIE: number
  ISATTENTION: number
  ISADMIN: number
  ISANCHOR: number
  SVIP: number
  VIP: number
  SILVER: number
  GOLD: number
  BLOCK_TYPE: number
  BLOCK_TIME: number
  UNAME: number
  MASTERID: number
  ANCHOR_NICK_NAME: string
  ROOMID: number
  _status: string
  LIVE_STATUS: string
  ROUND_STATUS: number
  AREAID: number
  BACKGROUND_ID: number
  ROOMtITLE: string
  COVER: string
  LIVE_TIMELINE: number
  FANS_COUNT: number
  GIFT_TOP: roomInfoResponseDataGiftTop[]
  RCOST: number
  MEDAL: any[]
  IS_STAR: boolean
  starRank: number
  TITLE: roomInfoResponseDataTitle
  USER_LEVEL: roomInfoResponseDataUserLevel[]
  IS_RED_BAG: boolean
  IS_HAVE_VT: boolean
  ACTIVITY_ID: number
  ACTIVITY_PIC: number
  MI_ACTIVITY: number
  PENDANT: string
}
interface roomInfoResponseDataGiftTop {
  uid: number
  uname: string
  coin: number
  isSelf: number
}
interface roomInfoResponseDataTitle {
  title: string
}
interface roomInfoResponseDataUserLevel {
  level: number
  rank: number
}
// gm mogrify -crop 80x31+20+6 -quality 100 getCaptcha.jpg
// gm mogrify -format pbm -quality 0 getCaptcha.jpg