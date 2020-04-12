import crypto from 'crypto'
import { CookieJar } from 'tough-cookie'
import tools from './tools'
import { IncomingHttpHeaders } from 'http'
/**
 * 登录状态
 *
 * @enum {number}
 */
enum appStatus {
  'success',
  'captcha',
  'error',
  'httpError',
}
/**
 * Creates an instance of AppClient.
 *
 * @class AppClient
 */
class AppClient {
  /**
   * Creates an instance of AppClient.
   * @memberof AppClient
   */
  constructor() {
    this.headers['APP-KEY'] = AppClient.mobiApp
    this.headers['Buvid'] = AppClient.buvid
    this.headers['Device-ID'] = AppClient.deviceId
  }
  public static readonly actionKey: string = 'appkey'
  // bilibili 客户端
  protected static readonly __secretKey: string = '560c52ccd288fed045859ed18bffd973'
  public static readonly appKey: string = '1d8b6e7d45233436'
  public static readonly biliLocalId: string = AppClient.RandomID(64)
  public static readonly build: string = '5570300'
  public static readonly buvid: string = AppClient.RandomID(37).toLocaleUpperCase()
  public static readonly channel: string = 'bili'
  public static readonly device: string = 'phone'
  public static readonly deviceId: string = AppClient.biliLocalId
  public static readonly deviceName: string = 'SonyJ9110'
  public static readonly devicePlatform: string = 'Android10SonyJ9110'
  public static readonly localId: string = AppClient.buvid
  public static readonly mobiApp: string = 'android'
  public static readonly platform: string = 'android'

  // bilibili 国际版
  // private static readonly __secretKey: string = '36efcfed79309338ced0380abd824ac1'
  // public static readonly appKey: string = 'bb3101000e232e27'
  // public static readonly build: string = '112000'
  // public static readonly mobiApp: string = 'android_i'

  // bilibili 概念版
  // private static readonly __secretKey: string = '25bdede4e1581c836cab73a48790ca6e'
  // public static readonly appKey: string = '07da50c9a0bf829f'
  // public static readonly build: string = '591204'
  // public static readonly mobiApp: string = 'android_b'

  // bilibili TV
  // private static readonly __secretKey: string = '59b43e04ad6965f34319062b478f83dd'
  // public static readonly appKey: string = '4409e2ce8ffd12b8'
  // public static readonly biliLocalId: string = AppClient.RandomID(20)
  // public static readonly build: string = '102401'
  // public static readonly buvid: string = AppClient.RandomID(37)
  // public static readonly channel: string = 'master'
  // public static readonly device: string = 'Sony'
  // public static readonly deviceId: string = AppClient.biliLocalId
  // public static readonly deviceName: string = 'J9110'
  // public static readonly devicePlatform: string = 'Android10SonyJ9110'
  // public static readonly fingerprint: string = AppClient.RandomID(62)
  // public static readonly guid: string = AppClient.buvid
  // public static readonly localFingerprint: string = AppClient.fingerprint
  // public static readonly localId: string = AppClient.buvid
  // public static readonly mobiApp: string = 'android_tv_yst'
  // public static readonly networkstate: string = 'wifi'

  // bilibili link
  // private static readonly __secretKey: string = 'e988e794d4d4b6dd43bc0e89d6e90c43'
  // public static readonly appKey: string = '37207f2beaebf8d7'
  // public static readonly build: string = '3900007'
  // public static readonly mobiApp: string = 'biliLink'
  // public static readonly platform: string = 'android_link'
  /**
   * 谜一样的TS
   *
   * @readonly
   * @static
   * @type {number}
   * @memberof AppClient
   */
  public static get TS(): number {
    return Math.floor(Date.now() / 1000)
  }
  /**
   * 谜一样的RND
   *
   * @readonly
   * @static
   * @type {number}
   * @memberof AppClient
   */
  public static get RND(): number {
    return AppClient.RandomNum(9)
  }
  /**
   * 谜一样的RandomNum
   *
   * @static
   * @param {number} length
   * @returns {number}
   * @memberof AppClient
   */
  public static RandomNum(length: number): number {
    const words = '0123456789'
    let randomNum = ''
    randomNum += words[Math.floor(Math.random() * 9) + 1]
    for (let i = 0; i < length - 1; i++) randomNum += words[Math.floor(Math.random() * 10)]
    return +randomNum
  }
  /**
   * 谜一样的RandomID
   *
   * @static
   * @param {number} length
   * @returns {string}
   * @memberof AppClient
   */
  public static RandomID(length: number): string {
    const words = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let randomID = ''
    randomID += words[Math.floor(Math.random() * 61) + 1]
    for (let i = 0; i < length - 1; i++) randomID += words[Math.floor(Math.random() * 62)]
    return randomID
  }
  /**
   * 基本请求参数
   *
   * @readonly
   * @static
   * @type {string}
   * @memberof AppClient
   */
  public static get baseQuery(): string {
    return `actionKey=${this.actionKey}&appkey=${this.appKey}&build=${this.build}\
&device=${this.device}&mobi_app=${this.mobiApp}&platform=${this.platform}`
  }
  /**
   * 对参数签名
   *
   * @static
   * @param {string} params
   * @param {boolean} [ts=true]
   * @returns {string}
   * @memberof AppClient
   */
  public static signQuery(params: string, ts = true): string {
    let paramsSort = params
    if (ts) paramsSort = `${params}&ts=${this.TS}`
    paramsSort = paramsSort.split('&').sort().join('&')
    const paramsSecret = paramsSort + this.__secretKey
    const paramsHash = tools.Hash('md5', paramsSecret)
    return `${paramsSort}&sign=${paramsHash}`
  }
  /**
   * 对参数加参后签名
   *
   * @static
   * @param {string} [params]
   * @returns {string}
   * @memberof AppClient
   */
  public static signQueryBase(params?: string): string {
    const paramsBase = params === undefined ? this.baseQuery : `${params}&${this.baseQuery}`
    return this.signQuery(paramsBase)
  }
  /**
   * 登录状态
   *
   * @static
   * @type {typeof appStatus}
   * @memberof AppClient
   */
  public static readonly status: typeof appStatus = appStatus
  /**
   * 验证码, 登录时会自动清空
   *
   * @type {string}
   * @memberof AppClient
   */
  public captcha: string = ''
  /**
   * 用户名, 推荐邮箱或电话号
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public userName!: string
  /**
   * 密码
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public passWord!: string
  /**
   * 登录后获取的B站UID
   *
   * @abstract
   * @type {number}
   * @memberof AppClient
   */
  public biliUID!: number
  /**
   * 登录后获取的access_token
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public accessToken!: string
  /**
   * 登录后获取的refresh_token
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public refreshToken!: string
  /**
   * 登录后获取的cookieString
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public cookieString!: string
  /**
   * 请求头
   *
   * @type {IncomingHttpHeaders}
   * @memberof AppClient
   */
  public headers: IncomingHttpHeaders = {
    'User-Agent': 'Mozilla/5.0 BiliDroid/5.57.0 (bbcallen@gmail.com) os/android model/J9110 mobi_app/android build/5570300 channel/bili innerVer/5570300 osVer/10 network/2',
    'Connection': 'Keep-Alive',
  }
  /**
   * cookieJar
   *
   * @protected
   * @type {CookieJar}
   * @memberof AppClient
   */
  protected __jar: CookieJar = new CookieJar()
  /**
   * 对密码进行加密
   *
   * @protected
   * @param {getKeyResponseData} publicKey
   * @returns {string}
   * @memberof AppClient
   */
  protected _RSAPassWord(publicKey: getKeyResponseData): string {
    const padding = {
      key: publicKey.key,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }
    const hashPassWord = publicKey.hash + this.passWord
    const encryptPassWord = crypto.publicEncrypt(padding, Buffer.from(hashPassWord)).toString('base64')
    return encodeURIComponent(encryptPassWord)
  }
  /**
   * 获取公钥
   *
   * @protected
   * @returns {(Promise<response<getKeyResponse> | undefined>)}
   * @memberof AppClient
   */
  protected _getKey(): Promise<XHRresponse<getKeyResponse> | undefined> {
    const getKey: XHRoptions = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/api/oauth2/getKey',
      body: AppClient.signQueryBase(),
      jar: this.__jar,
      json: true,
      headers: this.headers
    }
    return tools.XHR<getKeyResponse>(getKey, 'Android')
  }
  /**
   * 验证登录信息
   *
   * @protected
   * @param {getKeyResponseData} publicKey
   * @returns {Promise<response<authResponse> | undefined>)}
   * @memberof AppClient
   */
  protected _auth(publicKey: getKeyResponseData): Promise<XHRresponse<authResponse> | undefined> {
    const passWord = this._RSAPassWord(publicKey)
    const captcha = this.captcha === '' ? '' : `&captcha=${this.captcha}`
    const authQuery = `username=${encodeURIComponent(this.userName)}&password=${passWord}${captcha}`
    const auth: XHRoptions = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/api/v2/oauth2/login',
      body: AppClient.signQueryBase(authQuery),
      jar: this.__jar,
      json: true,
      headers: this.headers
    }
    this.captcha = ''
    return tools.XHR<authResponse>(auth, 'Android')
  }
  /**
   * 更新用户凭证
   *
   * @protected
   * @param {authResponseData} authResponseData
   * @memberof AppClient
   */
  protected _update(authResponseData: authResponseData) {
    const tokenInfo = authResponseData.token_info
    const cookies = authResponseData.cookie_info.cookies
    this.biliUID = +tokenInfo.mid
    this.accessToken = tokenInfo.access_token
    this.refreshToken = tokenInfo.refresh_token
    this.cookieString = cookies.reduce((cookieString, cookie) => cookieString === ''
      ? `${cookie.name}=${cookie.value}`
      : `${cookieString}; ${cookie.name}=${cookie.value}`
      , '')
  }
  /**
   * 获取验证码
   *
   * @returns {Promise<captchaResponse>}
   * @memberof AppClient
   */
  public async getCaptcha(): Promise<captchaResponse> {
    const captcha: XHRoptions = {
      uri: 'https://passport.bilibili.com/captcha',
      encoding: null,
      jar: this.__jar,
      headers: this.headers
    }
    const captchaResponse = await tools.XHR<Buffer>(captcha, 'Android')
    if (captchaResponse !== undefined && captchaResponse.response.statusCode === 200)
      return { status: appStatus.success, data: captchaResponse.body, }
    return { status: appStatus.error, data: captchaResponse }
  }
  /**
   * 客户端登录
   *
   * @returns {Promise<loginResponse>}
   * @memberof AppClient
   */
  public async login(): Promise<loginResponse> {
    const getKeyResponse = await this._getKey()
    if (getKeyResponse !== undefined && getKeyResponse.response.statusCode === 200 && getKeyResponse.body.code === 0) {
      const authResponse = await this._auth(getKeyResponse.body.data)
      if (authResponse !== undefined && authResponse.response.statusCode === 200) {
        if (authResponse.body.code === 0) {
          if (authResponse.body.data.token_info !== undefined && authResponse.body.data.cookie_info !== undefined) {
            this._update(authResponse.body.data)
            return { status: appStatus.success, data: authResponse.body }
          }
          return { status: appStatus.error, data: authResponse.body }
        }
        if (authResponse.body.code === -105) return { status: appStatus.captcha, data: authResponse.body }
        return { status: appStatus.error, data: authResponse.body }
      }
      return { status: appStatus.httpError, data: authResponse }
    }
    return { status: appStatus.httpError, data: getKeyResponse }
  }
  /**
   * 客户端登出
   *
   * @returns {Promise<logoutResponse>}
   * @memberof AppClient
   */
  public async logout(): Promise<logoutResponse> {
    const revokeQuery = `${this.cookieString.replace(/; */g, '&')}&access_token=${this.accessToken}`
    const revoke: XHRoptions = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/api/v2/oauth2/revoke',
      body: AppClient.signQueryBase(revokeQuery),
      json: true,
      headers: this.headers
    }
    const revokeResponse = await tools.XHR<revokeResponse>(revoke, 'Android')
    if (revokeResponse !== undefined && revokeResponse.response.statusCode === 200) {
      if (revokeResponse.body.code === 0) return { status: appStatus.success, data: revokeResponse.body }
      return { status: appStatus.error, data: revokeResponse.body }
    }
    return { status: appStatus.httpError, data: revokeResponse }
  }
  /**
   * 更新access_token
   *
   * @returns {Promise<loginResponse>}
   * @memberof AppClient
   */
  public async refresh(): Promise<loginResponse> {
    const refreshQuery = `access_token=${this.accessToken}&refresh_token=${this.refreshToken}`
    const refresh: XHRoptions = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/api/v2/oauth2/refresh_token',
      body: AppClient.signQueryBase(refreshQuery),
      json: true,
      headers: this.headers
    }
    const refreshResponse = await tools.XHR<authResponse>(refresh, 'Android')
    if (refreshResponse !== undefined && refreshResponse.response.statusCode === 200) {
      if (refreshResponse.body !== undefined && refreshResponse.body.code === 0) {
        this._update(refreshResponse.body.data)
        return { status: appStatus.success, data: refreshResponse.body }
      }
      return { status: appStatus.error, data: refreshResponse.body }
    }
    return { status: appStatus.httpError, data: refreshResponse }
  }
}
export default AppClient