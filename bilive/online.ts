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
          , heartPC = await tools.XHR<userOnlineHeartResponse>(online)
        if (heartPC.response.statusCode === 200 && heartPC.body.code === 3) this.emit('cookieError', uid)
        // 客户端
        let heartbeatQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
          , heartbeat: request.Options = {
            method: 'POST',
            uri: `${apiLiveOrigin}/mobile/userOnlineHeart?${AppClient.ParamsSign(heartbeatQuery)}`,
            body: `room_id=${roomID}&scale=xxhdpi`,
            json: true
          }
          , heart = await tools.XHR<userOnlineHeartResponse>(heartbeat, 'Android')
        if (heart.response.statusCode === 200 && heart.body.code === 3) this.emit('tokenError', uid)
      }
    }
  }
  /**
   * 八小时循环, 用于签到, 宝箱, 日常活动
   * 
   * @memberof Online
   */
  public DoLoop() {
    let usersData = _options.user
      , eventRooms = _options.config.eventRooms
    for (let uid in usersData) {
      let userData = usersData[uid]
      // 每日签到
      if (userData.status && userData.doSign) this._DoSign(uid)
      // 每日宝箱
      if (userData.status && userData.treasureBox) this._TreasureBox(uid)
      // 日常活动
      if (userData.status && userData.eventRoom && eventRooms.length > 0) this._EventRoom(uid, eventRooms)
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
      , signQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      , sign: request.Options = {
        uri: `${apiLiveOrigin}/AppUser/getSignInfo?${AppClient.ParamsSign(signQuery)}`,
        json: true
      }
      , signInfoResponse = await tools.XHR<signInfoResponse>(sign, 'Android')
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
    let roomID = _options.config.defaultRoomID
      , userData = _options.user[uid]
      , sign: request.Options = {
        uri: `${apiLiveOrigin}/sign/doSign`,
        jar: cookieJar[uid],
        json: true,
        headers: {
          'Referer': `https://live.bilibili.com/${roomID}`
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
    let userData = _options.user[uid]
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
        let awardUrl = `${apiLiveOrigin}/mobile/freeSilverAward`
          , awardQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
          , award: request.Options = {
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
   * 日常活动
   * 
   * @private
   * @param {string} uid
   * @param {number[]} roomIDs
   * @memberof Online
   */
  private _EventRoom(uid: string, roomIDs: number[]) {
    let singleWatchTask: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/activity/v1/task/receive_award`,
      body: 'task_id=single_watch_task',
      jar: cookieJar[uid],
      json: true,
      headers: {
        'Referer': `https://live.bilibili.com/${roomIDs[0]}`
      }
    }
      , doubleWatchTask: request.Options = {
        method: 'POST',
        uri: `${apiLiveOrigin}/activity/v1/task/receive_award`,
        body: 'task_id=double_watch_task',
        jar: cookieJar[uid],
        json: true,
        headers: {
          'Referer': `https://live.bilibili.com/${roomIDs[0]}`
        }
      }
    tools.XHR(singleWatchTask, 'WebView').catch(tools.Error)
    tools.XHR(doubleWatchTask, 'WebView').catch(tools.Error)
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