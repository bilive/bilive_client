import util from 'util'
import crypto from 'crypto'
import request from 'request'
import { EventEmitter } from 'events'
import Options, { liveOrigin, apiLiveOrigin } from '../options'
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
  public getHeaders(platform: string): request.Headers {
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
   * 添加request头信息
   *
   * @template T
   * @param {request.OptionsWithUri} options
   * @param {('PC' | 'Android' | 'WebView')} [platform='PC']
   * @returns {(Promise<XHRresponse<T> | undefined>)}
   * @memberof tools
   */
  public XHR<T>(options: request.OptionsWithUri, platform: 'PC' | 'Android' | 'WebView' = 'PC'): Promise<XHRresponse<T> | undefined> {
    return new Promise<XHRresponse<T> | undefined>(resolve => {
      options.gzip = true
      // 添加头信息
      const headers = this.getHeaders(platform)
      options.headers = options.headers === undefined ? headers : Object.assign(headers, options.headers)
      if (options.method === 'POST' && options.headers['Content-Type'] === undefined)
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
      // 返回异步request
      request(options, (error, response, body) => {
        if (error === null) resolve({ response, body })
        else {
          this.ErrorLog(options.uri, error)
          resolve()
        }
      })
    })
  }
  /**
   * 获取cookie值
   *
   * @param {request.CookieJar} jar
   * @param {string} key
   * @param {*} [url=apiLiveOrigin]
   * @returns {string}
   * @memberof tools
   */
  public getCookie(jar: request.CookieJar, key: string, url = apiLiveOrigin): string {
    const cookies = jar.getCookies(url)
    const cookieFind = cookies.find(cookie => cookie.key === key)
    return cookieFind === undefined ? '' : cookieFind.value
  }
  /**
   * 设置cookie
   *
   * @param {string} cookieString
   * @returns {request.CookieJar}
   * @memberof tools
   */
  public setCookie(cookieString: string): request.CookieJar {
    const jar = request.jar()
    cookieString.split(';').forEach(cookie => {
      jar.setCookie(`${cookie}; Domain=bilibili.com; Path=/`, 'https://bilibili.com')
    })
    return jar
  }
  /**
   * 获取短id
   *
   * @param {number} roomID
   * @returns {number}
   * @memberof tools
   */
  public getShortRoomID(roomID: number): number {
    return Options.shortRoomID.get(roomID) || roomID
  }
  /**
   * 获取长id
   *
   * @param {number} roomID
   * @returns {number}
   * @memberof tools
   */
  public getLongRoomID(roomID: number): number {
    return Options.longRoomID.get(roomID) || roomID
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
   * 为了兼容旧版
   *
   * @param {string} message
   * @returns {void}
   * @memberof Tools
   */
  public sendSCMSG!: (message: string) => void
  /**
   * 验证码识别
   *
   * @param {string} captchaJPEG
   * @returns {Promise<string>}
   * @memberof tools
   */
  public Captcha!: (captchaJPEG: string) => Promise<string>
}
export default new Tools()