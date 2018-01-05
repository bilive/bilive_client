import * as crypto from 'crypto'
import * as request from 'request'
import * as tools from './tools'

enum status {
  'success',
  'captcha',
  'error',
  'httpError'
}
export class AppClient {
  // bilibili客户端
  private static readonly _secretKey: string = '560c52ccd288fed045859ed18bffd973'
  public static readonly appKey: string = '1d8b6e7d45233436'
  public static readonly build: string = '519000'
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
    return `appkey=${this.appKey}&build=${this.build}&mobi_app=${this.mobiApp}&platform=${this.platform}&ts=${this.TS}`
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
    let paramsSecret = params + this._secretKey
      , paramsHash = tools.Hash('md5', paramsSecret)
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
    let paramsBase = params == null ? this.baseQuery : `${params}&${this.baseQuery}`
    return this.signQuery(paramsBase)
  }
  /**
   * 登录状态
   * 
   * @static
   * @memberof AppClient
   */
  public static status = status
  /**
   * 对密码进行加密
   * 
   * @private
   * @static
   * @param {string} passWord
   * @param {getKeyResponseData} publicKey
   * @returns {string}
   * @memberof AppClient
   */
  private static _RSAPassWord(passWord: string, publicKey: getKeyResponseData): string {
    let padding = {
      key: publicKey.key,
      // @ts-ignore 此处为d.ts错误
      padding: crypto.constants.RSA_PKCS1_PADDING
    }
      , hashPassWord = publicKey.hash + passWord
      , encryptPassWord = crypto.publicEncrypt(padding, Buffer.from(hashPassWord)).toString('base64')
    return encodeURIComponent(encryptPassWord)
  }
  /**
   * 获取公钥
   * 
   * @private
   * @static
   * @param {request.CookieJar} [jar] 
   * @returns {Promise<tools.response<getKeyResponse>>} 
   * @memberof AppClient
   */
  private static _getKey(jar?: request.CookieJar): Promise<tools.response<getKeyResponse>> {
    let getKey: request.Options = {
      method: 'POST',
      uri: 'https://passport.bilibili.com/api/oauth2/getKey',
      body: this.signQueryBase(),
      json: true
    }
    if (jar != null) getKey.jar = jar
    return tools.XHR<getKeyResponse>(getKey, 'Android')
  }
  /**
   * 客户端登录
   * 
   * @private
   * @static
   * @param {loginOptions} userLogin 
   * @param {getKeyResponseData} publicKey 
   * @returns {Promise<tools.response<authResponse>>} 
   * @memberof AppClient
   */
  private static _Login(userLogin: loginOptions, publicKey: getKeyResponseData): Promise<tools.response<authResponse>> {
    let passWord = this._RSAPassWord(userLogin.passWord, publicKey)
      , captcha = userLogin.captcha == null ? '' : `&captcha=${userLogin.captcha}`
      , authQuery = `appkey=${this.appKey}&build=${this.build}${captcha}&mobi_app=${this.mobiApp}&password=${passWord}&platform=${this.platform}&ts=${this.TS}&username=${encodeURIComponent(userLogin.userName)}`
      , auth: request.Options = {
        method: 'POST',
        uri: 'https://passport.bilibili.com/api/v2/oauth2/login',
        body: this.signQuery(authQuery),
        json: true
      }
    if (userLogin.jar != null) auth.jar = userLogin.jar
    return tools.XHR<authResponse>(auth, 'Android')
  }
  /**
   * 获取验证码
   * 
   * @static
   * @param {request.CookieJar} [jar] 
   * @returns {Promise<captchaResponse>} 
   * @memberof AppClient
   */
  public static async getCaptcha(jar?: request.CookieJar): Promise<captchaResponse> {
    if (jar == null) jar = request.jar()
    let captcha: request.Options = {
      uri: 'https://passport.bilibili.com/captcha',
      jar,
      encoding: null
    }
    let captchaResponse = await tools.XHR<Buffer>(captcha, 'Android').catch(tools.Error)
    if (captchaResponse != null && captchaResponse.response.statusCode === 200) return {
      status: this.status.success,
      data: captchaResponse.body,
      jar
    }
    else return { status: this.status.error, data: captchaResponse }
  }
  /**
   * 客户端登录
   * 
   * @static
   * @param {loginOptions} options 
   * @returns {Promise<loginResponse>} 
   * @memberof AppClient
   */
  public static async login(options: loginOptions): Promise<loginResponse> {
    let getKeyResponse = await this._getKey(options.jar).catch(tools.Error)
    if (getKeyResponse != null && getKeyResponse.response.statusCode === 200 && getKeyResponse.body.code === 0) {
      let loginResponse = await this._Login(options, getKeyResponse.body.data).catch(tools.Error)
      if (loginResponse != null && loginResponse.response.statusCode === 200) {
        if (loginResponse.body.code === 0) return { status: this.status.success, data: loginResponse.body }
        if (loginResponse.body.code === -105) return { status: this.status.captcha, data: loginResponse.body }
        else return { status: this.status.error, data: loginResponse.body }
      }
      else return { status: this.status.httpError, data: loginResponse }
    }
    else return { status: this.status.httpError, data: getKeyResponse }
  }
  /**
   * 更新access_token
   * 
   * @static
   * @param {string} access_token 
   * @param {string} refresh_token 
   * @returns {Promise<loginResponse>} 
   * @memberof AppClient
   */
  public static async refresh(access_token: string, refresh_token: string): Promise<loginResponse> {
    let refreshQuery = `access_token=${access_token}&appkey=${this.appKey}&build=${this.build}&mobi_app=${this.mobiApp}&platform=${this.platform}&refresh_token=${refresh_token}&ts=${this.TS}`
      , refresh: request.Options = {
        method: 'POST',
        uri: 'https://passport.bilibili.com/api/v2/oauth2/refresh_token',
        body: this.signQuery(refreshQuery),
        json: true
      }
    let refreshResponse = await tools.XHR<authResponse>(refresh, 'Android').catch(tools.Error)
    if (refreshResponse != null && refreshResponse.response.statusCode === 200) {
      if (refreshResponse.body.code === 0) return { status: this.status.success, data: refreshResponse.body }
      else return { status: this.status.error, data: refreshResponse.body }
    }
    else return { status: this.status.httpError, data: refreshResponse }
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
 * 登录返回
 * 
 * @export
 * @interface authResponse
 */
export interface authResponse {
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
 * 登录验证信息
 * 
 * @export
 * @interface loginOptions
 */
export interface loginOptions {
  userName: string
  passWord: string
  captcha?: string
  jar?: request.CookieJar
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
  data: tools.response<getKeyResponse> | tools.response<authResponse> | void
}
/**
 * 验证码返回信息
 */
type captchaResponse = captchaResponseSuccess | captchaResponseError
interface captchaResponseSuccess {
  status: status.success
  data: Buffer
  jar: request.CookieJar
}
interface captchaResponseError {
  status: status.error
  data: tools.response<Buffer> | void
}