import ws from 'ws'
import fs from 'fs'
import http from 'http'
import { randomBytes } from 'crypto'
import { EventEmitter } from 'events'
import tools from './lib/tools'
import Daily from './daily'
import Options from './options'
/**
 * 程序设置
 *
 * @class WebAPI
 * @extends {EventEmitter}
 */
class WebAPI extends EventEmitter {
  constructor() {
    super()
  }
  private _wsClient!: ws
  /**
   * 启动HTTP以及WebSocket服务
   *
   * @memberof WebAPI
   */
  public Start() {
    this._HttpServer()
  }
  /**
   * HTTP服务
   *
   * @private
   * @memberof WebAPI
   */
  private _HttpServer() {
    // 直接跳转到github.io, 为防以后变更使用302
    const server = http.createServer((req, res) => {
      req.on('error', error => tools.ErrorLog('req', error))
      res.on('error', error => tools.ErrorLog('res', error))
      res.writeHead(302, { 'Location': '//github.halaal.win/bilive_client/' })
      res.end()
    }).on('error', error => tools.ErrorLog('http', error))
    // 监听地址优先支持Unix Domain Socket
    const listen = Options._.server
    if (listen.path === '') {
      const host = process.env.HOST === undefined ? listen.hostname : process.env.HOST
      const port = process.env.PORT === undefined ? listen.port : Number.parseInt(<string>process.env.PORT)
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
   * @memberof WebAPI
   */
  private _WebSocketServer(server: http.Server) {
    const WSserver = new ws.Server({
      server,
      verifyClient: (info: { origin: string, req: http.IncomingMessage, secure: boolean }) => {
        const protocol = info.req.headers['sec-websocket-protocol']
        const adminProtocol = Options._.server.protocol
        if (protocol === adminProtocol) return true
        else return false
      }
    })
    WSserver.on('error', error => tools.ErrorLog('websocket', error))
      .on('connection', (client: ws, req: http.IncomingMessage) => {
        // 使用Nginx可能需要
        const remoteAddress = req.headers['x-real-ip'] === undefined
          ? `${req.connection.remoteAddress}:${req.connection.remotePort}`
          : `${req.headers['x-real-ip']}:${req.headers['x-real-port']}`
        tools.Log(`${remoteAddress} 已连接`)
        // 限制同时只能连接一个客户端
        if (this._wsClient !== undefined) this._wsClient.close(1001, JSON.stringify({ cmd: 'close', msg: 'too many connections' }))
        // 使用function可能出现一些问题, 此处无妨
        const destroy = () => {
          delete tools.logs.onLog
          client.close()
          client.terminate()
          client.removeAllListeners()
        }
        client
          .on('error', (error) => {
            destroy()
            tools.ErrorLog('client', error)
          })
          .on('close', (code, reason) => {
            destroy()
            tools.Log(`${remoteAddress} 已断开`, code, reason)
          })
          .on('message', async (msg: string) => {
            const message = await tools.JSONparse<message>(msg)
            if (message !== undefined && message.cmd !== undefined && message.ts !== undefined) this._onCMD(message)
            else this._Send({ cmd: 'error', ts: 'error', msg: '消息格式错误' })
          })
        // 一般推荐客户端发送心跳, 不过放在服务端的话可以有一些限制 (目前没有)
        const ping = setInterval(() => {
          if (client.readyState === ws.OPEN) client.ping()
          else clearInterval(ping)
        }, 60 * 1000) // 60s为Nginx默认的超时时间
        this._wsClient = client
        // 日志
        tools.logs.onLog = data => this._Send({ cmd: 'log', ts: 'log', msg: data })
      })
  }
  /**
   * 监听客户端发来的消息, CMD为关键字
   *
   * @private
   * @param {message} message
   * @memberof WebAPI
   */
  private async _onCMD(message: message) {
    const cmd = message.cmd
    const ts = message.ts
    switch (cmd) {
      // 获取log
      case 'getLog': {
        const data = tools.logs.data
        this._Send({ cmd, ts, data })
      }
        break
      // 获取设置
      case 'getConfig': {
        const data = Options._.config
        this._Send({ cmd, ts, data })
      }
        break
      // 保存设置
      case 'setConfig': {
        const config = Options._.config
        const serverURL = config.serverURL
        const setConfig = <config>message.data || {}
        let msg = ''
        for (const i in config) {
          if (typeof config[i] !== typeof setConfig[i]) {
            // 一般都是自用, 做一个简单的验证就够了
            msg = i + '参数错误'
            break
          }
        }
        if (msg === '') {
          // 防止setConfig里有未定义属性, 不使用Object.assign
          for (const i in config) config[i] = setConfig[i]
          Options.save()
          this._Send({ cmd, ts, data: config })
          if (serverURL !== config.serverURL) Options.emit('clientClose')
        }
        else this._Send({ cmd, ts, msg, data: config })
      }
        break
      // 获取参数描述
      case 'getInfo': {
        const data = Options._.info
        this._Send({ cmd, ts, data })
      }
        break
      // 获取uid
      case 'getAllUID': {
        const data = Object.keys(Options._.user)
        this._Send({ cmd, ts, data })
      }
        break
      // 获取用户设置
      case 'getUserData': {
        const user = Options._.user
        const getUID = message.uid
        if (typeof getUID === 'string' && user[getUID] !== undefined) this._Send({ cmd, ts, uid: getUID, data: user[getUID] })
        else this._Send({ cmd, ts, msg: '未知用户' })
      }
        break
      // 保存用户设置
      case 'setUserData': {
        const user = Options._.user
        const setUID = message.uid
        if (setUID !== undefined && user[setUID] !== undefined) {
          const userData = user[setUID]
          const setUserData = <userData>message.data || {}
          let msg = ''
          let captcha = ''
          for (const i in userData) {
            if (typeof userData[i] !== typeof setUserData[i]) {
              msg = i + '参数错误'
              break
            }
          }
          if (msg === '') {
            for (const i in userData) userData[i] = setUserData[i]
            if (userData.status && !Options.user.has(setUID)) {
              // 因为使用了Map保存已激活的用户, 所以需要添加一次
              const newUser = new Daily(setUID, userData)
              const status = await newUser.Start()
              // 账号会尝试登录, 如果需要验证码status会返回'captcha', 并且验证码会以DataUrl形式保存在captchaJPEG
              if (status === 'captcha') captcha = newUser.captchaJPEG
              else if (Options.user.has(setUID)) newUser.daily()
            }
            else if (userData.status && Options.user.has(setUID)) {
              // 对于已经存在的用户, 可能处在验证码待输入阶段
              const captchaUser = <User>Options.user.get(setUID)
              if (captchaUser.captchaJPEG !== '' && message.captcha !== undefined) {
                // 对于这样的用户尝试使用验证码登录
                captchaUser.captcha = message.captcha
                const status = await captchaUser.Start()
                if (status === 'captcha') captcha = captchaUser.captchaJPEG
                else if (Options.user.has(setUID)) captchaUser.daily()
              }
            }
            else if (!userData.status && Options.user.has(setUID)) (<User>Options.user.get(setUID)).Stop()
            Options.save()
            if (captcha === '') this._Send({ cmd, ts, uid: setUID, data: userData })
            else this._Send({ cmd, ts, uid: setUID, msg: 'captcha', data: userData, captcha })
          }
          else this._Send({ cmd, ts, uid: setUID, msg, data: userData })
        }
        else this._Send({ cmd, ts, uid: setUID, msg: '未知用户' })
      }
        break
      // 删除用户设置
      case 'delUserData': {
        const user = Options._.user
        const delUID = message.uid
        if (delUID !== undefined && user[delUID] !== undefined) {
          const userData = user[delUID]
          delete Options._.user[delUID]
          if (Options.user.has(delUID)) (<User>Options.user.get(delUID)).Stop()
          Options.save()
          this._Send({ cmd, ts, uid: delUID, data: userData })
        }
        else this._Send({ cmd, ts, uid: delUID, msg: '未知用户' })
      }
        break
      // 新建用户设置
      case 'newUserData': {
        // 虽然不能保证唯一性, 但是这都能重复的话可以去买彩票
        const uid = randomBytes(16).toString('hex')
        const data = Object.assign({}, Options._.newUserData)
        Options._.user[uid] = data
        Options.save()
        this._Send({ cmd, ts, uid, data })
      }
        break
      // 未知命令
      default:
        this._Send({ cmd, ts, msg: '未知命令' })
        break
    }
  }
  /**
   * 向客户端发送消息
   *
   * @private
   * @param {message} message
   * @memberof WebAPI
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
export default WebAPI
export { message }