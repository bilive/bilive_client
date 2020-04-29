import ws from 'ws'
import fs from 'fs'
import http from 'http'
import crypto from 'crypto'
import { EventEmitter } from 'events'
import tools from './lib/tools'
import User from './online'
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
  protected _wsClients: Map<string, Map<ws, wsOptions>> = new Map()
  /**
   * 启动HTTP以及WebSocket服务
   *
   * @memberof WebAPI
   */
  public Start() {
    // Websockets服务
    const wsserver = new ws.Server({ noServer: true })
      .on('error', error => tools.ErrorLog('websocket', error))
      .on('connection', (client: ws, req: http.IncomingMessage) => {
        // 限制同时只能连接一个客户端
        const protocol = client.protocol
        if (this._wsClients.has(protocol)) {
          const clients = <Map<ws, wsOptions>>this._wsClients.get(protocol)
          clients.forEach((_option, client) => client.close(1001, JSON.stringify({ cmd: 'close', msg: 'too many connections' })))
          clients.set(client, { protocol, encrypt: false })
        }
        else {
          const clients = new Map([[client, { protocol, encrypt: false }]])
          this._wsClients.set(protocol, clients)
        }
        // 使用Nginx可能需要
        const remoteAddress = req.headers['x-real-ip'] === undefined
          ? `${req.connection.remoteAddress}:${req.connection.remotePort}`
          : `${req.headers['x-real-ip']}:${req.headers['x-real-port']}`
        tools.Log(`${remoteAddress} 已连接`)
        // 使用function可能出现一些问题, 此处无妨
        const onLog = (data: string) => this._Broadcast({ message: { cmd: 'log', ts: 'log', msg: data }, protocol })
        const destroy = () => {
          const clients = this._wsClients.get(protocol)
          if (clients !== undefined) {
            clients.delete(client)
            if (clients.size === 0) this._wsClients.delete(protocol)
          }
          tools.removeListener('log', onLog)
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
          .on('message', async msg => {
            const clients = this._wsClients.get(protocol)
            if (clients !== undefined) {
              const option = clients.get(client)
              if (option !== undefined) {
                let message: message | undefined
                if (typeof msg === 'string') message = await tools.JSONparse<message>(msg)
                else {
                  const aesData = Buffer.from(msg)
                  if (option.encrypt && option.sharedSecret !== undefined)
                    message = await this._Decipher(aesData, option)
                  else message = await tools.JSONparse<message>(aesData.toString())
                }
                if (message !== undefined && message.cmd !== undefined && message.ts !== undefined) this._onCMD({ message, client, option })
                else this._Send({ message: { cmd: 'error', ts: 'error', msg: '消息格式错误' }, client, option })
              }
            }
          })
        // 一般推荐客户端发送心跳, 不过放在服务端的话可以有一些限制 (目前没有)
        const ping = setInterval(() => {
          if (client.readyState === ws.OPEN) client.ping()
          else clearInterval(ping)
        }, 60 * 1000) // 60s为Nginx默认的超时时间
        // 日志
        tools.on('log', onLog)
      })
    // HTTP服务
    // 直接跳转到github.io, 为防以后变更使用302
    const server = http.createServer((req, res) => {
      req.on('error', error => tools.ErrorLog('req', error))
      res.on('error', error => tools.ErrorLog('res', error))
      res.writeHead(302, { 'Location': '//github.halaal.win/bilive_client/' })
      res.end()
    })
      .on('error', error => tools.ErrorLog('http', error))
      .on('upgrade', (request: http.IncomingMessage, socket, head) => {
        const protocolraw = request.headers['sec-websocket-protocol']
        let protocols: string[]
        if (protocolraw === undefined) protocols = []
        else if (typeof protocolraw === 'string') protocols = protocolraw.split(/, ?/)
        else protocols = protocolraw
        const adminProtocol = Options._.server.protocol
        if (protocols[0] === adminProtocol)
          wsserver.handleUpgrade(request, socket, head, ws => {
            wsserver.emit('connection', ws, request)
          })
        else socket.destroy()
      })
    // 监听地址优先支持Unix Domain Socket
    const listen = Options._.server
    if (listen.path === '') {
      const host = process.env.HOST === undefined ? listen.hostname : process.env.HOST
      const port = process.env.PORT === undefined ? listen.port : Number.parseInt(process.env.PORT)
      server.listen(port, host, () => {
        tools.Log(`已监听 ${host}:${port}`)
      })
    }
    else {
      if (fs.existsSync(listen.path)) fs.unlinkSync(listen.path)
      server.listen(listen.path, () => {
        fs.chmodSync(listen.path, '666')
        tools.Log(`已监听 ${listen.path}`)
      })
    }
  }
  /**
   * 监听客户端发来的消息, CMD为关键字
   *
   * @private
   * @param {sendData} { message, client, option }
   * @memberof WebAPI
   */
  private async _onCMD({ message, client, option }: sendData) {
    const cmd = message.cmd
    const ts = message.ts
    switch (cmd) {
      // 协议握手
      case 'hello': {
        const algorithm = message.msg
        switch (algorithm) {
          case 'ECDH-AES-256-GCM':
          case 'ECDH-AES-256-CBC': {
            const clientPublicKeyHex = <string>message.data
            const computeSecret = await this._ComputeSecret(clientPublicKeyHex)
            if (computeSecret !== undefined) {
              const { serverPublicKey, sharedSecret } = computeSecret
              const serverPublicKeyHex = serverPublicKey.toString('hex')
              this._Send({ message: { cmd, ts, msg: algorithm, data: serverPublicKeyHex }, client, option })
              const clients = this._wsClients.get(option.protocol)
              if (clients !== undefined) {
                option.encrypt = true
                option.algorithm = algorithm
                option.sharedSecret = sharedSecret.slice(0, 32)
                clients.set(client, option)
              }
            }
            else this._Send({ message: { cmd, ts, msg: '获取密钥失败' }, client, option })
          }
            break
          default:
            this._Send({ message: { cmd, ts, msg: '未知加密格式' }, client, option })
            break
        }
      }
        break
      // 获取log
      case 'getLog': {
        const data = tools.logs
        this._Send({ message: { cmd, ts, data }, client, option })
      }
        break
      // 获取设置
      case 'getConfig': {
        const data = Options._.config
        this._Send({ message: { cmd, ts, data }, client, option })
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
          this._Send({ message: { cmd, ts, data: config }, client, option })
          if (serverURL !== config.serverURL) Options.emit('clientUpdate')
        }
        else this._Send({ message: { cmd, ts, msg, data: config }, client, option })
      }
        break
      // 获取参数描述
      case 'getInfo': {
        const data = Options._.info
        this._Send({ message: { cmd, ts, data }, client, option })
      }
        break
      // 获取uid
      case 'getAllUID': {
        const data = Object.keys(Options._.user)
        this._Send({ message: { cmd, ts, data }, client, option })
      }
        break
      // 获取用户设置
      case 'getUserData': {
        const user = Options._.user
        const getUID = message.uid
        if (typeof getUID === 'string' && user[getUID] !== undefined) this._Send({ message: { cmd, ts, uid: getUID, data: user[getUID] }, client, option })
        else this._Send({ message: { cmd, ts, msg: '未知用户' }, client, option })
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
          let validate = ''
          let authcode = ''
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
              const newUser = new User(setUID, userData)
              const status = await newUser.Start()
              // 账号会尝试登录, 如果需要验证码status会返回'captcha', 并且验证码会以DataUrl形式保存在captchaJPEG
              if (status === 'captcha') captcha = newUser.captchaJPEG
              // 账号会尝试登录, 如果需要滑动验证码status会返回'validate', 并且链接会以Url字符串形式保存在validateURL
              else if (status === 'validate') validate = newUser.validateURL
              // 账号会尝试登录, 如果需要扫描登录status会返回'authcode', 并且链接会以Url字符串形式保存在authCodeURL
              else if (status === 'authcode') authcode = newUser.authcodeURL
              else if (Options.user.has(setUID)) Options.emit('newUser', newUser)
            }
            else if (userData.status && Options.user.has(setUID)) {
              // 对于已经存在的用户, 可能处在验证码待输入阶段
              const captchaUser = <User>Options.user.get(setUID)
              if (captchaUser.captchaJPEG !== '' && message.captcha !== undefined) {
                // 对于这样的用户尝试使用验证码登录
                captchaUser.captcha = message.captcha
                const status = await captchaUser.Start()
                if (status === 'captcha') captcha = captchaUser.captchaJPEG
                else if (Options.user.has(setUID)) Options.emit('newUser', captchaUser)
              }
              else if (captchaUser.validateURL !== '' && message.validate !== undefined) {
                captchaUser.validate = message.validate
                const status = await captchaUser.Start()
                if (status === 'validate') validate = captchaUser.validateURL
                else if (Options.user.has(setUID)) Options.emit('newUser', captchaUser)
              }
              else if (captchaUser.authcodeURL !== '' && message.authcode !== undefined) {
                const status = await captchaUser.Start()
                if (status === 'authcode') authcode = captchaUser.authcodeURL
                else if (Options.user.has(setUID)) Options.emit('newUser', captchaUser)
              }
            }
            else if (!userData.status && Options.user.has(setUID)) (<User>Options.user.get(setUID)).Stop()
            Options.save()
            if (captcha !== '') this._Send({ message: { cmd, ts, uid: setUID, msg: 'captcha', data: userData, captcha }, client, option })
            else if (validate !== '') this._Send({ message: { cmd, ts, uid: setUID, msg: 'validate', data: userData, validate }, client, option })
            else if (authcode !== '') this._Send({ message: { cmd, ts, uid: setUID, msg: 'authcode', data: userData, authcode }, client, option })
            else this._Send({ message: { cmd, ts, uid: setUID, data: userData }, client, option })
          }
          else this._Send({ message: { cmd, ts, uid: setUID, msg, data: userData }, client, option })
        }
        else this._Send({ message: { cmd, ts, uid: setUID, msg: '未知用户' }, client, option })
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
          this._Send({ message: { cmd, ts, uid: delUID, data: userData }, client, option })
        }
        else this._Send({ message: { cmd, ts, uid: delUID, msg: '未知用户' }, client, option })
      }
        break
      // 新建用户设置
      case 'newUserData': {
        // 虽然不能保证唯一性, 但是这都能重复的话可以去买彩票
        const uid = crypto.randomBytes(16).toString('hex')
        const data = Object.assign({}, Options._.newUserData)
        Options.whiteList.add(uid)
        Options._.user[uid] = data
        Options.save()
        this._Send({ message: { cmd, ts, uid, data }, client, option })
      }
        break
      // 未知命令
      default:
        this._Send({ message: { cmd, ts, msg: '未知命令' }, client, option })
        break
    }
  }
  /**
   * 广播消息
   *
   * @private
   * @param {broadcastData} { message, protocol }
   * @memberof WebAPI
   */
  private _Broadcast({ message, protocol }: broadcastData) {
    const clients = this._wsClients.get(protocol)
    if (clients !== undefined)
      clients.forEach((option, client) => this._Send({ message, client, option }))
  }
  /**
   * 向客户端发送消息
   *
   * @private
   * @param {sendData} { message, client, option }
   * @memberof WebAPI
   */
  private async _Send({ message, client, option }: sendData) {
    const msg = JSON.stringify(message)
    if (client.readyState === ws.OPEN) {
      if (option.encrypt && option.sharedSecret !== undefined) {
        const crypted = await this._Cipher(msg, option)
        if (crypted !== undefined) client.send(crypted)
      }
      else client.send(Buffer.from(msg))
    }
  }
  /**
   * 交换密钥
   *
   * @private
   * @param {string} clientPublicKeyHex
   * @returns {(Promise<{ serverPublicKey: Buffer, sharedSecret: Buffer } | undefined>)}
   * @memberof WebAPI
   */
  private _ComputeSecret(clientPublicKeyHex: string): Promise<{ serverPublicKey: Buffer, sharedSecret: Buffer } | undefined> {
    return new Promise<{ serverPublicKey: Buffer, sharedSecret: Buffer } | undefined>(resolve => {
      const server = crypto.createECDH('secp521r1')
      server.generateKeys()
      const serverPublicKey = server.getPublicKey()
      try {
        const sharedSecret = server.computeSecret(clientPublicKeyHex, 'hex')
        resolve({ serverPublicKey, sharedSecret })
      } catch (error) {
        resolve(undefined)
      }
    })
  }
  /**
   * 加密数据
   *
   * @private
   * @param {string} data
   * @param {wsOptions} option
   * @returns {(Promise<Buffer | undefined>)}
   * @memberof WebAPI
   */
  private _Cipher(data: string, option: wsOptions): Promise<Buffer | undefined> {
    return new Promise<Buffer | undefined>(resolve => {
      switch (option.algorithm) {
        case 'ECDH-AES-256-GCM': {
          const iv = crypto.randomBytes(12)
          try {
            const cipher = crypto.createCipheriv('aes-256-gcm', <Buffer>option.sharedSecret, iv)
            const crypted = Buffer.concat([iv, cipher.update(data), cipher.final(), cipher.getAuthTag()])
            resolve(crypted)
          } catch (error) {
            resolve(undefined)
          }
        }
          break
        case 'ECDH-AES-256-CBC': {
          const iv = crypto.randomBytes(16)
          try {
            const cipher = crypto.createCipheriv('aes-256-cbc', <Buffer>option.sharedSecret, iv)
            const crypted = Buffer.concat([iv, cipher.update(data), cipher.final()])
            resolve(crypted)
          } catch (error) {
            resolve(undefined)
          }
        }
          break
        default:
          resolve(undefined)
          break
      }
    })
  }
  /**
   * 解密数据
   *
   * @private
   * @param {Buffer} data
   * @param {wsOptions} option
   * @returns {(Promise<message | undefined>)}
   * @memberof WebAPI
   */
  private _Decipher(data: Buffer, option: wsOptions): Promise<message | undefined> {
    return new Promise<message | undefined>(resolve => {
      if (data.length < 28) resolve(undefined)
      else {
        switch (option.algorithm) {
          case 'ECDH-AES-256-GCM': {
            const iv = data.slice(0, 12)
            const auth = data.slice(data.length - 16)
            const encrypted = data.slice(12, data.length - 16)
            try {
              const decipher = crypto.createDecipheriv('aes-256-gcm', <Buffer>option.sharedSecret, iv)
              decipher.setAuthTag(auth)
              const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
              const message: message = JSON.parse(decrypted.toString())
              resolve(message)
            } catch (error) {
              resolve(undefined)
            }
          }
            break
          case 'ECDH-AES-256-CBC': {
            const iv = data.slice(0, 16)
            const encrypted = data.slice(16)
            try {
              const decipher = crypto.createDecipheriv('aes-256-cbc', <Buffer>option.sharedSecret, iv)
              const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
              const message: message = JSON.parse(decrypted.toString())
              resolve(message)
            } catch (error) {
              resolve(undefined)
            }
          }
            break
          default:
            resolve(undefined)
            break
        }
      }
    })
  }
}
// WebSocket消息
interface message {
  cmd: string
  ts: string
  msg?: string
  uid?: string
  data?: config | optionsInfo | string | string[] | userData
  captcha?: string
  validate?: string
  authcode?: string
}
interface wsOptions {
  protocol: string
  encrypt: boolean
  algorithm?: string
  sharedSecret?: Buffer
}
interface broadcastData {
  message: message
  protocol: string
}
interface sendData {
  message: message
  client: ws
  option: wsOptions
}
export default WebAPI
export { message }