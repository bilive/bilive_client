import { CookieJar } from 'tough-cookie'
import tools from './tools'
import { IncomingHttpHeaders } from 'http'
import AppClient from './app_client'
/**
 * TVClient
 *
 * @abstract
 * @class TVClient
 * @extends {AppClient}
 */
abstract class TVClient extends AppClient {
  protected __loginSecretKey: string = '59b43e04ad6965f34319062b478f83dd'
  public loginAppKey: string = '4409e2ce8ffd12b8'
  protected __secretKey: string = '59b43e04ad6965f34319062b478f83dd'
  public appKey: string = '4409e2ce8ffd12b8'
  public build: string = '102401'
  public fingerprint: string = AppClient.RandomID(62)
  public guid: string = this.buvid
  public localFingerprint: string = this.fingerprint
  public mobiApp: string = 'android_tv_yst'
  public networkstate: string = 'wifi'
  /**
   * TV登录请求头
   *
   * @type {IncomingHttpHeaders}
   * @memberof TVClient
   */
  public loginHeaders: IncomingHttpHeaders = {
    'User-Agent': 'Mozilla/5.0 BiliTV/1.2.4.1 (bbcallen@gmail.com)',
    'APP-KEY': this.mobiApp,
    'Buvid': this.buvid,
    'env': 'prod'
  }
  /**
   * 登录请求参数
   *
   * @type {string}
   * @memberof AppClient
   */
  public loginQuery: string = `appkey=${this.loginAppKey}&bili_local_id=${this.biliLocalID}&build=${this.build}&buvid=${this.buvid}&channel=${this.channel}\
&device=${this.device}&device_id=${this.deviceID}&device_name=${this.deviceName}&device_platform=${this.devicePlatform}&fingerprint=${this.fingerprint}&guid=${this.guid}\
&local_fingerprint=${this.localFingerprint}&local_id=${this.localID}&mobi_app=${this.mobiApp}&networkstate=${this.networkstate}&platform=${this.platform}`
  /**
   * 验证码, 登录时会自动清空
   *
   * @type {string}
   * @memberof AppClient
   */
  public authcode: string = ''
  /**
   * 登录二维码, 登录时会自动清空
   *
   * @type {string}
   * @memberof AppClient
   */
  public authcodeURL: string = ''
  /**
   * cookieJar
   *
   * @protected
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
      url: `https://passport.bilibili.com/x/passport-tv-login/key?${this.signLoginQuery()}`,
      cookieJar: this.__jar,
      responseType: 'json',
      headers: this.loginHeaders
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
    const authQuery = `username=${encodeURIComponent(this.userName)}&password=${passWord}`
    const auth: XHRoptions = {
      method: 'POST',
      url: 'https://passport.bilibili.com/x/passport-tv-login/login',
      body: this.signLoginQuery(authQuery),
      cookieJar: this.__jar,
      responseType: 'json',
      headers: this.loginHeaders
    }
    return tools.XHR<authResponse>(auth, 'Android')
  }
  /**
   * 获取二维码
   *
   * @returns {Promise<qrcodeResponse>}
   * @memberof TVClient
   */
  public async getAuthcode(): Promise<qrcodeResponse> {
    const authcode: XHRoptions = {
      method: 'POST',
      url: 'https://passport.snm0516.aisee.tv/x/passport-tv-login/qrcode/auth_code',
      body: this.signLoginQuery(),
      responseType: 'json',
      headers: this.headers
    }
    const authcodeResponse = await tools.XHR<authcodeResponse>(authcode, 'Android')
    if (authcodeResponse !== undefined && authcodeResponse.response.statusCode === 200) {
      if (authcodeResponse.body.code === 0)
        return { status: AppClient.status.success, data: authcodeResponse.body }
      return { status: AppClient.status.error, data: authcodeResponse.body }
    }
    return { status: AppClient.status.httpError, data: authcodeResponse }
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
          return { status: AppClient.status.error, data: authResponse.body }
        }
        if (authResponse.body.code === 86048)
          return { status: AppClient.status.authcode, data: authResponse.body }
        return { status: AppClient.status.error, data: authResponse.body }
      }
      return { status: AppClient.status.httpError, data: authResponse }
    }
    return { status: AppClient.status.httpError, data: getKeyResponse }
  }
  /**
   * 二维码获取access_token
   *
   * @returns {Promise<loginResponse>}
   * @memberof AppClient
   */
  public async qrcodePoll(): Promise<loginResponse> {
    const qrcodePollQuery = `auth_code=${this.authcode}`
    const qrcodePoll: XHRoptions = {
      method: 'POST',
      url: 'https://passport.bilibili.com/x/passport-tv-login/qrcode/poll',
      body: this.signLoginQuery(qrcodePollQuery),
      responseType: 'json',
      headers: this.loginHeaders
    }
    this.authcode = ''
    const qrcodePollResponse = await tools.XHR<authResponse>(qrcodePoll, 'Android')
    if (qrcodePollResponse !== undefined && qrcodePollResponse.response.statusCode === 200) {
      if (qrcodePollResponse.body.code === 0) {
        const tokenData = qrcodePollResponse.body.data
        if (tokenData.refresh_token !== undefined) {
          this.refreshToken = tokenData.refresh_token
          const cookieData = await this.refresh()
          return cookieData
        }
        return { status: AppClient.status.error, data: qrcodePollResponse.body }
      }
      if (qrcodePollResponse.body.code === 86039)
        return { status: AppClient.status.authcode, data: qrcodePollResponse.body }
      return { status: AppClient.status.error, data: qrcodePollResponse.body }
    }
    return { status: AppClient.status.httpError, data: qrcodePollResponse }
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
      url: 'https://passport.bilibili.com/x/passport-login/oauth2/refresh_token',
      body: this.signLoginQuery(refreshQuery),
      responseType: 'json',
      headers: this.loginHeaders
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
export default TVClient