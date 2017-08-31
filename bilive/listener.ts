import * as request from 'request'
import * as tools from './lib/tools'
import * as ws from 'ws'
import { EventEmitter } from 'events'
import { BiliveClient, message, beatStormInfo, smallTVInfo, raffleInfo, lightenInfo, debugInfo } from './lib/bilive_client'
import { CommentClient, SYS_MSG, SYS_GIFT, LIGHTEN_START } from './lib/comment_client'
import { rootOrigin, options } from './index'
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
   * 开始监听
   * 
   * @memberof Listener
   */
  public Start() {
    this._CommentClient = new CommentClient(options.defaultRoomID, options.defaultUserID)
    this._CommentClient
      .on('serverError', (error) => { tools.Log('与弹幕服务器断开五分钟', error) })
      .on('SYS_MSG', this._SYSMSGHandler.bind(this))
      .on('SYS_GIFT', this._SYSGiftHandler.bind(this))
      .Connect()
    let apiOrigin = options.apiOrigin,
      apiKey = options.apiKey
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
    let message: message = {
      cmd: 'smallTV',
      data: {
        roomID: dataJson.real_roomid,
        id: parseInt(dataJson.tv_id),
        rawData: dataJson
      }
    }
    this._SmallTVHandler(message)
  }
  /**
   * 监听系统礼物消息
   * 
   * @private
   * @param {SYS_GIFT} dataJson
   * @memberof Listener
   */
  private _SYSGiftHandler(dataJson: SYS_GIFT) {
    if (dataJson.roomid == null) return
    let roomID = dataJson.roomid
    if (dataJson.msg.includes('认真学习模式')) {
      let check: request.Options = { uri: `${rootOrigin}/activity/v1/SchoolOpen/check?roomid=${roomID}` }
      tools.XHR<string>(check)
        .then((resolve) => {
          let raffleCheck: raffleCheck = JSON.parse(resolve)
          if (raffleCheck.code === 0 && raffleCheck.data.length > 0) {
            let message: message = {
              cmd: 'raffle',
              data: {
                roomID,
                id: raffleCheck.data[0].raffleId,
                rawData: dataJson
              }
            }
            this._RaffleHandler(message)
          }
        })
        .catch(tools.Error)
    }
    else if (dataJson.rep === 1) {
      let check: request.Options = { uri: `${rootOrigin}/activity/v1/NeedYou/getLiveInfo?roomid=${roomID}` }
      tools.XHR<string>(check)
        .then((resolve) => {
          let lightenCheck: lightenCheck = JSON.parse(resolve)
          if (lightenCheck.code === 0 && lightenCheck.data.length > 0) {
            let message: message = {
              cmd: 'lighten',
              data: {
                roomID,
                id: lightenCheck.data[0].lightenId,
                rawData: dataJson
              }
            }
            this._LightenHandler(message)
          }
        })
        .catch(tools.Error)
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
    let roomID = smallTVInfo.roomID,
      id = smallTVInfo.id
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
    let roomID = raffleInfo.roomID,
      id = raffleInfo.id
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
    let roomID = lightenInfo.roomID,
      id = lightenInfo.id
    this._lightenID = id
    tools.Log(`房间 ${roomID} 赠送了第 ${id} 个活动道具`)
    this.emit('lighten', lightenInfo)
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
    let roomID = beatStormInfo.roomID,
      id = beatStormInfo.id
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
export interface raffleCheck {
  code: number
  msg: string
  message: string
  data: raffleCheck_Data[]
}
export interface raffleCheck_Data {
  form: string
  raffleId: number
  status: boolean
  time: number
  type: string
}
/**
 * 快速抽奖检查
 * 
 * @export
 * @interface lightenCheck
 */
export interface lightenCheck {
  code: number
  msg: string
  message: string
  data: lightenCheck_Data[]
}
export interface lightenCheck_Data {
  type: string
  lightenId: number
  time: number
  status: boolean
}