import { CookieJar } from 'tough-cookie'
import tools from './tools'
import { IncomingHttpHeaders } from 'http'
import AppClient from './app_client'
/**
 * TVClient
 *
 * @class TVClient
 * @extends {AppClient}
 */
class TVClient extends AppClient {
  /**
   * Creates an instance of TVClient.
   * @memberof TVClient
   */
  constructor() {
    super()
    this.headers['APP-KEY'] = TVClient.mobiApp
    this.headers['Buvid'] = TVClient.buvid
    this.headers['env'] = 'prod'
    delete this.headers['Device-ID']
  }
  protected static readonly __secretKey: string = '59b43e04ad6965f34319062b478f83dd'
  public static readonly appKey: string = '4409e2ce8ffd12b8'
  public static readonly biliLocalId: string = TVClient.RandomID(20)
  public static readonly build: string = '102401'
  public static readonly buvid: string = TVClient.RandomID(37)
  public static readonly channel: string = 'master'
  public static readonly device: string = 'Sony'
  public static readonly deviceId: string = TVClient.biliLocalId
  public static readonly deviceName: string = 'G8142'
  public static readonly devicePlatform: string = 'Android10SonyG8142'
  public static readonly fingerprint: string = TVClient.RandomID(62)
  public static readonly guid: string = TVClient.buvid
  public static readonly localFingerprint: string = TVClient.fingerprint
  public static readonly localId: string = TVClient.buvid
  public static readonly mobiApp: string = 'android_tv_yst'
  public static readonly networkstate: string = 'wifi'
  public static readonly platform: string = 'android'
  /**
   * 登录请求参数
   *
   * @readonly
   * @static
   * @type {string}
   * @memberof TVClient
   */
  public static get loginQuery(): string {
    return `appkey=${this.appKey}&bili_local_id=${this.biliLocalId}&build=${this.build}&buvid=${this.buvid}&channel=${this.channel}&device=${this.device}\
&device_id=${this.deviceId}&device_name=${this.deviceName}&device_platform=${this.devicePlatform}&fingerprint=${this.fingerprint}&guid=${this.guid}\
&local_fingerprint=${this.localFingerprint}&local_id=${this.localId}&mobi_app=${this.mobiApp}&networkstate=${this.networkstate}&platform=${this.platform}`
  }
  /**
   * 对登录参数加参后签名
   *
   * @static
   * @param {string} [params]
   * @returns {string}
   * @memberof TVClient
   */
  public static signQueryLogin(params?: string): string {
    const paramsBase = params === undefined ? this.loginQuery : `${params}&${this.loginQuery}`
    return this.signQuery(paramsBase)
  }
  /**
   * 请求头
   *
   * @type {IncomingHttpHeaders}
   * @memberof TVClient
   */
  public headers: IncomingHttpHeaders = {
    'User-Agent': 'Mozilla/5.0 BiliTV/1.2.4.1 (bbcallen@gmail.com)',
    'Connection': 'Keep-Alive',
  }
  /**
   * cookieJar
   *
   * @private
   * @type {CookieJar}
   * @memberof TVClient
   */
  protected __jar: CookieJar = new CookieJar()
  /**
   * 获取公钥
   *
   * @protected
   * @returns {(Promise<response<getKeyResponse> | undefined>)}
   * @memberof TVClient
   */
  protected _getKey(): Promise<XHRresponse<getKeyResponse> | undefined> {
    const getKey: XHRoptions = {
      uri: `https://passport.bilibili.com/x/passport-tv-login/key?${TVClient.signQueryLogin()}`,
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
   * @memberof TVClient
   */
  protected _auth(publicKey: getKeyResponseData): Promise<XHRresponse<authResponse> | undefined> {
    const passWord = this._RSAPassWord(publicKey)
    const captcha = this.captcha === '' ? '' : `&code=${this.captcha}`
    const authQuery = `username=${encodeURIComponent(this.userName)}&password=${passWord}${captcha}`
    const auth: XHRoptions = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/x/passport-tv-login/login',
      body: TVClient.signQueryLogin(authQuery),
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
   * @memberof TVClient
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
   * 客户端登录
   *
   * @returns {Promise<loginResponse>}
   * @memberof TVClient
   */
  public async login(): Promise<loginResponse> {
    const getKeyResponse = await this._getKey()
    if (getKeyResponse !== undefined && getKeyResponse.response.statusCode === 200 && getKeyResponse.body.code === 0) {
      const authResponse = await this._auth(getKeyResponse.body.data)
      if (authResponse !== undefined && authResponse.response.statusCode === 200) {
        if (authResponse.body.code === 0) {
          const tokenData = authResponse.body.data
          if (tokenData.refresh_token !== undefined) {
            this.refreshToken = tokenData.refresh_token
            const cookieData = await this.refresh()
            return cookieData
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
   * 更新access_token
   *
   * @returns {Promise<loginResponse>}
   * @memberof TVClient
   */
  public async refresh(): Promise<loginResponse> {
    const refreshQuery = `refresh_token=${this.refreshToken}`
    const refresh: XHRoptions = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/x/passport-login/oauth2/refresh_token',
      body: TVClient.signQueryLogin(refreshQuery),
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
export default TVClient