import * as ws from 'ws'
import * as fs from 'fs'
import * as http from 'http'
import { randomBytes } from 'crypto'
import * as tools from './lib/tools'
import { EventEmitter } from 'events'
import { User } from './user'
import { _options, _user } from './index'
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
  /**
   * 启动HTTP以及WebSocket服务
   * 
   * @memberof Options
   */
  public Start() {
    this._HttpServer()
  }
  /**
   * HTTP服务
   * 
   * @private
   * @memberof Options
   */
  private _HttpServer() {
    let server = http.createServer((req, res) => {
      req.on('error', tools.Error)
      res.on('error', tools.Error)
      res.writeHead(302, { 'Location': '//lzghzr.github.io/bilive_client_view/index.html' })
      res.end()
    })
    server.on('error', tools.Error)
    let listen = _options.server
    if (listen.path === '') {
      let host = process.env.HOST == null ? listen.hostname : process.env.HOST
        , port = process.env.PORT == null ? listen.port : parseInt(<string>process.env.PORT)
      server.listen(port, host, () => {
        this._WebSocketServer(server)
        tools.Log(`已监听 ${host}:${port}`)
      })
    }
    else {
      if (fs.existsSync(listen.path)) fs.unlinkSync(listen.path)
      server.listen(listen.path, () => {
        fs.chmodSync(listen.path, '666')
        this._WebSocketServer(server)
        tools.Log(`已监听 ${listen.path}`)
      })
    }
  }
  /**
   * WebSocket服务
   * 
   * @private
   * @param {http.Server} server 
   * @memberof Options
   */
  private _WebSocketServer(server: http.Server) {
    this._wsServer = new ws.Server({
      server,
      handleProtocols: (protocols: string[]) => {
        let protocol = _options.server.protocol
        if (protocol === protocols[0]) return protocols[1] || protocol
        else return false
      }
    })
    this._wsServer
      .on('error', tools.Error)
      .on('connection', (client: ws, req: http.IncomingMessage) => {
        let remoteAddress = req.headers['x-real-ip'] == null ? `${req.connection.remoteAddress}:${req.connection.remotePort}` : `${req.headers['x-real-ip']}:${req.headers['x-real-port']}`
        tools.Log(`${remoteAddress} 已连接`)
        if (this._wsClient != null) this._wsClient.close(1001, JSON.stringify({ cmd: 'close', msg: 'too many connections' }))
        let destroy = () => {
          delete tools.logs.onLog
          client.close()
          client.terminate()
          client.removeAllListeners()
        }
        client
          .on('error', (error) => {
            destroy()
            tools.Error(error)
          })
          .on('close', (code, reason) => {
            destroy()
            tools.Log(`${remoteAddress} 已断开`, code, reason)
          })
          .on('message', async (msg: string) => {
            let message = await tools.JsonParse<message>(msg).catch(tools.Error)
            if (message != null && message.cmd != null && message.ts != null) this._onCMD(message)
            else this._Send({ cmd: 'error', ts: 'error', msg: '消息格式错误' })
          })
        if (client.protocol === 'keep') {
          let ping = setInterval(() => {
            if (client.readyState === ws.OPEN) client.ping()
            else clearInterval(ping)
          }, 6e+4) // 60秒
        }
        this._wsClient = client
        // 日志
        tools.logs.onLog = data => this._Send({ cmd: 'log', ts: 'log', msg: data })
      })
  }
  private async _onCMD(message: message) {
    let cmd = message.cmd
      , ts = message.ts
    // 获取log
    if (cmd === 'getLog') {
      let data = tools.logs.data
      this._Send({ cmd, ts, data })
    }
    // 获取设置
    else if (cmd === 'getConfig') {
      let data = _options.config
      this._Send({ cmd, ts, data })
    }
    // 保存设置
    else if (cmd === 'setConfig') {
      let config = _options.config
        , msg = ''
        , setConfig = <config>message.data || {}
      for (let i in config) {
        if (typeof config[i] !== typeof setConfig[i]) {
          msg = i + '参数错误'
          break
        }
      }
      if (msg === '') {
        for (let i in config) config[i] = setConfig[i]
        tools.Options(_options)
        this._Send({ cmd, ts, data: config })
      }
      else this._Send({ cmd, ts, msg, data: config })
    }
    // 获取参数描述
    else if (cmd === 'getInfo') {
      let data = _options.info
      this._Send({ cmd, ts, data })
    }
    // 获取uid
    else if (cmd === 'getAllUID') {
      let data = Object.keys(_options.user)
      this._Send({ cmd, ts, data })
    }
    // 获取用户设置
    else if (cmd === 'getUserData') {
      let user = _options.user
        , getUID = message.uid
      if (typeof getUID === 'string' && user[getUID] != null) this._Send({ cmd, ts, uid: getUID, data: user[getUID] })
      else this._Send({ cmd, ts, msg: '未知用户' })
    }
    // 保存用户设置
    else if (cmd === 'setUserData') {
      let user = _options.user
        , setUID = message.uid
      if (setUID != null && user[setUID] != null) {
        let userData = user[setUID]
          , msg = ''
          , captcha = ''
          , setUserData = <userData>message.data || {}
        for (let i in userData) {
          if (typeof userData[i] !== typeof setUserData[i]) {
            msg = i + '参数错误'
            break
          }
        }
        if (msg === '') {
          for (let i in userData) userData[i] = setUserData[i]
          if (userData.status && !_user.has(setUID)) {
            let newUser = new User(setUID, userData)
              , status = await newUser.Start()
            if (status === 'captcha') captcha = newUser.captchaJPEG
            else if (_user.has(setUID)) newUser.daily()
          }
          else if (userData.status && _user.has(setUID)) {
            let captchaUser = <User>_user.get(setUID)
            if (captchaUser.captchaJPEG !== '' && message.captcha != null) {
              captchaUser.captcha = message.captcha
              let status = await captchaUser.Start()
              if (status === 'captcha') captcha = captchaUser.captchaJPEG
              else if (_user.has(setUID)) captchaUser.daily()
            }
          }
          else if (!userData.status && _user.has(setUID)) (<User>_user.get(setUID)).Stop()
          tools.Options(_options)
          if (captcha === '') this._Send({ cmd, ts, uid: setUID, data: userData })
          else this._Send({ cmd, ts, uid: setUID, msg: 'captcha', data: userData, captcha })
        }
        else this._Send({ cmd, ts, uid: setUID, msg, data: userData })
      }
      else this._Send({ cmd, ts, uid: setUID, msg: '未知用户' })
    }
    // 删除用户设置
    else if (cmd === 'delUserData') {
      let user = _options.user
        , delUID = message.uid
      if (delUID != null && user[delUID] != null) {
        let userData = user[delUID]
        delete _options.user[delUID]
        if (_user.has(delUID)) (<User>_user.get(delUID)).Stop()
        tools.Options(_options)
        this._Send({ cmd, ts, uid: delUID, data: userData })
      }
      else this._Send({ cmd, ts, uid: delUID, msg: '未知用户' })
    }
    // 新建用户设置
    else if (cmd === 'newUserData') {
      let uid = randomBytes(16).toString('hex')
        , data = Object.assign({}, _options.newUserData)
      _options.user[uid] = data
      tools.Options(_options)
      this._Send({ cmd, ts, uid, data })
    }
    else this._Send({ cmd, ts, msg: '未知命令' })
  }
  /**
   * 向客户端发送消息
   * 
   * @private
   * @param {message} message 
   * @memberof Options
   */
  private _Send(message: message) {
    if (this._wsClient.readyState === ws.OPEN) this._wsClient.send(JSON.stringify(message))
  }
}
// WebSocket消息
interface message {
  cmd: string
  ts: string
  msg?: string
  uid?: string
  data?: config | optionsInfo | string[] | userData
  captcha?: string
}