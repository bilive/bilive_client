import { Socket } from 'net'
import { EventEmitter } from 'events'
import { inflate } from 'zlib'
import * as ws from 'ws'
import * as tools from './tools'
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
    let option: { roomID: number, userID: number, protocol: commentClientProtocol } = {
      roomID: 23058,
      userID: 0,
      protocol: 'flash'
    }
    Object.assign(option, options)
    this.roomID = option.roomID
    this.userID = option.userID
    this._protocol = option.protocol
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
   * @readonly
   * @type {commentClientProtocol}
   * @memberof CommentClient
   */
  public get protocol(): commentClientProtocol {
    return this._protocol
  }
  /**
   * 为了避免不必要的麻烦, 禁止外部修改
   * 
   * @private
   * @type {commentClientProtocol}
   * @memberof CommentClient
   */
  private _protocol: commentClientProtocol
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
   * 为了避免不必要的麻烦, 禁止外部修改
   * 
   * @private
   * @type {string}
   * @memberof CommentClient
   */
  private _server: string
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
   * 为了避免不必要的麻烦, 禁止外部修改
   * 
   * @private
   * @type {number}
   * @memberof CommentClient
   */
  private _port: number
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
   * 为了避免不必要的麻烦, 禁止外部修改
   * 
   * @private
   * @type {boolean}
   * @memberof CommentClient
   */
  private _connected: boolean = false
  /**
   * 弹幕消息
   * 
   * @memberof CommentClient
   */
  public onMessage: (data: danmuJson) => void
  /**
   * 客户端版本, 目前为1
   * 
   * @type {number}
   * @memberof CommentClient
   */
  public version: number = 1
  /**
   * 猜测为客户端设备
   * 
   * @readonly
   * @type {(0 | 1)}
   * @memberof CommentClient
   */
  public get driver(): 0 | 1 {
    return this._protocol === 'socket' ? 0 : 1
  }
  /**
   * 重连次数, 以五次为阈值
   * 
   * @type {number}
   * @memberof CommentClient
   */
  public reConnectTime: number = 0
  /**
   * 全局计时器, 负责除心跳超时的其他任务, 便于停止
   * 
   * @private
   * @type {NodeJS.Timer}
   * @memberof CommentClient
   */
  private _Timer: NodeJS.Timer
  /**
   * 心跳超时
   * 
   * @private
   * @type {NodeJS.Timer}
   * @memberof CommentClient
   */
  private _timeout: NodeJS.Timer
  /**
   * 模仿客户端与服务器进行通讯
   * 
   * @private
   * @type {(Socket | ws)}
   * @memberof CommentClient
   */
  private _client: Socket | ws
  /**
   * 连接到指定服务器
   * 
   * @param {{ server: string, port: number }} [options] 
   * @memberof CommentClient
   */
  public async Connect(options?: { server: string, port: number }) {
    if (this._connected) return
    this._connected = true
    if (options == null) {
      // 动态获取服务器地址, 防止B站临时更换
      let player = { uri: `https://api.live.bilibili.com/api/player?id=cid:${this.roomID}&ts=${Date.now().toString(16)}` }
        , playerXML = await tools.XHR<string>(player).catch(error => { this.emit('httpError', error) })
        , socketServer = 'livecmt-2.bilibili.com'
        , socketPort = 2243
        , wsServer = 'broadcastlv.chat.bilibili.com'
        , wsPort = 2244
        , wssPort = 2245
      if (playerXML != null && playerXML.response.statusCode === 200 && playerXML.body != null) {
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
      if (this._protocol === 'socket' || this._protocol === 'flash') {
        this._server = socketServer
        this._port = socketPort
      }
      else {
        this._server = wsServer
        if (this._protocol === 'ws') this._port = wsPort
        if (this._protocol === 'wss') this._port = wssPort
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
    if (this._client == null) return
    this._connected = false
    clearTimeout(this._Timer)
    clearTimeout(this._timeout)
    if (this._protocol === 'socket' || this._protocol === 'flash') {
      (<Socket>this._client).end();
      (<Socket>this._client).destroy()
    }
    else {
      (<ws>this._client).close();
      (<ws>this._client).terminate()
    }
    this._client.removeAllListeners()
  }
  /**
   * 客户端连接
   * 
   * @private
   * @memberof CommentClient
   */
  private _ClientConnect() {
    if (this._protocol === 'socket' || this._protocol === 'flash') {
      this._client = new Socket().connect(this._port, this._server)
      this._client
        .on('error', this._ClientErrorHandler.bind(this))
        .on('connect', this._ClientConnectHandler.bind(this))
        .on('data', this._ClientDataHandler.bind(this))
        .on('end', this._ClientEndHandler.bind(this))
    }
    else {
      this._client = new ws(`${this._protocol}://${this._server}:${this._port}/sub`)
      this._client
        .on('error', this._ClientErrorHandler.bind(this))
        .on('open', this._ClientConnectHandler.bind(this))
        .on('message', this._ClientDataHandler.bind(this))
        .on('close', this._ClientEndHandler.bind(this))
    }
  }
  /**
   * 向服务器发送自定义握手数据
   * 
   * @private
   * @memberof CommentClient
   */
  private _ClientConnectHandler() {
    let data: string
    if (this._protocol === 'socket') data = JSON.stringify({ roomid: this.roomID, uid: this.userID })
    else if (this._protocol === 'flash') data = JSON.stringify({ roomid: this.roomID, uid: this.userID, protover: 2 })
    else data = JSON.stringify({ uid: 0, roomid: this.roomID, protover: 1 })
    this._ClientSendData(16 + data.length, 16, this.version, 7, this.driver, data)
    this._ClientHeart()
  }
  /**
   * 心跳包
   * 
   * @private
   * @memberof CommentClient
   */
  private _ClientHeart() {
    if (!this._connected) return
    let data: string
    if (this._protocol === 'socket') data = JSON.stringify({ roomid: this.roomID, uid: this.userID })
    else if (this._protocol === 'flash') data = ''
    else data = '[object Object]'
    this._timeout = setTimeout(() => {
      this.emit('clientHeartError', '心跳失败')
      this._ClientReConnect()
    }, 1e+4) // 10s
    this._ClientSendData(16 + data.length, 16, this.version, 2, this.driver, data)
    this._Timer = setTimeout(() => {
      this._ClientHeart()
    }, 3e+4) // 30s
  }
  /**
   * 向服务器发送数据
   * 
   * @private
   * @param {number} totalLen 总长度
   * @param {number} [headLen=16] 头部长度
   * @param {any} [version=this.version] 版本
   * @param {number} [type=2] 类型
   * @param {any} [driver=this.driver] 设备
   * @param {string} [data] 数据
   * @memberof CommentClient
   */
  private _ClientSendData(totalLen: number, headLen = 16, version = this.version, type = 2, driver = this.driver, data?: string) {
    let bufferData = Buffer.allocUnsafe(totalLen)
    bufferData.writeUInt32BE(totalLen, 0)
    bufferData.writeUInt16BE(headLen, 4)
    bufferData.writeUInt16BE(version, 6)
    bufferData.writeUInt32BE(type, 8)
    bufferData.writeUInt32BE(driver, 12)
    if (data) bufferData.write(data, headLen)
    if (this._protocol === 'socket' || this._protocol === 'flash') (<Socket>this._client).write(bufferData, )
    else (<ws>this._client).send(bufferData)
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
        let uncompressData = await this._Uncompress(data.slice(16, dataLen)).catch(tools.Error)
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
        case 3:
          this.emit('commentOnLine', data.readUInt32BE(packageIndex + 16))
          clearTimeout(this._timeout)
          break
        case 5:
          let dataJson = await tools.JsonParse<danmuJson>(data.toString('UTF-8', packageIndex + 16, packageIndex + packageLen)).catch(tools.Error)
          if (dataJson != null) this._ParseClientData(dataJson)
          else this.emit('commentError', '意外的弹幕信息')
          break
        case 8:
          this.emit('serverSuccess', '服务器连接成功')
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
   * 解压数据
   * 
   * @private
   * @param {Buffer} data 
   * @returns {Promise<Buffer>} 
   * @memberof CommentClient
   */
  private _Uncompress(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      inflate(data, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
    })
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
    if (typeof this.onMessage === 'function') this.onMessage(dataJson)
    this.emit(dataJson.cmd, dataJson)
    this.emit('ALL_MSG', dataJson)
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
    this._ClientReConnect()
  }
  /**
   * 客户端连接重试
   * 
   * @private
   * @memberof CommentClient
   */
  private _ClientReConnect() {
    if (!this._connected) return
    this.Close()
    this._Timer = setTimeout(() => {
      if (this.reConnectTime >= 5) {
        this.reConnectTime = 0
        this._DelayReConnect()
      }
      else {
        this.reConnectTime++
        this.Connect({ server: this._server, port: this.port })
      }
    }, 3e+3) // 3秒
  }
  /**
   * 5分钟后重新连接
   * 
   * @private
   * @memberof CommentClient
   */
  private _DelayReConnect() {
    this.emit('serverError', '尝试重新连接服务器失败')
    this._Timer = setTimeout(() => {
      this.Connect()
    }, 3e+5) // 5分钟
  }
}
interface commentClientOptions {
  roomID?: number
  userID?: number
  protocol?: commentClientProtocol
}
type commentClientProtocol = 'socket' | 'flash' | 'ws' | 'wss'