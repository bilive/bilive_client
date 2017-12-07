import * as crypto from 'crypto'
import * as request from 'request'
import * as tools from './tools'
import { apiLiveOrigin } from '../index'

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
   * @static
   * @memberof AppClient
   */
  public static readonly baseQuery = `appkey=${AppClient.appKey}&build=${AppClient.build}&mobi_app=${AppClient.mobiApp}&platform=${AppClient.platform}&ts=${AppClient.TS}`
  /**
   * 对参数签名
   * 
   * @static
   * @param {string} params
   * @returns {string}
   * @memberof AppClient
   */
  public static ParamsSign(params: string): string {
    let paramsBase = params + AppClient._secretKey
      , paramsHash = tools.Hash('md5', paramsBase)
    return `${params}&sign=${paramsHash}`
  }
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
      padding: (<any>crypto).constants.RSA_PKCS1_PADDING
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
   * @returns {Promise<tools.response<getKeyResponse>>} 
   * @memberof AppClient
   */
  private static _GetKey(): Promise<tools.response<getKeyResponse>> {
    let getKeyOrigin = 'https://passport.bilibili.com/api/oauth2/getKey'
      , getKeyQuery = AppClient.baseQuery
      , getKey: request.Options = {
        method: 'POST',
        uri: getKeyOrigin,
        body: AppClient.ParamsSign(getKeyQuery),
        json: true
      }
    return tools.XHR<getKeyResponse>(getKey, 'Android')
  }
  /**
   * 客户端登录
   * 
   * @private
   * @static
   * @param {userLogin} userLogin 
   * @param {getKeyResponseData} publicKey 
   * @returns {Promise<tools.response<loginResponse>>} 
   * @memberof AppClient
   */
  private static _Login(userLogin: userLogin, publicKey: getKeyResponseData): Promise<tools.response<loginResponse>> {
    // captcha=
    // Ste-Cookie JSESSIONID
    // https://passport.bilibili.com/captcha
    let passWord = AppClient._RSAPassWord(userLogin.passWord, publicKey)
      , loginOrigin = 'https://passport.bilibili.com/api/oauth2/login'
      , loginQuery = `appkey=${AppClient.appKey}&build=${AppClient.build}&mobi_app=${AppClient.mobiApp}&password=${passWord}&platform=${AppClient.platform}&ts=${AppClient.TS}&username=${encodeURIComponent(userLogin.userName)}`
      , login: request.Options = {
        method: 'POST',
        uri: loginOrigin,
        body: AppClient.ParamsSign(loginQuery),
        json: true
      }
    return tools.XHR<loginResponse>(login, 'Android')
  }
  /**
   * 获取token
   * 
   * @static
   * @param {userLogin} userLogin 
   * @returns {(Promise<string | void | tools.response<loginResponse> | tools.response<getKeyResponse>>)} 
   * @memberof AppClient
   */
  public static async GetToken(userLogin: userLogin): Promise<string | void | tools.response<loginResponse> | tools.response<getKeyResponse>> {
    let getKeyResponse = await AppClient._GetKey().catch(tools.Error)
    if (getKeyResponse != null && getKeyResponse.body.code === 0) {
      let loginResponse = await AppClient._Login(userLogin, getKeyResponse.body.data).catch(tools.Error)
      if (loginResponse != null && loginResponse.body.code === 0) return loginResponse.body.data.access_token
      else return loginResponse
    }
    else return getKeyResponse
  }
  /**
   * 获取cookie
   * 
   * @static
   * @param {string} accessToken 
   * @returns {(Promise<void | request.CookieJar>)} 
   * @memberof AppClient
   */
  public static async GetCookie(accessToken: string): Promise<void | request.CookieJar> {
    let ssoOrigin = 'https://passport.bilibili.com/api/login/sso'
      , ssoQuery = `access_key=${accessToken}&appkey=${AppClient.appKey}&build=${AppClient.build}&gourl=${encodeURIComponent(apiLiveOrigin)}&mobi_app=${AppClient.mobiApp}&platform=${AppClient.platform}&ts=${AppClient.TS}`
      , jar = request.jar()
      , sso: request.Options = {
        uri: `${ssoOrigin}?${AppClient.ParamsSign(ssoQuery)}`,
        jar
      }
    let gourl = await tools.XHR(sso, 'WebView').catch(tools.Error)
    if (gourl != null) {
      let cookie = jar.getCookieString(apiLiveOrigin)
      if (cookie.includes('SESSDATA')) return jar
    }
    else return gourl
  }
}
/**
 * 公钥返回
 * 
 * @export
 * @interface getKeyResponse
 */
export interface getKeyResponse {
  ts: number
  code: number
  data: getKeyResponseData
}
export interface getKeyResponseData {
  hash: string
  key: string
}
/**
 * 登录返回
 * 
 * @export
 * @interface loginResponse
 */
export interface loginResponse {
  ts: number
  code: number
  data: loginResponseData
}
export interface loginResponseData {
  mid: number
  access_token: string
  refresh_token: string
  expires_in: number
}
/**
 * 用户信息
 * 
 * @export
 * @interface userLogin
 */
export interface userLogin {
  userName: string
  passWord: string
}