import fs from 'fs'
import util from 'util'
import crypto from 'crypto'
import request from 'request'
import { liveOrigin, apiVCOrigin, apiLiveOrigin, _options } from '../index'
const FSmkdir = util.promisify(fs.mkdir)
const FSexists = util.promisify(fs.exists)
const FScopyFile = util.promisify(fs.copyFile)
const FSreadFile = util.promisify(fs.readFile)
const FSwriteFile = util.promisify(fs.writeFile)
/**
 * 请求头
 * 
 * @param {string} platform 
 * @returns {request.Headers} 
 */
function getHeaders(platform: string): request.Headers {
  switch (platform) {
    case 'Android':
      return {
        'Connection': 'Keep-Alive',
        'User-Agent': 'Mozilla/5.0 BiliDroid/5.25.0 (bbcallen@gmail.com)'
      }
    case 'WebView':
      return {
        'Accept': 'application/json, text/javascript, */*',
        'Accept-Language': 'zh-CN',
        'Connection': 'keep-alive',
        'Cookie': 'l=v',
        'Origin': liveOrigin,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; G8142 Build/47.1.A.8.49; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/65.0.3325.109 Mobile Safari/537.36 BiliApp/5250000',
        'X-Requested-With': 'tv.danmaku.bili'
      }
    default:
      return {
        'Accept': 'application/json, text/javascript, */*',
        'Accept-Language': 'zh-CN',
        'Connection': 'keep-alive',
        'Cookie': 'l=v',
        'DNT': '1',
        'Origin': liveOrigin,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
      }
  }
}
/**
 * 获取api的ip
 * 
 * @class IP
 */
class IP {
  constructor() {
  }
  public IPs: Set<string> = new Set()
  private __IPiterator: IterableIterator<string> = this.IPs.values()
  public get ip(): string {
    if (this.IPs.size === 0) return ''
    const ip = this.__IPiterator.next()
    if (ip.done) {
      this.__IPiterator = this.IPs.values()
      return this.ip
    }
    return ip.value
  }
}
const api = new IP()
/**
 * 测试可用ip
 * 
 * @param {string[]} apiIPs 
 * @returns {Promise<number>} 
 */
async function testIP(apiIPs: string[]): Promise<number> {
  const test: Promise<undefined>[] = []
  apiIPs.forEach(ip => {
    const headers = getHeaders('PC')
    const options = {
      uri: `${apiLiveOrigin}/ip_service/v1/ip_service/get_ip_addr`,
      proxy: `http://${ip}/`,
      tunnel: false,
      method: 'GET',
      timeout: 2000,
      headers
    }
    test.push(new Promise<undefined>(resolve => {
      request(options, (error, response) => {
        if (error === null && response.statusCode === 200) api.IPs.add(ip)
        return resolve(undefined)
      })
    }))
  })
  Log('正在测试可用ip')
  await Promise.all(test)
  const num = api.IPs.size
  Log('可用ip数量为', num)
  return num
}
const shortRoomID = new Map<number, number>()
const longRoomID = new Map<number, number>()
/**
 * 获取短id
 * 
 * @param {number} roomID 
 * @returns {number} 
 */
function getShortRoomID(roomID: number): number {
  return shortRoomID.get(roomID) || roomID
}
/**
 * 获取长id
 * 
 * @param {number} roomID 
 * @returns {number} 
 */
function getLongRoomID(roomID: number): number {
  return longRoomID.get(roomID) || roomID
}
/**
 * 添加request头信息
 * 
 * @template T 
 * @param {request.OptionsWithUri} options 
 * @param {('PC' | 'Android' | 'WebView')} [platform='PC'] 
 * @returns {Promise<response<T> | undefined>} 
 */
function XHR<T>(options: request.OptionsWithUri, platform: 'PC' | 'Android' | 'WebView' = 'PC')
  : Promise<response<T> | undefined> {
  return new Promise<response<T> | undefined>(resolve => {
    options.gzip = true
    // 添加用户代理
    if (typeof options.uri === 'string' && (options.uri.startsWith(apiLiveOrigin) || options.uri.startsWith(apiVCOrigin))) {
      const ip = api.ip
      if (ip !== '') {
        options.proxy = `http://${ip}/`
        options.tunnel = false
      }
    }
    // 添加头信息
    const headers = getHeaders(platform)
    options.headers = options.headers === undefined ? headers : Object.assign(headers, options.headers)
    if (options.method === 'POST')
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    // 返回异步request
    request(options, (error, response, body) => {
      if (error === null) return resolve({ response, body })
      else {
        const ip = error.address
        if (ip !== undefined && api.IPs.has(ip)) api.IPs.delete(ip)
        ErrorLog(options.uri, error)
        return resolve(undefined)
      }
    })
  })
}
/**
 * 操作数据文件, 为了可以快速应用不使用数据库
 * 
 * @param {_options} [options]
 * @returns {Promise<options>}
 */
function Options(options?: _options): Promise<_options> {
  return new Promise(async resolve => {
    // 根据npm start参数不同设置不同路径
    const dirname = __dirname + (process.env.npm_package_scripts_start === 'node ./build/app.js' ? '/../../..' : '/../..')
    // 检查是否有options目录
    const hasDir = await FSexists(dirname + '/options/')
    if (!hasDir) await FSmkdir(dirname + '/options/')
    if (options === undefined) {
      // 复制默认设置文件到用户设置文件
      const hasFile = await FSexists(dirname + '/options/options.json')
      if (!hasFile) await FScopyFile(dirname + '/bilive/options.default.json', dirname + '/options/options.json')
      // 读取默认设置文件
      const defaultOptionBuffer = await FSreadFile(dirname + '/bilive/options.default.json')
      const defaultOption = await JSONparse<_options>(defaultOptionBuffer.toString())
      // 读取用户设置文件
      const userOptionBuffer = await FSreadFile(dirname + '/options/options.json')
      const userOption = await JSONparse<_options>(userOptionBuffer.toString())
      if (defaultOption === undefined || userOption === undefined) throw new TypeError('文件格式化失败')
      defaultOption.server = Object.assign({}, defaultOption.server, userOption.server)
      defaultOption.config = Object.assign({}, defaultOption.config, userOption.config)
      for (const uid in userOption.user)
        defaultOption.user[uid] = Object.assign({}, defaultOption.newUserData, userOption.user[uid])
      defaultOption.roomList.forEach(([long, short]) => {
        shortRoomID.set(long, short)
        longRoomID.set(short, long)
      })
      return resolve(defaultOption)
    }
    else {
      const blacklist = ['newUserData', 'info', 'apiIPs', 'roomList']
      const error = await FSwriteFile(dirname + '/options/options.json'
        , JSON.stringify(options, (key, value) => blacklist.includes(key) ? undefined : value, 2))
      if (error !== undefined) ErrorLog(error)
      resolve(options)
    }
  })
}
/**
 * 设置cookie
 * 
 * @param {string} cookieString
 * @returns {request.CookieJar}
 */
function setCookie(cookieString: string): request.CookieJar {
  const jar = request.jar()
  cookieString.split(';').forEach(cookie => {
    jar.setCookie(`${cookie}; Domain=bilibili.com; Path=/`, 'https://bilibili.com')
  })
  return jar
}
/**
 * 获取cookie值
 * 
 * @param {request.CookieJar} jar 
 * @param {string} key 
 * @param {string} [url=apiLiveOrigin] 
 * @returns {string} 
 */
function getCookie(jar: request.CookieJar, key: string, url = apiLiveOrigin): string {
  const cookies = jar.getCookies(url)
  const cookieFind = cookies.find(cookie => cookie.key === key)
  return cookieFind === undefined ? '' : cookieFind.value
}
/**
 * 格式化JSON
 * 
 * @template T 
 * @param {string} text 
 * @param {((key: any, value: any) => any)} [reviver] 
 * @returns {Promise<T | undefined>} 
 */
function JSONparse<T>(text: string, reviver?: ((key: any, value: any) => any)): Promise<T | undefined> {
  return new Promise<T | undefined>(resolve => {
    try {
      const obj = JSON.parse(text, reviver)
      return resolve(obj)
    }
    catch (error) {
      ErrorLog('JSONparse', error)
      return resolve(undefined)
    }
  })
}
/**
 * Hash
 * 
 * @param {string} algorithm 
 * @param {(string | Buffer)} data 
 * @returns {string} 
 */
function Hash(algorithm: string, data: string | Buffer): string {
  return crypto.createHash(algorithm).update(data).digest('hex')
}
/**
 * 格式化输出, 配合PM2凑合用
 * 
 * @param {...any[]} message 
 */
function Log(...message: any[]) {
  const log = util.format(`${new Date().toString().slice(4, 24)} :`, ...message)
  if (logs.data.length > 500) logs.data.shift()
  if (typeof logs.onLog === 'function') logs.onLog(log)
  logs.data.push(log)
  console.log(log)
}
const logs: { data: string[], onLog?: (data: string) => void } = {
  data: []
}
/**
 * 格式化输出, 配合PM2凑合用
 * 
 * @param {...any[]} message 
 */
function ErrorLog(...message: any[]) {
  console.error(`${new Date().toString().slice(4, 24)} :`, ...message)
}
/**
 * 发送Server酱消息
 * 
 * @param {string} message 
 */
function sendSCMSG(message: string) {
  const adminServerChan = _options.config.adminServerChan
  if (adminServerChan !== '') {
    const sendtoadmin: request.Options = {
      method: 'POST',
      uri: `https://sc.ftqq.com/${adminServerChan}.send`,
      body: `text=bilive_client&desp=${message}`
    }
    XHR<serverChan>(sendtoadmin)
  }
}
/**
 * sleep
 * 
 * @param {number} ms
 * @returns {Promise<'sleep'>}
 */
function Sleep(ms: number): Promise<'sleep'> {
  return new Promise<'sleep'>(resolve => setTimeout(() => resolve('sleep'), ms))
}
/**
 * XHR返回
 * 
 * @interface response
 * @template T 
 */
interface response<T> {
  response: request.RequestResponse
  body: T
}
export default { testIP, XHR, setCookie, getCookie, Options, getShortRoomID, getLongRoomID, JSONparse, Hash, Log, logs, ErrorLog, sendSCMSG, Sleep }
export { response }