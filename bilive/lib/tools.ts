import util from 'util'
import crypto from 'crypto'
import got from 'got'
import { CookieJar } from 'tough-cookie'
import { EventEmitter } from 'events'
import { IncomingHttpHeaders } from 'http'
/**
 * 一些工具, 供全局调用
 *
 * @class Tools
 * @extends {EventEmitter}
 */
class Tools extends EventEmitter {
  constructor() {
    super()
    this.on('systemMSG', (data: systemMSG) => this.Log(data.message))
  }
  /**
   * 请求头
   *
   * @param {string} platform
   * @returns {request.Headers}
   * @memberof tools
   */
  public getHeaders(platform: string): IncomingHttpHeaders {
    switch (platform) {
      case 'Android':
        return {
          'Connection': 'Keep-Alive',
          'env': 'prod',
          'User-Agent': 'Mozilla/5.0 BiliDroid/6.10.0 (bbcallen@gmail.com) os/android model/J9110 mobi_app/android build/6100300 channel/master innerVer/6100310 osVer/10 network/2'
        }
      case 'WebView':
        return {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          'Connection': 'keep-alive',
          'Origin': 'https://live.bilibili.com',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; J9110 Build/55.1.A.3.107; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/85.0.4183.120 Mobile Safari/537.36 os/android model/J9110 build/6100300 osVer/10 network/2 BiliApp/6100300 mobi_app/android channel/master innerVer/6100310',
          'X-Requested-With': 'tv.danmaku.bili'
        }
      default:
        return {
          'Accept': 'application/json, text/javascript, */*',
          'Accept-Language': 'zh-CN,zh-TW;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Origin': 'https://live.bilibili.com',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36'
        }
    }
  }
  /**
   * 添加request头信息
   *
   * @template T
   * @param {XHRoptions} options
   * @param {('PC' | 'Android' | 'WebView')} [platform='PC']
   * @returns {(Promise<XHRresponse<T> | undefined>)}
   * @memberof tools
   */
  public async XHR<T>(options: XHRoptions, platform: 'PC' | 'Android' | 'WebView' = 'PC'): Promise<XHRresponse<T> | undefined> {
    // 添加头信息
    const headers = this.getHeaders(platform)
    options.headers = options.headers === undefined ? headers : Object.assign(headers, options.headers)
    if (options.method !== undefined && options.method.toLocaleUpperCase() === 'POST' && options.headers['Content-Type'] === undefined)
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    // got把参数分的太细了, 导致responseType没法确定
    const gotResponse = await got<T>(<import('got').OptionsOfJSONResponseBody>options).catch(error => this.ErrorLog(options.url, error))
    if (gotResponse === undefined) return
    else return { response: gotResponse, body: gotResponse.body }
  }
  /**
   * 获取cookie值
   *
   * @param {CookieJar} jar
   * @param {string} key
   * @param {*} [url=apiLiveOrigin]
   * @returns {string}
   * @memberof tools
   */
  public getCookie(jar: CookieJar, key: string, url = 'https://api.live.bilibili.com'): string {
    const cookies = jar.getCookiesSync(url)
    const cookieFind = cookies.find(cookie => cookie.key === key)
    return cookieFind === undefined ? '' : cookieFind.value
  }
  /**
   * 设置cookie
   *
   * @param {string} cookieString
   * @returns {CookieJar}
   * @memberof tools
   */
  public setCookie(cookieString: string): CookieJar {
    const jar = new CookieJar()
    if (cookieString !== '') cookieString.split(';').forEach(cookie => jar.setCookieSync(`${cookie}; Domain=bilibili.com; Path=/`, 'https://bilibili.com'))
    return jar
  }
  /**
   * 格式化JSON
   *
   * @template T
   * @param {string} text
   * @param {((key: any, value: any) => any)} [reviver]
   * @returns {(Promise<T | undefined>)}
   * @memberof tools
   */
  public JSONparse<T>(text: string, reviver?: ((key: any, value: any) => any)): Promise<T | undefined> {
    return new Promise<T | undefined>(resolve => {
      try {
        const obj = JSON.parse(text, reviver)
        return resolve(obj)
      }
      catch (error) {
        this.ErrorLog('JSONparse', error)
        return resolve()
      }
    })
  }
  /**
   * Hash
   *
   * @param {string} algorithm
   * @param {(string | Buffer)} data
   * @returns {string}
   * @memberof tools
   */
  public Hash(algorithm: string, data: string | Buffer): string {
    return crypto.createHash(algorithm).update(data).digest('hex')
  }
  /**
   * 当前系统时间
   *
   * @returns {string}
   * @memberof Tools
   */
  public Date(): string {
    return new Date().toString().slice(4, 24)
  }
  /**
   * 格式化输出, 配合PM2凑合用
   *
   * @param {...any[]} message
   * @memberof tools
   */
  public Log(...message: any[]) {
    const log = util.format(`${this.Date()} :`, ...message)
    if (this.logs.length > 500) this.logs.shift()
    this.emit('log', log)
    this.logs.push(log)
    console.log(log)
  }
  public logs: string[] = []
  /**
   * 格式化输出, 配合PM2凑合用
   *
   * @param {...any[]} message
   * @memberof tools
   */
  public ErrorLog(...message: any[]) {
    console.error(`${this.Date()} :`, ...message)
  }
  /**
   * sleep
   *
   * @param {number} ms
   * @returns {Promise<'sleep'>}
   * @memberof tools
   */
  public Sleep(ms: number): Promise<'sleep'> {
    return new Promise<'sleep'>(resolve => setTimeout(() => resolve('sleep'), ms))
  }
  /**
   * 极验验证码识别
   *
   * @param {string} ValidateURL
   * @returns {Promise<string>}
   * @memberof tools
   */
  public Validate!: (ValidateURL: string) => Promise<string>
}
export default new Tools()