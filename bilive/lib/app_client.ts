import * as crypto from 'crypto'
import * as request from 'request'
import * as tools from './tools'
/**
 * 登录状态
 * 
 * @enum {number}
 */
enum status {
  'success',
  'captcha',
  'error',
  'httpError',
}
/**
 * Creates an instance of AppClient.
 * 创建实例后务必init()
 * 
 * @class AppClient
 */
class AppClient {
  /**
   * Creates an instance of AppClient.
   * 创建实例后务必init()
   * @memberof AppClient
   */
  constructor() {
  }
  // bilibili客户端
  private static readonly __secretKey: string = '560c52ccd288fed045859ed18bffd973'
  public static readonly actionKey: string = 'appkey'
  public static readonly appKey: string = '1d8b6e7d45233436'
  public static readonly build: string = '5210000'
  public static readonly mobiApp: string = 'android'
  public static readonly platform: string = 'android'
  // bilibili 国际版
  // private static readonly _secretKey: string = '36efcfed79309338ced0380abd824ac1'
  // public static readonly appKey: string = 'bb3101000e232e27'
  // public static readonly build: string = '110001'
  // public static readonly mobiApp: string = 'android_i'
  // public static readonly platform: string = 'android'
  // bilibili link
  // private static readonly _secretKey: string = 'e988e794d4d4b6dd43bc0e89d6e90c43'
  // public static readonly appKey: string = '37207f2beaebf8d7'
  // public static readonly build: string = '211109'
  // public static readonly mobiApp: string = 'biliLink'
  // public static readonly platform: string = 'android'
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
   * 基本请求参数
   * 
   * @readonly
   * @static
   * @type {string}
   * @memberof AppClient
   */
  public static get baseQuery(): string {
    return `actionKey=${this.actionKey}&appkey=${this.appKey}&build=${this.build}\
&mobi_app=${this.mobiApp}&platform=${this.platform}&ts=${this.TS}`
  }
  /**
   * 对参数签名
   * 
   * @static
   * @param {string} params
   * @returns {string}
   * @memberof AppClient
   */
  public static signQuery(params: string): string {
    const paramsSecret = params + this.__secretKey
    const paramsHash = tools.Hash('md5', paramsSecret)
    return `${params}&sign=${paramsHash}`
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
   * @type {typeof status}
   * @memberof AppClient
   */
  public static readonly status: typeof status = status
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
   * @type {string}
   * @memberof AppClient
   */
  public userName: string
  /**
   * 密码
   * 
   * @type {string}
   * @memberof AppClient
   */
  public passWord: string
  /**
   * 登录后获取的B站UID
   * 
   * @type {number}
   * @memberof AppClient
   */
  public biliUID: number
  /**
   * 登录后获取的access_token
   * 
   * @type {string}
   * @memberof AppClient
   */
  public accessToken: string
  /**
   * 登录后获取的refresh_token
   * 
   * @type {string}
   * @memberof AppClient
   */
  public refreshToken: string
  /**
   * 登录后获取的cookieString
   * 
   * @type {string}
   * @memberof AppClient
   */
  public cookieString: string
  /**
   * 请求头
   * 
   * @type {request.Headers}
   * @memberof AppClient
   */
  public headers: request.Headers = {
    'Buvid': '7A4C4919-20A6-4012-BBA4-6FAA1561542845107infoc',
    'Connection': 'Keep-Alive',
    'User-Agent': 'Mozilla/5.0 BiliDroid/5.21.0 (bbcallen@gmail.com)'
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
      // @ts-ignore 此处为d.ts错误
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
   * @returns {(Promise<tools.response<getKeyResponse> | undefined>)} 
   * @memberof AppClient
   */
  protected _getKey(): Promise<tools.response<getKeyResponse> | undefined> {
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
   * @returns {Promise<tools.response<authResponse> | undefined>)} 
   * @memberof AppClient
   */
  protected _auth(publicKey: getKeyResponseData): Promise<tools.response<authResponse> | undefined> {
    const passWord = this._RSAPassWord(publicKey)
    const captcha = this.captcha === '' ? '' : `&captcha=${this.captcha}`
    const authQuery = `appkey=${AppClient.appKey}&build=${AppClient.build}${captcha}&mobi_app=${AppClient.mobiApp}\
&password=${passWord}&platform=${AppClient.platform}&ts=${AppClient.TS}&username=${encodeURIComponent(this.userName)}`
    const auth: request.Options = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/api/v2/oauth2/login',
      body: AppClient.signQuery(authQuery),
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
   * 初始化获取Buvid
   * 
   * @memberof AppClient
   */
  public async init() {
    const buvid = await tools.XHR<string>({ uri: 'http://data.bilibili.com/gv/' }, 'Android')
    if (buvid !== undefined && buvid.response.statusCode === 200 && buvid.body.length === 46)
      this.headers['Buvid'] = buvid.body
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
      return { status: status.success, data: captchaResponse.body, }
    return { status: status.error, data: captchaResponse }
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
          return { status: status.success, data: authResponse.body }
        }
        if (authResponse.body.code === -105) return { status: status.captcha, data: authResponse.body }
        return { status: status.error, data: authResponse.body }
      }
      return { status: status.httpError, data: authResponse }
    }
    return { status: status.httpError, data: getKeyResponse }
  }
  /**
   * 更新access_token
   * 
   * @returns {Promise<loginResponse>} 
   * @memberof AppClient
   */
  public async refresh(): Promise<loginResponse> {
    const refreshQuery = `access_token=${this.accessToken}&appkey=${AppClient.appKey}&build=${AppClient.build}\
&mobi_app=${AppClient.mobiApp}&platform=${AppClient.platform}&refresh_token=${this.refreshToken}&ts=${AppClient.TS}`
    const refresh: request.Options = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/api/v2/oauth2/refresh_token',
      body: AppClient.signQuery(refreshQuery),
      json: true,
      headers: this.headers
    }
    const refreshResponse = await tools.XHR<authResponse>(refresh, 'Android')
    if (refreshResponse !== undefined && refreshResponse.response.statusCode === 200) {
      if (refreshResponse.body.code === 0) {
        this._update(refreshResponse.body.data)
        return { status: status.success, data: refreshResponse.body }
      }
      return { status: status.error, data: refreshResponse.body }
    }
    return { status: status.httpError, data: refreshResponse }
  }
}
/**
 * 公钥返回
 * 
 * @interface getKeyResponse
 */
interface getKeyResponse {
  ts: number
  code: number
  data: getKeyResponseData
}
interface getKeyResponseData {
  hash: string
  key: string
}
/**
 * 验证返回
 * 
 * @interface authResponse
 */
interface authResponse {
  ts: number
  code: number
  data: authResponseData
}
interface authResponseData {
  status: number
  token_info: authResponseTokeninfo
  cookie_info: authResponseCookieinfo
}
interface authResponseCookieinfo {
  cookies: authResponseCookie[]
  domains: string[]
}
interface authResponseCookie {
  name: string
  value: string
  http_only: number
  expires: number
}
interface authResponseTokeninfo {
  mid: number
  access_token: string
  refresh_token: string
  expires_in: number
}
/**
 * 登录返回信息
 */
type loginResponse = loginResponseSuccess | loginResponseCaptcha | loginResponseError | loginResponseHttp
interface loginResponseSuccess {
  status: status.success
  data: authResponse
}
interface loginResponseCaptcha {
  status: status.captcha
  data: authResponse
}
interface loginResponseError {
  status: status.error
  data: authResponse
}
interface loginResponseHttp {
  status: status.httpError
  data: tools.response<getKeyResponse> | tools.response<authResponse> | undefined
}
/**
 * 验证码返回信息
 */
type captchaResponse = captchaResponseSuccess | captchaResponseError
interface captchaResponseSuccess {
  status: status.success
  data: Buffer
}
interface captchaResponseError {
  status: status.error
  data: tools.response<Buffer> | undefined
}
export default AppClient
export { getKeyResponse, authResponse, loginResponse, captchaResponse }