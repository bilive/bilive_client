import * as ws from 'ws'
import * as tools from './tools'
import { EventEmitter } from 'events'
import { SPECIAL_GIFT, SYS_MSG, LIGHTEN_START } from './comment_client'
/**
 * Blive客户端, 用于服务器和发送事件
 * 
 * @export
 * @class BiliveClient
 * @extends {EventEmitter}
 */
export class BiliveClient extends EventEmitter {
  /**
   * 创建一个 BiliveClient 实例
   * 
   * @param {string} server
   * @param {string} apiKey
   * @memberOf BiliveClient
   */
  constructor(server: string, apiKey: string) {
    super()
    this._server = server
    this._apiKey = apiKey
  }
  /**
   * 服务器地址
   * 
   * @private
   * @type {string}
   * @memberOf BiliveClient
   */
  private _server: string
  /**
   * apikey
   * 
   * @private
   * @type {string}
   * @memberOf BiliveClient
   */
  private _apiKey: string
  /**
   * 重连次数, 以五次为阈值
   * 
   * @type {number}
   * @memberOf BiliveClient
   */
  public reConnectTime: number = 0
  /**
   * WebSocket客户端
   * 
   * @private
   * @type {ws}
   * @memberOf BiliveClient
   */
  private _wsClient: ws
  /**
   * 全局计时器, 确保只有一个定时任务
   * 
   * @private
   * @type {NodeJS.Timer}
   * @memberOf CommentClient
   */
  private _Timer: NodeJS.Timer
  /**
   * 连接到指定服务器
   * 
   * @memberOf BiliveClient
   */
  public Connect() {
    if (this._wsClient != null && this._wsClient.readyState === ws.OPEN) return
    clearTimeout(this._Timer)
    this._wsClient = new ws(this._server, [this._apiKey])
    this._wsClient
      .on('error', this._ClientErrorHandler.bind(this))
      .on('close', this._ClientCloseHandler.bind(this))
      .on('message', this._MessageHandler.bind(this))
  }
  /**
   * 断开与服务器的连接
   * 
   * @memberOf BiliveClient
   */
  public Close() {
    clearTimeout(this._Timer)
    if (this._wsClient.readyState !== ws.OPEN) return
    this._wsClient.close()
    this._wsClient.removeAllListeners()
  }
  /**
   * 重新连接到服务器
   * 
   * @memberOf BiliveClient
   */
  public ReConnect() {
    this.Close()
    this.Connect()
  }
  /**
   * 5分钟后重新连接
   * 
   * @private
   * @memberOf BiliveClient
   */
  private _DelayReConnect() {
    this.emit('serverError', '尝试重新连接服务器失败')
    this.Close()
    this._Timer = setTimeout(() => {
      this.Connect()
    }, 3e5) // 5分钟
  }
  /**
   * 客户端连接重试
   * 
   * @private
   * @memberOf BiliveClient
   */
  private _ClientReConnect() {
    this.Close()
    this._Timer = setTimeout(() => {
      if (this.reConnectTime >= 5) {
        this.reConnectTime = 0
        this._DelayReConnect()
      }
      else {
        this.reConnectTime++
        this.Connect()
      }
    }, 3e3) // 3秒
  }
  /**
   * 客户端错误重连
   * 
   * @private
   * @param {Error} error
   * @memberOf BiliveClient
   */
  private _ClientErrorHandler(error: Error) {
    this.emit('clientError', error)
    this._ClientReConnect()
  }
  /**
   * 服务器断开重连
   * 
   * @private
   * @memberOf BiliveClient
   */
  private _ClientCloseHandler() {
    this.emit('clientClose', '服务器主动断开')
    this._ClientReConnect()
  }
  /**
   * 解析消息
   * 
   * @private
   * @param {string} data
   * @memberOf BiliveClient
   */
  private _MessageHandler(data: string) {
    let message: message | null = null
    try { message = JSON.parse(data) }
    catch (error) { this.emit('msgError', error) }
    if (message != null) {
      switch (message.cmd) {
        case 'sysmsg':
          this.emit('sysmsg', message)
          break
        case 'smallTV':
          this.emit('smallTV', message)
          break
        case 'beatStorm':
          this.emit('beatStorm', message)
          break
        case 'lighten':
          this.emit('lighten', message)
          break
        default:
          break
      }
    }
  }
}
/**
 * 消息格式
 * 
 * @interface message
 */
export interface message {
  cmd: string
  msg?: string
  data?: smallTVInfo | beatStormInfo | lightenInfo
}
/**
 * 小电视信息
 * 
 * @export
 * @interface smallTVInfo
 */
export interface smallTVInfo {
  roomID: number
  id: number
  rawData: SYS_MSG
}
/**
 * 节奏风暴信息
 * 
 * @export
 * @interface beatStormInfo
 */
export interface beatStormInfo {
  roomID: number
  content: string
  id: number
  rawData: SPECIAL_GIFT
}
/**
 * 快速抽奖信息
 * 
 * @export
 * @interface LightenInfo
 */
export interface lightenInfo {
  roomID: number
  id: number
  rawData: LIGHTEN_START
}