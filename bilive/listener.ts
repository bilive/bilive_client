import * as request from 'request'
import * as tools from './lib/tools'
import { EventEmitter } from 'events'
import { roomInfo } from './online'
import { AppClient } from './lib/app_client'
import { CommentClient } from './lib/comment_client'
import { SYS_MSG, SYS_GIFT } from './lib/danmaku.type'
import { apiLiveOrigin, rafflePathname, lightenPathname, _options, smallTVPathname } from './index'
import { BiliveClient, message, beatStormInfo, smallTVInfo, raffleInfo, lightenInfo, appLightenInfo, debugInfo } from './lib/bilive_client'
/**
 * 监听服务器消息
 * 
 * @export
 * @class Listener
 * @extends {EventEmitter}
 */
export class Listener extends EventEmitter {
  constructor() {
    super()
  }
  /**
   * 用于接收弹幕消息
   * 
   * @private
   * @type {CommentClient}
   * @memberof Listener
   */
  private _CommentClient: CommentClient
  /**
   * 用于接收服务器消息
   * 
   * @private
   * @type {BiliveClient}
   * @memberof Listener
   */
  private _Client: BiliveClient
  /**
   * 小电视ID
   * 
   * @private
   * @type {number}
   * @memberof Listener
   */
  private _smallTVID: number = 0
  /**
   * 节奏风暴ID
   * 
   * @private
   * @type {number}
   * @memberof Listener
   */
  private _beatStormID: number = 0
  /**
   * 抽奖ID
   * 
   * @private
   * @type {number}
   * @memberof Listener
   */
  private _raffleID: number = 0
  /**
   * 快速抽奖ID
   * 
   * @private
   * @type {number}
   * @memberof Listener
   */
  private _lightenID: number = 0
  /**
   * app快速抽奖ID
   * 
   * @private
   * @type {number}
   * @memberof Listener
   */
  private _appLightenID: number = 0
  /**
   * 开始监听
   * 
   * @memberof Listener
   */
  public Start() {
    let config = _options.config
      , roomID = config.defaultRoomID
      , userID = config.defaultUserID
    this._CommentClient = new CommentClient({ roomID, userID })
    this._CommentClient
      .on('serverError', (error) => { tools.Log('与弹幕服务器断开五分钟', error) })
      .on('SYS_MSG', this._SYSMSGHandler.bind(this))
      .on('SYS_GIFT', this._SYSGiftHandler.bind(this))
      .Connect()
    let apiOrigin = config.apiOrigin
      , apiKey = config.apiKey
    if (apiOrigin === '' || apiKey === '') return
    this._Client = new BiliveClient(apiOrigin, apiKey)
    this._Client
      .on('serverError', (error) => { tools.Log('与监听服务器断开五分钟', error) })
      .on('sysmsg', (message: message) => { tools.Log('系统消息:', message.msg) })
      .on('smallTV', this._SmallTVHandler.bind(this))
      .on('beatStorm', this._BeatStormHandler.bind(this))
      .on('raffle', this._RaffleHandler.bind(this))
      .on('lighten', this._LightenHandler.bind(this))
      .on('debug', this._DebugHandler.bind(this))
      .Connect()
  }
  /**
   * 监听弹幕系统消息
   * 
   * @private
   * @param {SYS_MSG} dataJson
   * @memberof Listener
   */
  private _SYSMSGHandler(dataJson: SYS_MSG) {
    if (dataJson.real_roomid == null || dataJson.tv_id == null) return
    let url = apiLiveOrigin + smallTVPathname
      , roomID = dataJson.real_roomid
    this._RaffleCheck(url, roomID, 'smallTV')
  }
  /**
   * 监听系统礼物消息
   * 
   * @private
   * @param {SYS_GIFT} dataJson
   * @memberof Listener
   */
  private async _SYSGiftHandler(dataJson: SYS_GIFT) {
    if (dataJson.real_roomid == null) return
    if (dataJson.giftId === 106) {
      let url = apiLiveOrigin + rafflePathname
        , roomID = dataJson.real_roomid
      this._RaffleCheck(url, roomID, 'raffle')
      this._AppLightenCheck(roomID)
    }
    else if (dataJson.giftId === 84) {
      let roomID = dataJson.real_roomid
        , check: request.Options = {
          uri: `${apiLiveOrigin}${lightenPathname}/getLiveInfo?roomid=${roomID}`,
          json: true,
          headers: {
            'Referer': `https://live.bilibili.com/${roomID}`
          }
        }
        , lightenCheck = await tools.XHR<lightenCheck>(check).catch(tools.Error)
      if (lightenCheck != null && lightenCheck.body.code === 0 && lightenCheck.body.data.length > 0) {
        lightenCheck.body.data.forEach(value => {
          let message: message = {
            cmd: 'lighten',
            data: {
              roomID,
              id: value.lightenId,
              rawData: dataJson
            }
          }
          this._LightenHandler(message)
        })
      }
    }
  }
  /**
   * 检查房间抽奖信息
   * 
   * @private
   * @param {string} url 
   * @param {number} roomID 
   * @param {string} raffle 
   * @memberof Listener
   */
  private async _RaffleCheck(url: string, roomID: number, raffle: string) {
    let check: request.Options = {
      uri: `${url}/check?roomid=${roomID}`,
      json: true,
      headers: {
        'Referer': `https://live.bilibili.com/${roomID}`
      }
    }
      , raffleCheck = await tools.XHR<raffleCheck>(check)
    if (raffleCheck.response.statusCode === 200 && raffleCheck.body.code === 0 && raffleCheck.body.data.length > 0) {
      raffleCheck.body.data.forEach(value => {
        let message: message = {
          cmd: raffle,
          data: {
            roomID,
            id: value.raffleId
          }
        }
        if (raffle === 'smallTV') this._SmallTVHandler(message)
        else if (raffle === 'raffle') this._RaffleHandler(message)
        else if (raffle === 'lighten') this._LightenHandler(message)
      })
    }
  }
  /**
   * 检查app房间信息
   * 
   * @private
   * @param {number} roomID 
   * @memberof Listener
   */
  private async _AppLightenCheck(roomID: number) {
    let room: request.Options = {
      uri: `${apiLiveOrigin}/AppRoom/index?${AppClient.ParamsSign(`room_id=${roomID}&${AppClient.baseQuery}`)}`,
      json: true
    }
      , roomInfo = await tools.XHR<roomInfo>(room, 'Android')
    if (roomInfo.response.statusCode === 200 && roomInfo.body.code === 0 && roomInfo.body.data.event_corner.length > 0) {
      roomInfo.body.data.event_corner.forEach(event => {
        let type = event.event_type.split('-')
        if (type.length !== 2) return
        let message: message = {
          cmd: 'appLighten',
          data: {
            roomID,
            id: parseInt(type[1]),
            type: type[0]
          }
        }
        this._AppLightenHandler(message)
      })
    }
  }
  /**
   * 监听小电视消息
   * 
   * @private
   * @param {message} message
   * @memberof Listener
   */
  private _SmallTVHandler(message: message) {
    let smallTVInfo = <smallTVInfo>message.data
    if (this._smallTVID >= smallTVInfo.id) return
    let roomID = smallTVInfo.roomID
      , id = smallTVInfo.id
    this._smallTVID = id
    tools.Log(`房间 ${roomID} 赠送了第 ${id} 个小电视`)
    this.emit('smallTV', smallTVInfo)
  }
  /**
   * 监听抽奖消息
   * 
   * @private
   * @param {message} message
   * @memberof Listener
   */
  private _RaffleHandler(message: message) {
    let raffleInfo = <raffleInfo>message.data
    if (this._raffleID >= raffleInfo.id) return
    let roomID = raffleInfo.roomID
      , id = raffleInfo.id
    this._raffleID = id
    tools.Log(`房间 ${roomID} 赠送了第 ${id} 个活动道具`)
    this.emit('raffle', raffleInfo)
  }
  /**
   * 监听快速抽奖消息
   * 
   * @private
   * @param {message} message
   * @memberof Listener
   */
  private _LightenHandler(message: message) {
    let lightenInfo = <lightenInfo>message.data
    if (this._lightenID >= lightenInfo.id) return
    let roomID = lightenInfo.roomID
      , id = lightenInfo.id
    this._lightenID = id
    tools.Log(`房间 ${roomID} 赠送了第 ${id} 个活动道具`)
    this.emit('lighten', lightenInfo)
  }
  /**
   * 监听app快速抽奖消息
   * 
   * @private
   * @param {message} message
   * @memberof Listener
   */
  private _AppLightenHandler(message: message) {
    let appLightenInfo = <appLightenInfo>message.data
    if (this._appLightenID >= appLightenInfo.id) return
    let roomID = appLightenInfo.roomID
      , id = appLightenInfo.id
    this._appLightenID = id
    tools.Log(`房间 ${roomID} 赠送了第 ${id} 个活动道具`)
    this.emit('appLighten', appLightenInfo)
  }
  /**
   * 监听节奏风暴消息
   * 
   * @private
   * @param {message} message
   * @memberof Listener
   */
  private _BeatStormHandler(message: message) {
    let beatStormInfo = <beatStormInfo>message.data
    if (this._beatStormID >= beatStormInfo.id) return
    let roomID = beatStormInfo.roomID
      , id = beatStormInfo.id
    this._beatStormID = id
    tools.Log(`房间 ${roomID} 赠送了第 ${id} 个节奏风暴`)
    this.emit('beatStorm', beatStormInfo)
  }
  /**
   * 远程调试
   * 
   * @private
   * @param {message} message 
   * @memberof Listener
   */
  private _DebugHandler(message: message) {
    let debugInfo = <debugInfo>message.data
    tools.Log('远程调试信息:', debugInfo)
    this.emit('debug', debugInfo)
  }
}
/**
 * 抽奖检查
 * 
 * @export
 * @interface raffleCheck
 */
interface raffleCheck {
  code: number
  msg: string
  message: string
  data: raffleCheckData[]
}
interface raffleCheckData {
  raffleId: number
  type: 'small_tv' | string
  form: string
  from_user: {
    uname: string
    face: string
  }
  time: number
  status: number
}
/**
 * 快速抽奖检查
 * 
 * @export
 * @interface lightenCheck
 */
interface lightenCheck {
  code: number
  msg: string
  message: string
  data: lightenCheckData[]
}
interface lightenCheckData {
  type: string
  lightenId: number
  time: number
  status: boolean
}