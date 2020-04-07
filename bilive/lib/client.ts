import ws from 'ws'
import { EventEmitter } from 'events'
import tools from './tools'
/**
 * Blive客户端, 用于连接服务器和发送事件
 *
 * @class Client
 * @extends {EventEmitter}
 */
class Client extends EventEmitter {
  /**
   * Creates an instance of Client.
   * @param {string} server
   * @param {string} protocol
   * @memberof Client
   */
  constructor(server: string, protocol: string) {
    super()
    this._server = server
    this._protocol = protocol
  }
  /**
   * 服务器地址
   *
   * @protected
   * @type {string}
   * @memberof Client
   */
  protected _server: string
  /**
   * protocol
   *
   * @protected
   * @type {string}
   * @memberof Client
   */
  protected _protocol: string
  /**
   * WebSocket客户端
   *
   * @protected
   * @type {ws}
   * @memberof Client
   */
  protected _wsClient!: ws
  /**
   * 是否已经连接到服务器
   *
   * @protected
   * @type {boolean}
   * @memberof Client
   */
  protected _connected: boolean = false
  /**
   * 全局计时器, 负责除心跳超时的其他任务, 便于停止
   *
   * @protected
   * @type {NodeJS.Timer}
   * @memberof Client
   */
  protected _Timer!: NodeJS.Timer
  /**
   * 心跳超时
   *
   * @protected
   * @type {NodeJS.Timer}
   * @memberof Client
   */
  protected _timeout!: NodeJS.Timer
  /**
   * 连接到指定服务器
   *
   * @memberof Client
   */
  public async Connect() {
    if (this._connected) return
    this._connected = true
    const serverTest = await tools.XHR({ url: this._server.replace('wss://', 'https://'), method: 'HEAD' })
    // @ts-ignore d.ts 未更新
    this._wsClient = new ws(this._server, [this._protocol], { servername: serverTest === undefined ? '' : undefined })
    this._wsClient
      .on('error', error => this._ClientErrorHandler(error))
      .on('close', () => this.Close())
      .on('message', (data: string) => this._MessageHandler(data))
      .on('ping', () => this._PingHandler())
    this._PingHandler()
  }
  /**
   * 断开与服务器的连接
   *
   * @memberof Client
   */
  public Close() {
    if (!this._connected) return
    this._connected = false
    clearTimeout(this._timeout)
    this._wsClient.close()
    this._wsClient.terminate()
    this._wsClient.removeAllListeners()
    // 发送关闭消息
    this.emit('close')
  }
  /**
   * 客户端错误
   *
   * @protected
   * @param {Error} error
   * @memberof Client
   */
  protected _ClientErrorHandler(error: Error) {
    this.emit('clientError', error)
    this.Close()
  }
  /**
   * ping/pong
   *
   * @protected
   * @memberof Client
   */
  protected _PingHandler() {
    clearTimeout(this._timeout)
    this._timeout = setTimeout(() => {
      this._ClientErrorHandler(Error('timeout'))
    }, 2 * 60 * 1000)
  }
  /**
   * 解析消息
   *
   * @protected
   * @param {string} data
   * @memberof Client
   */
  protected async _MessageHandler(data: string) {
    const message = await tools.JSONparse<message>(data)
    if (message !== undefined) tools.emit('roomListener', message)
  }
}
export default Client