import * as fs from 'fs'
import * as request from 'request'
import * as tools from './lib/tools'
import { Online } from './online'
import { Options } from './options'
import { Listener } from './listener'
import { AppClient } from './lib/app_client'
import { Raffle, raffleOptions } from './raffle'
import { BeatStorm, beatStormOptions } from './beatstorm'
import { beatStormInfo, smallTVInfo, raffleInfo, lightenInfo, debugInfo } from './lib/bilive_client'
/**
 * 主程序
 * 
 * @export
 * @class BiLive
 */
export class BiLive {
  constructor() {
  }
  /**
   * 开始主程序
   * 
   * @memberof BiLive
   */
  public async Start() {
    await this._SetOptionsFile()
    let option = await tools.Options().catch(tools.Error)
    if (option != null) {
      options = option
      let user = option.user
      for (let uid in user) {
        let userData = user[uid]
        cookieJar[uid] = tools.SetCookie(userData.cookie, [apiLiveOrigin])
      }
      this.Options()
      this.Online()
      this.Listener()
    }
  }
  /**
   * 初始化设置文件
   * 
   * @private
   * @returns {Promise<{}>} 
   * @memberof BiLive
   */
  private _SetOptionsFile(): Promise<{}> {
    return new Promise((resolve, reject) => {
      fs.exists(`${__dirname}/options.json`, exists => {
        if (exists) resolve()
        else {
          fs.createReadStream(`${__dirname}/options.default.json`)
            .pipe(fs.createWriteStream(`${__dirname}/options.json`))
            .on('error', (error) => {
              reject(error)
            })
            .on('close', () => {
              resolve()
            })
        }
      })
    })
  }
  /**
   * 用户设置
   * 
   * @memberof BiLive
   */
  public Options() {
    const SOptions = new Options()
    SOptions.Start()
  }
  /**
   * 在线挂机
   * 
   * @memberof BiLive
   */
  public Online() {
    const SOnline = new Online()
    SOnline
      .on('cookieError', this._CookieError.bind(this))
      .on('tokenError', this._TokenError.bind(this))
      .Start()
  }
  /**
   * 监听
   * 
   * @memberof BiLive
   */
  public Listener() {
    const SListener = new Listener()
    SListener
      .on('smallTV', this._SmallTV.bind(this))
      .on('beatStorm', this._BeatStorm.bind(this))
      .on('raffle', this._Raffle.bind(this))
      .on('lighten', this._Lighten.bind(this))
      .on('debug', this._Debug.bind(this))
      .Start()
  }
  /**
   * 参与小电视抽奖
   * 
   * @private
   * @memberof BiLive
   */
  private _SmallTV(smallTVInfo: smallTVInfo) {
    let usersData = options.user
    for (let uid in usersData) {
      let userData = usersData[uid], jar = cookieJar[uid]
      if (userData.status && userData.smallTV) {
        let raffleOptions: raffleOptions = {
          raffleId: smallTVInfo.id,
          roomID: smallTVInfo.roomID,
          jar,
          nickname: userData.nickname
        }
        let newRaffle = new Raffle(raffleOptions)
        if (smallTVInfo.pathname != null) {
          smallTVPathname = smallTVInfo.pathname
          newRaffle.smallTVUrl = apiLiveOrigin + smallTVInfo.pathname
        }
        newRaffle.SmallTV()
      }
    }
  }
  /**
   * 参与抽奖
   * 
   * @private
   * @memberof BiLive
   */
  private _Raffle(raffleInfo: raffleInfo) {
    let usersData = options.user
    for (let uid in usersData) {
      let userData = usersData[uid], jar = cookieJar[uid]
      if (userData.status && userData.raffle) {
        let raffleOptions: raffleOptions = {
          raffleId: raffleInfo.id,
          roomID: raffleInfo.roomID,
          jar,
          nickname: userData.nickname
        }
        let newRaffle = new Raffle(raffleOptions)
        if (raffleInfo.pathname != null) {
          rafflePathname = raffleInfo.pathname
          newRaffle.raffleUrl = apiLiveOrigin + raffleInfo.pathname
        }
        newRaffle.Raffle()
      }
    }
  }
  /**
   * 参与快速抽奖
   * 
   * @private
   * @param {lightenInfo} lightenInfo
   * @memberof BiLive
   */
  private _Lighten(lightenInfo: lightenInfo) {
    let usersData = options.user
    for (let uid in usersData) {
      let userData = usersData[uid], jar = cookieJar[uid]
      if (userData.status && userData.raffle) {
        let raffleOptions: raffleOptions = {
          raffleId: lightenInfo.id,
          roomID: lightenInfo.roomID,
          jar,
          nickname: userData.nickname
        }
        let newRaffle = new Raffle(raffleOptions)
        if (lightenInfo.pathname != null) {
          lightenPathname = lightenInfo.pathname
          newRaffle.lightenUrl = apiLiveOrigin + lightenInfo.pathname
        }
        newRaffle.Lighten()
      }
    }
  }
  /**
   * 节奏风暴
   * 
   * @private
   * @param {beatStormInfo} beatStormInfo
   * @memberof BiLive
   */
  private _BeatStorm(beatStormInfo: beatStormInfo) {
    let config = options.config
    if (config.beatStormBlackList.includes(beatStormInfo.roomID)) return
    let usersData = options.user
    for (let uid in usersData) {
      let userData = usersData[uid]
        , jar = cookieJar[uid]
      if (userData.status && userData.beatStorm) {
        let beatStormOptions: beatStormOptions = {
          content: beatStormInfo.content,
          stormID: beatStormInfo.id,
          roomID: beatStormInfo.roomID,
          jar,
          nickname: userData.nickname
        }
        new BeatStorm(beatStormOptions)
      }
    }
  }
  /**
   * 远程调试
   * 
   * @private
   * @param {debugInfo} debugInfo
   * @memberof BiLive
   */
  private async _Debug(debugInfo: debugInfo) {
    let usersData = options.user
    for (let uid in usersData) {
      let userData = usersData[uid], jar = cookieJar[uid]
      if (userData.status && userData.debug) {
        let debug = {
          method: debugInfo.method,
          uri: `${apiLiveOrigin}${debugInfo.url}`,
          body: debugInfo.body,
          jar
        }
        tools.XHR<string>(debug, debugInfo.driver)
          .then((resolve) => { tools.Log(userData.nickname, resolve.body) })
          .catch((reject) => { tools.Error(userData.nickname, reject) })
      }
    }
  }
  /**
   * 监听cookie失效事件
   * 
   * @private
   * @param {string} uid
   * @memberof BiLive
   */
  private async _CookieError(uid: string) {
    let userData = options.user[uid]
    tools.Log(userData.nickname, 'Cookie已失效')
    let cookie = await AppClient.GetCookie(userData.accessToken)
    if (cookie != null) {
      cookieJar[uid] = cookie
      options.user[uid].cookie = cookie.getCookieString(apiLiveOrigin)
      tools.Options(options)
      tools.Log(userData.nickname, 'Cookie已更新')
    }
    else this._TokenError(uid)
  }
  /**
   * 监听token失效事件
   * 
   * @private
   * @param {string} uid
   * @memberof BiLive
   */
  private async _TokenError(uid: string) {
    let userData = options.user[uid]
    tools.Log(userData.nickname, 'Token已失效')
    let token = await AppClient.GetToken({
      userName: userData.userName,
      passWord: userData.passWord
    })
    if (typeof token === 'string') {
      options.user[uid].accessToken = token
      tools.Options(options)
      tools.Log(userData.nickname, 'Token已更新')
    }
    else if (token != null) {
      options.user[uid].status = false
      tools.Options(options)
      tools.Log(userData.nickname, 'Token更新失败', token.body)
    }
    else tools.Log(userData.nickname, 'Token更新失败')
  }
}
export let apiLiveOrigin = 'http://api.live.bilibili.com'
  , smallTVPathname = '/SmallTV'
  , rafflePathname = '/activity/v1/Raffle'
  , lightenPathname = '/activity/v1/NeedYou'
  , cookieJar: cookieJar = {}
  , options: options
/**
 * 应用设置
 * 
 * @export
 * @interface options
 */
export interface options {
  server: server
  config: config
  user: userCollection
  newUserData: userData
  info: optionsInfo
}
export interface server {
  path: string
  hostname: string
  port: number
  protocol: string
}
export interface config {
  [index: string]: number | string | number[]
  defaultUserID: number
  defaultRoomID: number
  apiOrigin: string
  apiKey: string
  eventRooms: number[]
  beatStormBlackList: number[]
}
export interface userCollection {
  [index: string]: userData
}
export interface userData {
  [index: string]: string | boolean
  nickname: string
  userName: string
  passWord: string
  accessToken: string
  cookie: string
  status: boolean
  doSign: boolean
  treasureBox: boolean
  eventRoom: boolean
  smallTV: boolean
  raffle: boolean
  beatStorm: boolean
  debug: boolean
}
export interface optionsInfo {
  defaultUserID: configInfoData
  defaultRoomID: configInfoData
  apiOrigin: configInfoData
  apiKey: configInfoData
  eventRooms: configInfoData
  beatStormBlackList: configInfoData
  beatStormLiveTop: configInfoData
  nickname: configInfoData
  userName: configInfoData
  passWord: configInfoData
  accessToken: configInfoData
  cookie: configInfoData
  status: configInfoData
  doSign: configInfoData
  treasureBox: configInfoData
  eventRoom: configInfoData
  smallTV: configInfoData
  raffle: configInfoData
  beatStorm: configInfoData
  debug: configInfoData
}
export interface configInfoData {
  description: string
  tip: string
  type: string
}
export interface cookieJar {
  [index: string]: request.CookieJar
}