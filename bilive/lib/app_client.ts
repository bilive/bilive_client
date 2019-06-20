import crypto from 'crypto'
import request from 'request'
import tools from './tools'
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
    // 设置 Buvid
    this.headers['Buvid'] = AppClient.RandomID(37).toUpperCase()
    // 设置 Display-ID
    this.headers['Display-ID'] = `${this.headers['Buvid']}-${AppClient.TS}`
    // 设置 Device-ID
    this.headers['Device-ID'] = AppClient.RandomID(54)
  }
  public static readonly actionKey: string = 'appkey'
  public static readonly device: string = 'android'
  // bilibili 客户端
  private static readonly __secretKey: string = '560c52ccd288fed045859ed18bffd973'
  public static readonly appKey: string = '1d8b6e7d45233436'
  public static readonly build: string = '5431000'
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
  // public static readonly build: string = '140600'
  // public static readonly mobiApp: string = 'android_tv'
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
    return Math.floor(Math.random() * 1e+8) + 1e+7
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
    for (let i = 0; i < length; i++) randomID += words[Math.floor(Math.random() * 62)]
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
   * @type {request.Headers}
   * @memberof AppClient
   */
  public headers: request.Headers = {
    'User-Agent': 'Mozilla/5.0 BiliDroid/5.43.1 (bbcallen@gmail.com)',
    'Connection': 'Keep-Alive',
  }
  /**
   * cookieJar
   *
   * @private
   * @type {request.CookieJar}
   * @memberof AppClient
   */
  private __jar: request.CookieJar = request.jar()
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
    const getKey: request.Options = {
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
    const auth: request.Options = {
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
    const captcha: request.Options = {
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
          this._update(authResponse.body.data)
          return { status: appStatus.success, data: authResponse.body }
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
    const revoke: request.Options = {
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
    const refresh: request.Options = {
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