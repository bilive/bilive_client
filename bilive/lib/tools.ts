import util from 'util'
import crypto from 'crypto'
import request from 'request'
import Options, { liveOrigin, apiVCOrigin, apiLiveOrigin } from '../options'
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
        'User-Agent': 'Mozilla/5.0 BiliDroid/5.30.0 (bbcallen@gmail.com)'
      }
    case 'WebView':
      return {
        'Accept': 'application/json, text/javascript, */*',
        'Accept-Language': 'zh-CN',
        'Connection': 'keep-alive',
        'Cookie': 'l=v',
        'Origin': liveOrigin,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; G8142 Build/47.1.A.12.270; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36 BiliApp/5300000',
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
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
      json: true,
      headers
    }
    test.push(new Promise<undefined>(resolve => {
      request(options, (error, response, body) => {
        if (error === null && response.statusCode === 200 && body.code === 0)
          api.IPs.add(ip)
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
/**
 * 获取短id
 * 
 * @param {number} roomID 
 * @returns {number} 
 */
function getShortRoomID(roomID: number): number {
  return Options.shortRoomID.get(roomID) || roomID
}
/**
 * 获取长id
 * 
 * @param {number} roomID 
 * @returns {number} 
 */
function getLongRoomID(roomID: number): number {
  return Options.longRoomID.get(roomID) || roomID
}
/**
 * 添加request头信息
 * 
 * @template T 
 * @param {request.OptionsWithUri} options 
 * @param {('PC' | 'Android' | 'WebView')} [platform='PC'] 
 * @returns {Promise<response<T> | undefined>} 
 */
function XHR<T>(options: request.OptionsWithUri, platform: 'PC' | 'Android' | 'WebView' = 'PC'): Promise<XHRresponse<T> | undefined> {
  return new Promise<XHRresponse<T> | undefined>(resolve => {
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
  const adminServerChan = Options._.config.adminServerChan
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
export default { testIP, XHR, setCookie, getCookie, getShortRoomID, getLongRoomID, JSONparse, Hash, Log, logs, ErrorLog, sendSCMSG, Sleep }