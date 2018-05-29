import { Socket } from 'net'
import { inflate } from 'zlib'
import { EventEmitter } from 'events'
import ws from 'ws'
import tools from './tools'
/**
 * 错误类型
 *
 * @enum {number}
 */
enum errorStatus {
  'client',
  'danmaku',
  'timeout',
}
/**
 * 弹幕客户端, 用于连接弹幕服务器和发送弹幕事件
 *
 * @class DMclient
 * @extends {EventEmitter}
 */
class DMclient extends EventEmitter {
  /**
   * Creates an instance of DMclient.
   * @param {Options} [{ roomID = 23058, userID = 0, protocol = 'flash' }={}]
   * @memberof DMclient
   */
  constructor({ roomID = 23058, userID = 0, protocol = 'flash' }: DMclientOptions = {}) {
    super()
    this.roomID = roomID
    this.userID = userID
    this._protocol = protocol
  }
  /**
   * 用户UID
   *
   * @type {number}
   * @memberof DMclient
   */
  public userID: number
  /**
   * 房间号, 注意不要短号
   *
   * @type {number}
   * @memberof DMclient
   */
  public roomID: number
  /**
   * 连接弹幕服务器使用的协议
   * 为了避免不必要的麻烦, 禁止外部修改
   *
   * @protected
   * @type {DMclientProtocol}
   * @memberof DMclient
   */
  protected _protocol: DMclientProtocol
  /**
   * 连接弹幕服务器使用的协议
   *
   * @readonly
   * @type {DMclientProtocol}
   * @memberof DMclient
   */
  public get protocol(): DMclientProtocol {
    return this._protocol
  }
  /**
   * 当前连接的弹幕服务器
   * 为了避免不必要的麻烦, 禁止外部修改
   *
   * @protected
   * @type {string}
   * @memberof DMclient
   */
  protected _server!: string
  /**
   * 当前连接的弹幕服务器
   *
   * @readonly
   * @type {string}
   * @memberof DMclient
   */
  public get server(): string {
    return this._server
  }
  /**
   * 当前连接的弹幕服务器端口
   * 为了避免不必要的麻烦, 禁止外部修改
   *
   * @protected
   * @type {number}
   * @memberof DMclient
   */
  protected _port!: number
  /**
   * 当前连接的弹幕服务器端口
   *
   * @readonly
   * @type {number}
   * @memberof DMclient
   */
  public get port(): number {
    return this._port
  }
  /**
   * 是否已经连接到服务器
   * 为了避免不必要的麻烦, 禁止外部修改
   *
   * @protected
   * @type {boolean}
   * @memberof DMclient
   */
  protected _connected: boolean = false
  /**
   * 是否已经连接到服务器
   *
   * @readonly
   * @type {boolean}
   * @memberof DMclient
   */
  public get connected(): boolean {
    return this._connected
  }
  /**
   * 客户端版本, 目前为1
   *
   * @type {number}
   * @memberof DMclient
   */
  public version: number = 1
  /**
   * 猜测为客户端设备
   *
   * @readonly
   * @type {(0 | 1)}
   * @memberof DMclient
   */
  public get driver(): 0 | 1 {
    return this._protocol === 'socket' ? 0 : 1
  }
  /**
   * 全局计时器, 负责除心跳超时的其他任务, 便于停止
   *
   * @protected
   * @type {NodeJS.Timer}
   * @memberof DMclient
   */
  protected _Timer!: NodeJS.Timer
  /**
   * 心跳超时
   *
   * @protected
   * @type {NodeJS.Timer}
   * @memberof DMclient
   */
  protected _timeout!: NodeJS.Timer
  /**
   * 模仿客户端与服务器进行通讯
   *
   * @protected
   * @type {(Socket | ws)}
   * @memberof DMclient
   */
  protected _client!: Socket | ws
  /**
   * 缓存数据
   *
   * @private
   * @type {Buffer}
   * @memberof DMclient
   */
  private __data!: Buffer
  /**
   * 错误类型
   *
   * @static
   * @type {typeof errorStatus}
   * @memberof DMclient
   */
  public static readonly errorStatus: typeof errorStatus = errorStatus
  /**
   * 连接到指定服务器
   *
   * @param {{ server: string, port: number }} [options]
   * @memberof DMclient
   */
  public async Connect(options?: { server: string, port: number }) {
    if (this._connected) return
    this._connected = true
    if (options === undefined) {
      // 动态获取服务器地址, 防止B站临时更换
      const player = { uri: `https://api.live.bilibili.com/api/player?id=cid:${this.roomID}&ts=${Date.now().toString(16)}` }
      const playerXML = await tools.XHR<string>(player)
      let socketServer = 'livecmt-2.bilibili.com'
      let socketPort = 2243
      let wsServer = 'broadcastlv.chat.bilibili.com'
      let wsPort = 2244
      let wssPort = 2245
      if (playerXML !== undefined && playerXML.response.statusCode === 200) {
        const flashServer = playerXML.body.match(/<server>(.+)<\/server>/)
        const dmPort = playerXML.body.match(/<dm_port>(\d+)<\/dm_port>/)
        const dmServer = playerXML.body.match(/<dm_server>(.+)<\/dm_server>/)
        const dmWsPort = playerXML.body.match(/<dm_ws_port>(\d+)<\/dm_ws_port>/)
        const dmWssPort = playerXML.body.match(/<dm_wss_port>(\d+)<\/dm_wss_port>/)
        if (flashServer !== null) socketServer = flashServer[1]
        if (dmPort !== null) socketPort = Number.parseInt(dmPort[1])
        if (dmServer !== null) wsServer = dmServer[1]
        if (dmWsPort !== null) wsPort = Number.parseInt(dmWsPort[1])
        if (dmWssPort !== null) wssPort = Number.parseInt(dmWssPort[1])
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
   * @memberof DMclient
   */
  public Close() {
    if (this._client === undefined) return
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
    // 发送关闭消息
    this.emit('close')
  }
  /**
   * 客户端连接
   *
   * @protected
   * @memberof DMclient
   */
  protected _ClientConnect() {
    if (this._protocol === 'socket' || this._protocol === 'flash') {
      this._client = new Socket().connect(this._port, this._server)
        .on('connect', () => this._ClientConnectHandler())
        .on('data', data => this._ClientDataHandler(data))
        .on('end', () => this.Close())
    }
    else {
      this._client = new ws(`${this._protocol}://${this._server}:${this._port}/sub`)
        .on('open', () => this._ClientConnectHandler())
        .on('message', (data: Buffer) => this._ClientDataHandler(data))
        .on('close', () => this.Close())
    }
    this._client.on('error', error => {
      const errorInfo: DMclientError = { status: errorStatus.client, error: error }
      this._ClientErrorHandler(errorInfo)
    })
  }
  /**
   * 客户端错误
   *
   * @protected
   * @param {DMerror} errorInfo
   * @memberof DMclient
   */
  protected _ClientErrorHandler(errorInfo: DMerror) {
    // 'error' 为关键词, 为了避免麻烦不使用
    this.emit('DMerror', errorInfo)
    if (errorInfo.status !== DMclient.errorStatus.danmaku) this.Close()
  }
  /**
   * 向服务器发送自定义握手数据
   *
   * @protected
   * @memberof DMclient
   */
  protected _ClientConnectHandler() {
    let data: string
    if (this._protocol === 'socket')
      data = JSON.stringify({ uid: this.userID, roomid: this.roomID })
    else if (this._protocol === 'flash')
      data = JSON.stringify({ roomid: this.roomID, uid: this.userID, protover: 2, platform: 'flash', clientver: '2.1.8-02af452c' })
    else data = JSON.stringify({ uid: 0, roomid: this.roomID, protover: 1, platform: 'web', clientver: '1.2.5' })
    this._Timer = setTimeout(() => this._ClientHeart(), 30 * 1000)
    this._ClientSendData(16 + data.length, 16, this.version, 7, this.driver, data)
  }
  /**
   * 心跳包
   *
   * @protected
   * @memberof DMclient
   */
  protected _ClientHeart() {
    if (!this._connected) return
    let data: string
    if (this._protocol === 'socket') data = JSON.stringify({ uid: this.userID, roomid: this.roomID })
    else if (this._protocol === 'flash') data = ''
    else data = '[object Object]'
    this._timeout = setTimeout(() => {
      const errorInfo: DMclientError = { status: errorStatus.timeout, error: new Error('心跳超时') }
      this._ClientErrorHandler(errorInfo)
    }, 10 * 1000)
    this._Timer = setTimeout(() => this._ClientHeart(), 30 * 1000)
    this._ClientSendData(16 + data.length, 16, this.version, 2, this.driver, data)
  }
  /**
   * 向服务器发送数据
   *
   * @protected
   * @param {number} totalLen 总长度
   * @param {number} [headLen=16] 头部长度
   * @param {any} [version=this.version] 版本
   * @param {number} [type=2] 类型
   * @param {any} [driver=this.driver] 设备
   * @param {string} [data] 数据
   * @memberof DMclient
   */
  protected _ClientSendData(totalLen: number, headLen = 16
    , version = this.version, type = 2, driver = this.driver, data?: string) {
    const bufferData = Buffer.allocUnsafe(totalLen)
    bufferData.writeInt32BE(totalLen, 0)
    bufferData.writeInt16BE(headLen, 4)
    bufferData.writeInt16BE(version, 6)
    bufferData.writeInt32BE(type, 8)
    bufferData.writeInt32BE(driver, 12)
    if (data) bufferData.write(data, headLen)
    if (this._protocol === 'socket' || this._protocol === 'flash') (<Socket>this._client).write(bufferData, )
    else (<ws>this._client).send(bufferData)
  }
  /**
   * 解析从服务器接收的数据
   * 抛弃循环, 使用递归
   *
   * @protected
   * @param {Buffer} data
   * @memberof DMclient
   */
  protected async _ClientDataHandler(data: Buffer) {
    // 拼接数据
    if (this.__data !== undefined) {
      // 把数据合并到缓存
      this.__data = Buffer.concat([this.__data, data])
      const dataLen = this.__data.length
      const packageLen = this.__data.readInt32BE(0)
      if (dataLen >= packageLen) {
        data = this.__data
        delete this.__data
      }
      else return
    }
    // 读取数据
    const dataLen = data.length
    if (dataLen < 16 || dataLen > 0x100000) {
      // 抛弃长度过短和过长的数据
      const errorInfo: DMdanmakuError = { status: errorStatus.danmaku, error: new TypeError('数据长度异常'), data }
      return this._ClientErrorHandler(errorInfo)
    }
    const packageLen = data.readInt32BE(0)
    if (packageLen < 16 || packageLen > 0x100000) {
      // 抛弃包长度异常的数据
      const errorInfo: DMdanmakuError = { status: errorStatus.danmaku, error: new TypeError('包长度异常'), data }
      return this._ClientErrorHandler(errorInfo)
    }
    // 等待拼接数据
    if (dataLen < packageLen) return this.__data = data
    // 数据长度20时为在线人数
    if (dataLen > 20) {
      const compress = data.readInt16BE(16)
      if (compress === 0x78DA) {
        // 检查是否压缩, 目前来说压缩格式固定
        const uncompressData = await this._Uncompress(data.slice(16, packageLen))
        if (uncompressData !== undefined) {
          this._ClientDataHandler(uncompressData)
          if (dataLen > packageLen) this._ClientDataHandler(data.slice(packageLen))
          return
        }
        else {
          // 直接抛弃解压失败的数据
          const errorInfo: DMdanmakuError = { status: errorStatus.danmaku, error: new TypeError('解压数据失败'), data }
          return this._ClientErrorHandler(errorInfo)
        }
      }
    }
    this._ParseClientData(data.slice(0, packageLen))
    if (dataLen > packageLen) this._ClientDataHandler(data.slice(packageLen))
  }
  /**
   * 解析消息
   *
   * @protected
   * @param {Buffer} data
   * @memberof DMclient
   */
  protected async _ParseClientData(data: Buffer) {
    switch (data.readInt32BE(8)) {
      case 3:
        // 每次发送心跳包都会接收到此类消息, 所以用来判断是否超时
        clearTimeout(this._timeout)
        this.emit('online', data.readInt32BE(16))
        break
      case 5: {
        const dataJson = await tools.JSONparse<danmuJson>(data.toString('UTF-8', 16))
        if (dataJson !== undefined) this._ClientData(dataJson)
        else {
          // 格式化消息失败则跳过
          const errorInfo: DMdanmakuError = { status: errorStatus.danmaku, error: new TypeError('意外的弹幕信息'), data }
          this._ClientErrorHandler(errorInfo)
        }
      }
        break
      case 8:
        this.emit('connect')
        break
      default: {
        const errorInfo: DMdanmakuError = { status: errorStatus.danmaku, error: new TypeError('未知的弹幕内容'), data }
        this._ClientErrorHandler(errorInfo)
      }
        break
    }
  }
  /**
   * 发送消息事件
   *
   * @protected
   * @param {danmuJson} dataJson
   * @memberof DMclient
   */
  protected _ClientData(dataJson: danmuJson) {
    dataJson._roomid = this.roomID
    this.emit('ALL_MSG', dataJson)
    this.emit(dataJson.cmd, dataJson)
    //tools.Log(dataJson)
  }
  /**
   * 解压数据
   *
   * @protected
   * @param {Buffer} data
   * @returns {Promise<Buffer | undefined>}
   * @memberof DMclient
   */
  protected _Uncompress(data: Buffer): Promise<Buffer | undefined> {
    return new Promise<Buffer>(resolve => {
      inflate(data, (error, result) => {
        if (error === null) return resolve(result)
        else {
          tools.ErrorLog(data, error)
          return resolve(undefined)
        }
      })
    })
  }
}
interface DMclientOptions {
  roomID?: number
  userID?: number
  protocol?: DMclientProtocol
}
type DMclientProtocol = 'socket' | 'flash' | 'ws' | 'wss'
type DMerror = DMclientError | DMdanmakuError
interface DMclientError {
  status: errorStatus.client | errorStatus.timeout
  error: Error
}
interface DMdanmakuError {
  status: errorStatus.danmaku
  error: TypeError
  data: Buffer
}
export default DMclient
export { DMclientOptions, DMclientProtocol, DMerror, DMclientError, DMdanmakuError }
