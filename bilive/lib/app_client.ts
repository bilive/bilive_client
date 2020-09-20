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
  'error',
  'httpError',
  'captcha',
  'validate',
  'authcode',
}
/**
 * 模拟app登录
 *
 * @abstract
 * @class AppClient
 */
abstract class AppClient {
  public static readonly actionKey: string = 'appkey'
  // bilibili 客户端
  protected static readonly __loginSecretKey: string = '60698ba2f68e01ce44738920a0ffe768'
  public static readonly loginAppKey: string = 'bca7e84c2d947ac6'
  protected static readonly __secretKey: string = '560c52ccd288fed045859ed18bffd973'
  public static readonly appKey: string = '1d8b6e7d45233436'
  public static get biliLocalId(): string { return this.RandomID(64) }
  public static readonly build: string = '6070600'
  public static get buvid(): string { return this.RandomID(37).toLocaleUpperCase() }
  public static readonly Clocale: string = 'zh_CN'
  public static readonly channel: string = 'bili'
  public static readonly device: string = 'phone'
  // 同一客户端与biliLocalId相同
  public static get deviceId(): string { return this.biliLocalId }
  public static readonly deviceName: string = 'SonyJ9110'
  public static readonly devicePlatform: string = 'Android10SonyJ9110'
  // 同一客户端与buvid相同
  public static get localId(): string { return this.buvid }
  public static readonly mobiApp: string = 'android'
  public static readonly platform: string = 'android'
  public static readonly Slocale: string = 'zh_CN'
  public static readonly statistics: string = encodeURIComponent('{"appId":1,"platform":3,"version":"6.7.0","abtest":""}')

  // bilibili 国际版
  // protected static readonly __loginSecretKey: string = 'c75875c596a69eb55bd119e74b07cfe3'
  // public static readonly loginAppKey: string = 'ae57252b0c09105d'
  // protected static readonly __secretKey: string = '36efcfed79309338ced0380abd824ac1'
  // public static readonly appKey: string = 'bb3101000e232e27'
  // public static readonly build: string = '112000'
  // public static readonly mobiApp: string = 'android_i'

  // bilibili 概念版
  // protected static readonly __loginSecretKey: string = '34381a26236dd1171185c0beb042e1c6'
  // public static readonly loginAppKey: string = '178cf125136ca8ea'
  // protected static readonly __secretKey: string = '25bdede4e1581c836cab73a48790ca6e'
  // public static readonly appKey: string = '07da50c9a0bf829f'
  // public static readonly build: string = '5380400'
  // public static readonly mobiApp: string = 'android_b'

  // bilibili TV
  // protected static readonly __loginSecretKey: string = '59b43e04ad6965f34319062b478f83dd'
  // public static readonly loginAppKey: string = '4409e2ce8ffd12b8'
  // protected static readonly __secretKey: string = '59b43e04ad6965f34319062b478f83dd'
  // public static readonly appKey: string = '4409e2ce8ffd12b8'
  // public static readonly biliLocalId: string = AppClient.RandomID(20)
  // public static readonly build: string = '102401'
  // public static readonly buvid: string = AppClient.RandomID(37).toLocaleUpperCase()
  // public static readonly channel: string = 'master'
  // public static readonly device: string = 'Sony'
  // public static readonly deviceId: string = AppClient.biliLocalId
  // public static readonly deviceName: string = 'J9110'
  // public static readonly devicePlatform: string = 'Android10SonyJ9110'
  // public static get fingerprint(): string { return this.RandomID(62) }
  // public static readonly guid: string = AppClient.buvid
  // // 同一客户端与fingerprint相同
  // public static get localFingerprint(): string { return this.fingerprint }
  // public static readonly localId: string = AppClient.buvid
  // public static readonly mobiApp: string = 'android_tv_yst'
  // public static readonly networkstate: string = 'wifi'
  // public static readonly platform: string = 'android'

  // bilibili link
  // protected static readonly __loginSecretKey: string = 'e988e794d4d4b6dd43bc0e89d6e90c43'
  // public static readonly loginAppKey: string = '37207f2beaebf8d7'
  // protected static readonly __secretKey: string = 'e988e794d4d4b6dd43bc0e89d6e90c43'
  // public static readonly appKey: string = '37207f2beaebf8d7'
  // public static readonly build: string = '4610002'
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
  public static get TS(): number { return Math.floor(Date.now() / 1000) }
  /**
   * 谜一样的RND
   *
   * @readonly
   * @static
   * @type {number}
   * @memberof AppClient
   */
  public static get RND(): number { return AppClient.RandomNum(9) }
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
   * UUID
   *
   * @readonly
   * @static
   * @type {string}
   * @memberof AppClient
   */
  public static get UUID(): string {
    return this.RandomHex(32).replace(/(\w{8})(\w{4})\w(\w{3})\w(\w{3})(\w{12})/, `$1-$2-4$3-${'89ab'[Math.floor(Math.random() * 4)]}$4-$5`)
  }
  /**
   * 随机Hex
   *
   * @static
   * @returns {string}
   * @memberof AppClient
   */
  public static RandomHex(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').substring(0, length)
  }
  /**
   * 请求头
   *
   * @readonly
   * @static
   * @type {IncomingHttpHeaders}
   * @memberof AppClient
   */
  public static get headers(): IncomingHttpHeaders {
    return {
      'User-Agent': 'Mozilla/5.0 BiliDroid/6.6.0 (bbcallen@gmail.com) os/android model/J9110 mobi_app/android build/6060300 channel/bili innerVer/6060300 osVer/10 network/2',
      'APP-KEY': this.mobiApp,
      'Buvid': this.buvid,
      'Device-ID': this.deviceId,
      'env': 'prod'
    }
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
    return `actionKey=${this.actionKey}&appkey=${this.appKey}&build=${this.build}&c_locale=${this.Clocale}&channel=${this.channel}\
&device=${this.device}&mobi_app=${this.mobiApp}&platform=${this.platform}&s_locale=${this.Slocale}&statistics=${this.statistics}`
  }
  /**
   * 登录请求参数
   *
   * @readonly
   * @static
   * @type {string}
   * @memberof AppClient
   */
  public static get loginQuery(): string {
    return `appkey=${this.loginAppKey}&bili_local_id=${this.biliLocalId}&build=${this.build}&buvid=${this.buvid}&channel=${this.channel}\
&device=${this.device}&device_id=${this.deviceId}&device_name=${this.deviceName}&device_platform=${this.devicePlatform}&local_id=${this.localId}\
&mobi_app=${this.mobiApp}&platform=${this.platform}&statistics=${this.statistics}`
  }
  /**
   * 对参数签名
   *
   * @static
   * @param {string} params
   * @param {boolean} [ts=true]
   * @param {string} [secretKey=this.__secretKey]
   * @returns {string}
   * @memberof AppClient
   */
  public static signQuery(params: string, ts: boolean = true, secretKey: string = this.__secretKey): string {
    let paramsSort = params
    if (ts) paramsSort = `${params}&ts=${this.TS}`
    paramsSort = paramsSort.split('&').sort().join('&')
    const paramsSecret = paramsSort + secretKey
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
  public static signBaseQuery(params?: string): string {
    const paramsBase = params === undefined ? this.baseQuery : `${params}&${this.baseQuery}`
    return this.signQuery(paramsBase)
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
    return this.signBaseQuery(params)
  }
  /**
   * 对登录参数加参后签名
   *
   * @static
   * @param {string} [params]
   * @returns {string}
   * @memberof AppClient
   */
  public static signLoginQuery(params?: string): string {
    const paramsBase = params === undefined ? this.loginQuery : `${params}&${this.loginQuery}`
    return this.signQuery(paramsBase, true, this.__loginSecretKey)
  }

  // 固定参数
  public actionKey: string = AppClient.actionKey
  protected __loginSecretKey: string = AppClient.__loginSecretKey
  public loginAppKey: string = AppClient.loginAppKey
  protected __secretKey: string = AppClient.__secretKey
  public appKey: string = AppClient.appKey
  public biliLocalId = AppClient.biliLocalId
  public build: string = AppClient.build
  public buvid = AppClient.buvid
  public Clocale: string = AppClient.Clocale
  public channel: string = AppClient.channel
  public device: string = AppClient.device
  public deviceId: string = this.biliLocalId
  public deviceName: string = AppClient.deviceName
  public devicePlatform: string = AppClient.devicePlatform
  public localId: string = this.buvid
  public mobiApp: string = AppClient.mobiApp
  public platform: string = AppClient.platform
  public Slocale: string = AppClient.Slocale
  public statistics: string = AppClient.statistics
  /**
   * 请求头
   *
   * @type {IncomingHttpHeaders}
   * @memberof AppClient
   */
  public headers: IncomingHttpHeaders = {
    'User-Agent': 'Mozilla/5.0 BiliDroid/6.6.0 (bbcallen@gmail.com) os/android model/J9110 mobi_app/android build/6060300 channel/bili innerVer/6060300 osVer/10 network/2',
    'APP-KEY': this.mobiApp,
    'Buvid': this.buvid,
    'Device-ID': this.deviceId,
    'env': 'prod'
  }
  /**
   * 基本请求参数
   *
   * @type {string}
   * @memberof AppClient
   */
  public baseQuery: string = `actionKey=${this.actionKey}&appkey=${this.appKey}&build=${this.build}&c_locale=${this.Clocale}&channel=${this.channel}\
&device=${this.device}&mobi_app=${this.mobiApp}&platform=${this.platform}&s_locale=${this.Slocale}&statistics=${this.statistics}`
  /**
   * 登录请求参数
   *
   * @type {string}
   * @memberof AppClient
   */
  public loginQuery: string = `appkey=${this.loginAppKey}&bili_local_id=${this.biliLocalId}&build=${this.build}&buvid=${this.buvid}&channel=${this.channel}\
&device=${this.device}&device_id=${this.deviceId}&device_name=${this.deviceName}&device_platform=${this.devicePlatform}&local_id=${this.localId}\
&mobi_app=${this.mobiApp}&platform=${this.platform}&statistics=${this.statistics}`
  /**
   * 对参数签名
   *
   * @param {string} params
   * @param {boolean} [ts=true]
   * @param {string} [secretKey=this.__secretKey]
   * @returns {string}
   * @memberof AppClient
   */
  public signQuery(params: string, ts: boolean = true, secretKey: string = this.__secretKey): string {
    return AppClient.signQuery(params, ts, secretKey)
  }
  /**
   * 对参数加参后签名
   *
   * @param {string} [params]
   * @returns {string}
   * @memberof AppClient
   */
  public signBaseQuery(params?: string): string {
    const paramsBase = params === undefined ? this.baseQuery : `${params}&${this.baseQuery}`
    return this.signQuery(paramsBase)
  }
  /**
     * 对登录参数加参后签名
     *
     * @param {string} [params]
     * @returns {string}
     * @memberof AppClient
     */
  public signLoginQuery(params?: string): string {
    const paramsBase = params === undefined ? this.loginQuery : `${params}&${this.loginQuery}`
    return this.signQuery(paramsBase, true, this.__loginSecretKey)
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
   * 滑动验证码, 登录时会自动清空
   *
   * @type {string}
   * @memberof AppClient
   */
  public validate: string = ''
  /**
   * 滑动验证页面, 登录时会自动清空
   *
   * @type {string}
   * @memberof AppClient
   */
  public validateURL: string = ''
  /**
   * 用户名, 推荐邮箱或电话号
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public abstract userName: string
  /**
   * 密码
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public abstract passWord: string
  /**
   * 登录后获取的B站UID
   *
   * @abstract
   * @type {number}
   * @memberof AppClient
   */
  public abstract biliUID: number
  /**
   * 登录后获取的access_token
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public abstract accessToken: string
  /**
   * 登录后获取的refresh_token
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public abstract refreshToken: string
  /**
   * 登录后获取的cookieString
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public abstract cookieString: string
  /**
   * 登录后创建的CookieJar
   *
   * @abstract
   * @type {CookieJar}
   * @memberof AppClient
   */
  public abstract jar: CookieJar
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
      body: this.signLoginQuery(),
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
    const validate = this.validate === '' ? '' : `&validate=${this.validate}`
    const authQuery = `username=${encodeURIComponent(this.userName)}&password=${passWord}${validate}`
    const auth: XHRoptions = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/api/v3/oauth2/login',
      body: this.signLoginQuery(authQuery),
      jar: this.__jar,
      json: true,
      headers: this.headers
    }
    this.validate = ''
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
      return { status: AppClient.status.success, data: captchaResponse.body, }
    return { status: AppClient.status.error, data: captchaResponse }
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
            return { status: AppClient.status.success, data: authResponse.body }
          }
          return { status: AppClient.status.error, data: authResponse.body }
        }
        if (authResponse.body.code === -105) {
          this.validateURL = authResponse.body.data.url
          return { status: AppClient.status.validate, data: authResponse.body }
        }
        return { status: AppClient.status.error, data: authResponse.body }
      }
      return { status: AppClient.status.httpError, data: authResponse }
    }
    return { status: AppClient.status.httpError, data: getKeyResponse }
  }
  /**
   * 客户端登出
   *
   * @returns {Promise<logoutResponse>}
   * @memberof AppClient
   */
  public async logout(): Promise<logoutResponse> {
    const revokeQuery = `access_token=${this.accessToken}`
    const revoke: XHRoptions = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/x/passport-login/revoke',
      body: this.signLoginQuery(revokeQuery),
      json: true,
      headers: this.headers
    }
    const revokeResponse = await tools.XHR<revokeResponse>(revoke, 'Android')
    if (revokeResponse !== undefined && revokeResponse.response.statusCode === 200) {
      if (revokeResponse.body.code === 0) return { status: AppClient.status.success, data: revokeResponse.body }
      return { status: AppClient.status.error, data: revokeResponse.body }
    }
    return { status: AppClient.status.httpError, data: revokeResponse }
  }
  /**
   * 更新access_token
   *
   * @returns {Promise<loginResponse>}
   * @memberof AppClient
   */
  public async refresh(): Promise<loginResponse> {
    const refreshQuery = `refresh_token=${this.refreshToken}`
    const refresh: XHRoptions = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/x/passport-login/oauth2/refresh_token',
      body: this.signLoginQuery(refreshQuery),
      json: true,
      headers: this.headers
    }
    const refreshResponse = await tools.XHR<authResponse>(refresh, 'Android')
    if (refreshResponse !== undefined && refreshResponse.response.statusCode === 200) {
      if (refreshResponse.body !== undefined && refreshResponse.body.code === 0) {
        this._update(refreshResponse.body.data)
        return { status: AppClient.status.success, data: refreshResponse.body }
      }
      return { status: AppClient.status.error, data: refreshResponse.body }
    }
    return { status: AppClient.status.httpError, data: refreshResponse }
  }
}
export default AppClient