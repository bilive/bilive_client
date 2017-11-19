import { Socket } from 'net'
import { EventEmitter } from 'events'
import * as ws from 'ws'
import * as tools from './tools'
import { apiLiveOrigin } from '../index'
import { danmuJson } from './danmaku.type'
/**
 * 弹幕客户端, 用于连接弹幕服务器和发送弹幕事件
 * 
 * @export
 * @class CommentClient
 * @extends {EventEmitter}
 */
export class CommentClient extends EventEmitter {
  /**
   * Creates an instance of CommentClient.
   * @param {commentClientOptions} [options] 
   * @memberof CommentClient
   */
  constructor(options?: commentClientOptions) {
    super()
    let option: commentClientOptions = {
      roomID: 23058,
      userID: 0,
      // userID: 100000000000000 + parseInt((200000000000000 * Math.random()).toFixed(0)),
      protocol: 'socket'
    }
    Object.assign(option, options)
    this.roomID = <number>option.roomID
    this.userID = <number>option.userID
    this.protocol = <commentClientProtocol>option.protocol
  }
  /**
   * 用户UID
   * 
   * @type {number}
   * @memberof CommentClient
   */
  public userID: number
  /**
   * 房间号, 注意不要短号
   * 
   * @type {number}
   * @memberof CommentClient
   */
  public roomID: number
  /**
   * 连接弹幕服务器使用的协议
   * 
   * @type {commentClientProtocol}
   * @memberof CommentClient
   */
  public protocol: commentClientProtocol
  /**
   * 弹幕服务器
   * 
   * @private
   * @type {string}
   * @memberof CommentClient
   */
  private _server: string
  /**
   * 服务器端口
   * 
   * @private
   * @type {number}
   * @memberof CommentClient
   */
  private _port: number
  /**
   * 客户端版本, 目前为1
   * 
   * @type {number}
   * @memberof CommentClient
   */
  public version: number = 1
  /**
   * 重连次数, 以五次为阈值
   * 
   * @type {number}
   * @memberof CommentClient
   */
  public reConnectTime: number = 0
  /**
   * 是否已经连接到服务器
   * 
   * @private
   * @type {boolean}
   * @memberof CommentClient
   */
  private _connected: boolean = false
  /**
   * 模仿客户端与服务器进行通讯
   * 
   * @private
   * @type {(Socket | ws)}
   * @memberof CommentClient
   */
  private _Client: Socket | ws
  /**
   * 全局计时器, 确保只有一个定时任务
   * 
   * @private
   * @type {NodeJS.Timer}
   * @memberof CommentClient
   */
  private _Timer: NodeJS.Timer
  /**
   * 当前连接的弹幕服务器
   * 
   * @readonly
   * @type {string}
   * @memberof CommentClient
   */
  public get server(): string {
    return this._server
  }
  /**
   * 当前连接的弹幕服务器端口
   * 
   * @readonly
   * @type {number}
   * @memberof CommentClient
   */
  public get port(): number {
    return this._port
  }
  /**
   * 是否已经连接到服务器
   * 
   * @readonly
   * @type {boolean}
   * @memberof CommentClient
   */
  public get connected(): boolean {
    return this._connected
  }
  /**
   * 连接到指定服务器
   * 
   * @param {{ server: string, port: number }} [options] 
   * @memberof CommentClient
   */
  public async Connect(options?: { server: string, port: number }) {
    if (this._connected) return
    clearTimeout(this._Timer)
    if (options == null) {
      // 动态获取服务器地址, 防止B站临时更换
      let player = { uri: `${apiLiveOrigin}/api/player?id=cid:${this.roomID}&ts=${Date.now().toString(16)}` }
        , playerXML = await tools.XHR<string>(player)
        , socketServer = 'livecmt-2.bilibili.com'
        , socketPort = 2243
        , wsServer = 'broadcastlv.chat.bilibili.com'
        , wsPort = 2244
        , wssPort = 2245
      if (playerXML != null) {
        let flashServer = playerXML.body.match(/<server>(.+)<\/server>/)
          , dmPort = playerXML.body.match(/<dm_port>(\d+)<\/dm_port>/)
          , dmServer = playerXML.body.match(/<dm_server>(.+)<\/dm_server>/)
          , dmWsPort = playerXML.body.match(/<dm_ws_port>(\d+)<\/dm_ws_port>/)
          , dmWssPort = playerXML.body.match(/<dm_wss_port>(\d+)<\/dm_wss_port>/)
        if (flashServer != null) socketServer = flashServer[1]
        if (dmPort != null) socketPort = parseInt(dmPort[1])
        if (dmServer != null) wsServer = dmServer[1]
        if (dmWsPort != null) wsPort = parseInt(dmWsPort[1])
        if (dmWssPort != null) wssPort = parseInt(dmWssPort[1])
      }
      if (this.protocol === 'socket') {
        this._server = socketServer
        this._port = socketPort
      }
      else {
        this._server = wsServer
        if (this.protocol === 'ws') this._port = wsPort
        if (this.protocol === 'wss') this._port = wssPort
      }
    }
    else {
      this._server = options.server
      this._port = options.port
    }
    this._ClientConnect()
  }
  /**
   * 断开与服务器的连接
   * 
   * @memberof CommentClient
   */
  public Close() {
    clearTimeout(this._Timer)
    if (!this._connected) return
    this._connected = false
    if (this.protocol === 'socket') {
      (<Socket>this._Client).end();
      (<Socket>this._Client).destroy()
    }
    else {
      (<ws>this._Client).close();
      (<ws>this._Client).terminate();
    }
    this._Client.removeAllListeners()
  }
  /**
   * 5分钟后重新连接
   * 
   * @private
   * @memberof CommentClient
   */
  private _DelayReConnect() {
    this.emit('serverError', '尝试重新连接服务器失败')
    this.Close()
    this._Timer = setTimeout(() => {
      this.Connect()
    }, 3e+5) // 5分钟
  }
  /**
   * 客户端连接
   * 
   * @private
   * @memberof CommentClient
   */
  private _ClientConnect() {
    if (this.protocol === 'socket') {
      this._Client = new Socket().connect(this._port, this._server)
      this._Client
        .on('error', this._ClientErrorHandler.bind(this))
        .on('connect', this._ClientConnectHandler.bind(this))
        .on('data', this._ClientDataHandler.bind(this))
        .on('end', this._ClientEndHandler.bind(this))
    }
    else {
      this._Client = new ws(`${this.protocol}://${this._server}:${this._port}/sub`)
      this._Client
        .on('error', this._ClientErrorHandler.bind(this))
        .on('open', this._ClientConnectHandler.bind(this))
        .on('message', this._ClientDataHandler.bind(this))
        .on('close', this._ClientEndHandler.bind(this))
    }
  }
  /**
   * 客户端连接重试
   * 
   * @private
   * @memberof CommentClient
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
        this._ClientConnect()
      }
    }, 3e+3) // 3秒
  }
  /**
   * 客户端错误重连
   * 
   * @private
   * @param {Error} error
   * @memberof CommentClient
   */
  private _ClientErrorHandler(error: Error) {
    this.emit('clientError', error)
    if (!this._connected) return
    this._ClientReConnect()
  }
  /**
   * 服务器断开重连
   * 
   * @private
   * @memberof CommentClient
   */
  private _ClientEndHandler() {
    this.emit('clientEnd', '服务器主动断开')
    if (!this._connected) return
    this._ClientReConnect()
  }
  /**
   * 向服务器发送自定义握手数据
   * 
   * @private
   * @memberof CommentClient
   */
  private _ClientConnectHandler() {
    this._connected = true
    let data = JSON.stringify({ uid: this.userID, roomid: this.roomID, protover: 1 })
    this._ClientSendData(16 + data.length, 16, this.version, 7, 1, data)
    this._ClientTimer()
  }
  /**
   * 心跳包
   * 
   * @private
   * @memberof CommentClient
   */
  private async _ClientTimer() {
    if (!this._connected) return
    if (await this._ClientSendData(16, 16, 1, 2)) {
      this._Timer = setTimeout(() => {
        this._ClientTimer()
      }, 3e+4) // 30秒
    }
    else {
      this.emit('clientHeartError', '心跳失败')
      this._ClientReConnect()
    }
  }
  /**
   * 向服务器发送数据
   * 
   * @private
   * @param {number} totalLen 总长度
   * @param {number} headLen 头部长度
   * @param {number} version 版本
   * @param {number} param4
   * @param {number} [param5=1]
   * @param {string} [data] 数据
   * @returns {Promise<boolean>} 是否发送成功
   * @memberof CommentClient
   */
  private _ClientSendData(totalLen: number, headLen: number, version: number, param4: number, param5 = 1, data?: string): Promise<boolean> {
    var bufferData = Buffer.allocUnsafe(totalLen)
    bufferData.writeUInt32BE(totalLen, 0)
    bufferData.writeUInt16BE(headLen, 4)
    bufferData.writeUInt16BE(version, 6)
    bufferData.writeUInt32BE(param4, 8)
    bufferData.writeUInt32BE(param5, 12)
    if (data) bufferData.write(data, headLen)
    return new Promise<boolean>(resolve => {
      let callback = (error: Error) => {
        if (error) resolve(false)
        else resolve(true)
      }
      if (this.protocol === 'socket') (<Socket>this._Client).write(bufferData, callback)
      else (<ws>this._Client).send(bufferData, callback)
    })
  }
  /**
   * 解析从服务器接收的数据
   * 
   * @private
   * @param {Buffer} data
   * @memberof CommentClient
   */
  private async _ClientDataHandler(data: Buffer) {
    let dataLen = data.length
    if (dataLen < 16 || dataLen > 1048576) return
    let packageLen = data.readUInt32BE(0)
    if (dataLen !== packageLen) return
    // 检查是否压缩
    if (dataLen > 18) {
      let compress = data.readUInt16BE(16)
      if (compress === 30938) {
        let uncompressData = await tools.Uncompress(data.slice(16, dataLen)).catch(tools.Error)
        if (uncompressData != null) {
          data = uncompressData
          dataLen = data.length
          packageLen = data.readUInt32BE(0)
        }
        else {
          this.emit('commentError', '意外的弹幕信息')
          return
        }
      }
    }
    let packageIndex = 0
    while (dataLen - packageIndex >= packageLen) {
      switch (data.readUInt32BE(packageIndex + 8)) {
        case 1:
        case 2:
        case 3:
          this.emit('commentInLine', data.readUInt32BE(packageIndex + 16))
          break
        case 4:
        case 5:
          let dataJson = await tools.JsonParse<danmuJson>(data.toString('UTF-8', packageIndex + 16, packageIndex + packageLen)).catch(tools.Error)
          if (dataJson != null) this._ParseClientData(dataJson)
          else this.emit('commentError', '意外的弹幕信息')
          break
        case 8:
          this.emit('serverSuccess', '服务器连接成功')
          break
        case 17:
          this.emit('serverUpdate', '服务器升级中')
          this._DelayReConnect()
          break
        default:
          break
      }
      packageIndex += packageLen
      packageLen = (dataLen - packageIndex >= 16) ? data.readUInt32BE(packageIndex) : 1048576
      if (packageLen < 16) packageLen = 1048576
    }
  }
  /**
   * 解析消息
   * 
   * @private
   * @param {danmuJson} dataJson
   * @memberof CommentClient
   */
  private _ParseClientData(dataJson: danmuJson) {
    dataJson._roomid = this.roomID
    this.emit('ALL_MSG', dataJson)
    this.emit(dataJson.cmd, dataJson)
  }
}
interface commentClientOptions {
  roomID?: number
  userID?: number
  protocol?: commentClientProtocol
}
type commentClientProtocol = 'socket' | 'ws' | 'wss'