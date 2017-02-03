import * as bluebird from 'bluebird'
import * as crypto from 'crypto'
import * as request from 'request'
import * as tools from './tools'
import { rootOrigin } from '../index'

export class AppClient {
  private static readonly _secretKey: string = '560c52ccd288fed045859ed18bffd973'
  public static readonly appKey: string = '1d8b6e7d45233436'
  public static readonly build: string = '434000'
  // public static readonly ulv: string = '10000'
  // public static readonly hwid: string = '12f957357901e986'
  // public static readonly device: string = 'android'
  public static readonly mobiApp: string = 'android'
  public static readonly platform: string = 'android'
  /**
   * 谜一样的TS
   * 
   * @readonly
   * @static
   * @type {number}
   * @memberOf AppClient
   */
  public static get TS(): number {
    return Math.floor(Date.now() / 1000)
  }
  /**
   * 对参数签名
   * 
   * @static
   * @param {string} params
   * @returns {string}
   * @memberOf AppClient
   */
  public static ParamsSign(params: string): string {
    let paramsBase = params + AppClient._secretKey
    let paramsHash = crypto.createHash('md5').update(paramsBase).digest('hex')
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
   * @memberOf AppClient
   */
  private static _RSAPassWord(passWord: string, publicKey: getKeyResponseData): string {
    let padding = {
      key: publicKey.key,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }
    let hashPassWord = publicKey.hash + passWord
    let encryptPassWord = crypto.publicEncrypt(padding, Buffer.from(hashPassWord)).toString('base64')
    return encodeURIComponent(encryptPassWord)
  }
  /**
   * 获取公钥
   * 
   * @private
   * @static
   * @returns {bluebird<string>}
   * @memberOf AppClient
   */
  private static _GetKey(): bluebird<string> {
    let getKeyOrigin = 'https://passport.bilibili.com/api/oauth2/getKey'
    let getKeyQuery = `appkey=${AppClient.appKey}&build=${AppClient.build}&mobi_app=${AppClient.mobiApp}&platform=${AppClient.platform}&ts=${AppClient.TS * 1000}`
    let getKey: request.Options = {
      method: 'POST',
      uri: `${getKeyOrigin}?${AppClient.ParamsSign(getKeyQuery)}`
    }
    return tools.XHR<string>(getKey)
  }
  /**
   * 客户端登录
   * 
   * @private
   * @static
   * @param {userLogin} userLogin
   * @param {getKeyResponseData} publicKey
   * @returns {bluebird<string>}
   * @memberOf AppClient
   */
  private static _Login(userLogin: userLogin, publicKey: getKeyResponseData): bluebird<string> {
    let passWord = AppClient._RSAPassWord(userLogin.passWord, publicKey)
    let loginOrigin = 'https://passport.bilibili.com/api/oauth2/login'
    let loginQuery = `appkey=${AppClient.appKey}&build=${AppClient.build}&mobi_app=${AppClient.mobiApp}&password=${passWord}&platform=${AppClient.platform}&ts=${AppClient.TS * 1000}&username=${encodeURIComponent(userLogin.userName)}`
    let login: request.Options = {
      method: 'POST',
      uri: loginOrigin,
      body: AppClient.ParamsSign(loginQuery)
    }
    return tools.XHR<string>(login)
  }
  /**
   * 获取token
   * 
   * @static
   * @param {userLogin} userLogin
   * @returns {bluebird<string>}
   * @memberOf AppClient
   */
  public static GetToken(userLogin: userLogin): bluebird<string> {
    return AppClient._GetKey()
      .then<string>((resolve) => {
        let getKeyResponse: getKeyResponse = JSON.parse(resolve)
        if (getKeyResponse.code === 0) return AppClient._Login(userLogin, getKeyResponse.data)
        else return bluebird.reject<getKeyResponse>(getKeyResponse)
      })
      .then<string>((resolve) => {
        let loginResponse: loginResponse = JSON.parse(resolve)
        if (loginResponse.code === 0) return loginResponse.data.access_token
        else return bluebird.reject(loginResponse)
      })
  }
  /**
   * 获取cookie
   * 
   * @static
   * @param {string} accessToken
   * @returns {bluebird<request.CookieJar>}
   * @memberOf AppClient
   */
  public static GetCookie(accessToken: string): bluebird<request.CookieJar> {
    let ssoOrigin = 'https://passport.bilibili.com/api/login/sso'
    let ssoQuery = `access_key=${accessToken}&appkey=${AppClient.appKey}&build=${AppClient.build}&gourl=${encodeURIComponent(rootOrigin)}&mobi_app=${AppClient.mobiApp}&platform=${AppClient.platform}`
    let jar = request.jar()
    let sso: request.Options = {
      uri: `${ssoOrigin}?${AppClient.ParamsSign(ssoQuery)}`,
      jar
    }
    return tools.XHR<string>(sso)
      .then((resolve) => {
        let cookie = jar.getCookieString(rootOrigin)
        if (cookie.includes('SESSDATA')) return jar
        else return bluebird.reject(jar)
      })
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