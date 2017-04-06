import * as request from 'request'
import * as tools from './lib/tools'
import * as ws from 'ws'
import { EventEmitter } from 'events'
import { BiliveClient, message, beatStormInfo, smallTVInfo, lightenInfo } from './lib/bilive_client'
import { CommentClient, SYS_MSG, LIGHTEN_START } from './lib/comment_client'
import { options } from './index'
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
   * @memberOf Listener
   */
  private _CommentClient: CommentClient
  /**
   * 用于接收服务器消息
   * 
   * @private
   * @type {BiliveClient}
   * @memberOf Listener
   */
  private _Client: BiliveClient
  /**
   * 小电视ID
   * 
   * @private
   * @type {number}
   * @memberOf Listener
   */
  private _smallTVID: number = 0
  /**
   * 节奏风暴ID
   * 
   * @private
   * @type {number}
   * @memberOf Listener
   */
  private _beatStormID: number = 0
  /**
   * 活动参与ID
   * 
   * @private
   * @type {number}
   * @memberOf Listener
   */
  private _lightenID: number = 0
  /**
   * 开始监听
   * 
   * @memberOf Listener
   */
  public Start() {
    this._CommentClient = new CommentClient(options.defaultRoomID, options.defaultUserID)
    this._CommentClient
      .on('serverError', (error) => { tools.Log('与弹幕服务器断开五分钟', error) })
      .on('SYS_MSG', this._SYSMSGHandler.bind(this))
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
      .on('lighten', this._LightenHandler.bind(this))
      .Connect()
  }
  /**
   * 监听弹幕系统消息
   * 
   * @private
   * @param {SYS_MSG} dataJson
   * @memberOf Listener
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
   * 监听小电视消息
   * 
   * @private
   * @param {message} message
   * @memberOf Listener
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
   * 监听活动消息
   * 
   * @private
   * @param {message} message
   * @memberOf Listener
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
   * @memberOf Listener
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
}