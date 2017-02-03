import * as ws from 'ws'
import * as http from 'http'
import * as url from 'url'
import * as fs from 'fs'
import * as tools from './lib/tools'
import { EventEmitter } from 'events'
import { config, usersData, userData, rootOrigin, options } from './index'

export class Options extends EventEmitter {
  constructor() {
    super()
  }
  private _wsServer: ws.Server
  private _wsClient: ws
  private _http: http.Server
  public Start() {
    this._WebSocketServer()
    this._HttpServer()
  }
  private _WebSocketServer() {
    this._wsServer = new ws.Server({
      host: '127.0.0.1',
      port: 10788
    })
    this._wsServer.on('connection', (client) => {
      if (this._wsClient != null) this._wsClient.close(1001, JSON.stringify({ cmd: 'close', msg: 'to many connection' }))
      this._wsClient = client
      this._WebSocketClient()
    })
  }
  private _WebSocketClient() {
    this._wsClient
      .on('message', (message) => {
        let msg: message = JSON.parse(message)
        if (msg.cmd === 'save' && msg.data != null) {
          let config = <config>msg.data
          this.emit('changeOptions', config)
        }
      })
      .on('error', (error) => {
        tools.Log(error)
      })
      .send(JSON.stringify({ cmd: 'options', data: options }))
  }
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
      tools.Log(`浏览器打开 http://127.0.0.1:10080 进行设置`)
    })
  }
}
interface message {
  cmd: string
  msg?: string
  data?: any
}