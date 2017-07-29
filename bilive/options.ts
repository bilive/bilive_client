import * as ws from 'ws'
import * as http from 'http'
import * as url from 'url'
import * as fs from 'fs'
import * as tools from './lib/tools'
import { EventEmitter } from 'events'
import { config, usersData, userData, rootOrigin, options } from './index'
/**
 * 程序设置
 * 
 * @export
 * @class Options
 * @extends {EventEmitter}
 */
export class Options extends EventEmitter {
  constructor() {
    super()
  }
  private _wsServer: ws.Server
  private _wsClient: ws
  private _http: http.Server
  /**
   * 启动HTTP以及WebSocket服务
   * 
   * @memberof Options
   */
  public Start() {
    this._HttpServer()
  }
  /**
   * WebSocket服务
   * 
   * @private
   * @memberof Options
   */
  private _WebSocketServer() {
    this._wsServer = new ws.Server({ server: this._http })
    this._wsServer
      .on('error', (error) => { tools.Log(error) })
      .on('connection', (client) => {
        if (this._wsClient != null) this._wsClient.close(1001, JSON.stringify({ cmd: 'close', msg: 'too many connections' }))
        client
          .on('error', (error) => { tools.Log(error) })
          .on('message', (message) => {
            let msg: message = JSON.parse(message)
            if (msg.cmd === 'save' && msg.data != null) {
              let config = <config>msg.data
              this.emit('changeOptions', config)
            }
          })
          .send(JSON.stringify({ cmd: 'options', data: options }))
        this._wsClient = client
      })
  }
  /**
   * HTTP服务
   * 
   * @private
   * @memberof Options
   */
  private _HttpServer() {
    this._http = http.createServer((req, res) => {
      let path = url.parse(<string>req.url).path
      let headers: {}
      if (path == null) path = '/view/404.html'
      else if (path === '/') {
        path = '/view/index.html'
        headers = { 'content-type': 'text/html; charset=utf-8' }
      }
      else if (path.includes('/view/')) {
        if (path.includes('.html')) headers = { 'content-type': 'text/html; charset=UTF-8' }
        else if (path.includes('.js')) headers = { 'content-type': 'application/javascript; charset=UTF-8' }
        else if (path.includes('.css')) headers = { 'content-type': 'text/css; charset=UTF-8' }
      }
      else path = '/view/404.html'
      fs.readFile(`${__dirname}${path}`, (error, data) => {
        if (error == null) {
          res.writeHead(200, headers)
          res.write(data)
        }
        else {
          res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
          res.write('404 not found')
        }
        res.end()
      })
    })
    this._http.listen(10080, '127.0.0.1', () => {
      this._WebSocketServer()
      tools.Log(`浏览器打开 http://127.0.0.1:10080 进行设置`)
    })
      .on('error', (error) => { tools.Log(error) })
  }
}
/**
 * 消息格式
 * 
 * @interface message
 */
interface message {
  cmd: string
  msg?: string
  data?: any
}