import * as fs from 'fs'
import * as dns from 'dns'
import * as net from 'net'
import * as http from 'http'
import * as util from 'util'
import * as crypto from 'crypto'
import * as request from 'request'
import { apiLiveOrigin, liveOrigin } from '../index'

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
        'User-Agent': 'Mozilla/5.0 BiliDroid/5.21.0 (bbcallen@gmail.com)'
      }
    case 'WebView':
      return {
        'Accept': 'application/json, text/javascript, */*',
        'Accept-Language': 'zh-CN',
        'Connection': 'keep-alive',
        'Cookie': 'l=v',
        'Origin': liveOrigin,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 7.1.1; E6883 Build/32.4.A.1.54; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/62.0.3202.84 Mobile Safari/537.36 BiliApp/1',
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
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
    // @ts-ignore 此处为d.ts错误
    this.httpAgent.createConnection = (options: net.NetConnectOpts, callback: Function): net.Socket => {
      // @ts-ignore ts对于联合类型的推断还在讨论中
      options.lookup = (hostname, options, callback) => {
        const ip = this.ip
        if (ip === '') return dns.lookup(hostname, options, callback)
        return callback(null, ip, 4)
      }
      return net.createConnection(options, callback)
    }
  }
  public IPs: Set<string> = new Set()
  private __IPiterator: IterableIterator<string> = this.IPs.values()
  public httpAgent = new http.Agent()
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
 */
async function testIP(apiIPs: string[]) {
  const test: Promise<undefined>[] = []
  apiIPs.forEach(ip => {
    const headers = getHeaders('PC')
    headers['host'] = 'api.live.bilibili.com'
    const options = {
      uri: `http://${ip}/`,
      method: 'HEAD',
      timeout: 1000,
      headers
    }
    test.push(new Promise<undefined>(resolve => {
      request(options, (error, response) => {
        if (error === null && response.statusCode === 200) api.IPs.add(ip)
        return resolve(undefined)
      })
    }))
  })
  await Promise.all(test)
  Log('可用ip数量为', api.IPs.size)
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
    if (typeof options.uri === 'string' && options.uri.startsWith(apiLiveOrigin)) options.agent = api.httpAgent
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
 * 操作数据文件, 为了可以快速应用不使用数据库
 * 
 * @param {_options} [options]
 * @returns {Promise<options>}
 */
function Options(options?: _options): Promise<_options> {
  return new Promise(async resolve => {
    const dirname = __dirname + (process.env.npm_package_scripts_start === 'node build/app.js' ? '/../../..' : '/../..')
    const hasDir = fs.existsSync(dirname + '/options/')
    if (!hasDir) fs.mkdirSync(dirname + '/options/')
    const hasFile = fs.existsSync(dirname + '/options/options.json')
    if (!hasFile) fs.copyFileSync(dirname + '/bilive/options.default.json', dirname + '/options/options.json')
    if (options === undefined) {
      const defaultOptionBuffer = fs.readFileSync(dirname + '/bilive/options.default.json')
      const defaultOption = await JSONparse<_options>(defaultOptionBuffer.toString())
      const optionBuffer = fs.readFileSync(dirname + '/options/options.json')
      const option = await JSONparse<_options>(optionBuffer.toString())
      if (defaultOption === undefined || option === undefined) throw new TypeError('文件格式化失败')
      defaultOption.server = Object.assign({}, defaultOption.server, option.server)
      defaultOption.config = Object.assign({}, defaultOption.config, option.config)
      for (const uid in option.user) defaultOption.user[uid] = Object.assign({}
        , defaultOption.newUserData, option.user[uid])
      return resolve(defaultOption)
    }
    else {
      fs.writeFileSync(dirname + '/options/options.json', JSON.stringify(options))
      return resolve(options)
    }
  })
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
export { testIP, XHR, setCookie, getCookie, Options, JSONparse, Hash, Log, logs, ErrorLog, Sleep, response }