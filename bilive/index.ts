import * as fs from 'fs'
import * as request from 'request'
import * as tools from './lib/tools'
import { Online } from './online'
import { Options } from './options'
import { Listener } from './listener'
import { AppClient } from './lib/app_client'
import { Lottery, lotteryOptions } from './lottery'
import { BeatStorm, beatStormOptions } from './beatstorm'
import { beatStormInfo, smallTVInfo, lotteryInfo, lightenInfo, debugInfo } from './lib/bilive_client'
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
   * @memberOf BiLive
   */
  public Start() {
    this._SetOptionsFile()
      .then<config>(() => {
        return tools.UserInfo()
      })
      .then((resolve) => {
        options = resolve
        let usersData = options.usersData
        for (let uid in usersData) {
          let userData = usersData[uid]
          cookieJar[uid] = tools.SetCookie(userData.cookie, rootOrigin)
        }
        this.Options()
        this.Online()
        this.Listener()
      })
      .catch((reject) => { tools.Log(reject) })
  }
  /**
   * 初始化设置文件
   * 
   * @private
   * @returns {Promise<{}>} 
   * @memberOf BiLive
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
   * @memberOf BiLive
   */
  public Options() {
    const SOptions = new Options()
    SOptions
      .on('changeOptions', (config: config) => {
        options = config
        tools.UserInfo(options)
      })
      .Start()
  }
  /**
   * 在线挂机
   * 
   * @memberOf BiLive
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
   * @memberOf BiLive
   */
  public Listener() {
    const SListener = new Listener()
    SListener
      .on('smallTV', this._SmallTV.bind(this))
      .on('beatStorm', this._BeatStorm.bind(this))
      .on('lottery', this._Lottery.bind(this))
      .on('lighten', this._Lighten.bind(this))
      .on('debug', this._Debug.bind(this))
      .Start()
  }
  /**
   * 参与小电视抽奖
   * 
   * @private
   * @memberOf BiLive
   */
  private _SmallTV(smallTVInfo: smallTVInfo) {
    let usersData = options.usersData
    for (let uid in usersData) {
      let userData = usersData[uid], jar = cookieJar[uid]
      if (userData.status && userData.smallTV) {
        let lotteryOptions: lotteryOptions = {
          raffleId: smallTVInfo.id,
          roomID: smallTVInfo.roomID,
          jar,
          nickname: userData.nickname
        }
        new Lottery(lotteryOptions).SmallTV()
      }
    }
  }
  /**
   * 参与抽奖
   * 
   * @private
   * @memberOf BiLive
   */
  private _Lottery(lotteryInfo: lotteryInfo) {
    let usersData = options.usersData
    for (let uid in usersData) {
      let userData = usersData[uid], jar = cookieJar[uid]
      if (userData.status && userData.lottery) {
        let lotteryOptions: lotteryOptions = {
          raffleId: lotteryInfo.id,
          roomID: lotteryInfo.roomID,
          jar,
          nickname: userData.nickname
        }
        new Lottery(lotteryOptions).Lottery()
      }
    }
  }
  /**
   * 参与快速抽奖
   * 
   * @private
   * @param {lightenInfo} lightenInfo
   * @memberOf BiLive
   */
  private _Lighten(lightenInfo: lightenInfo) {
    let usersData = options.usersData
    for (let uid in usersData) {
      let userData = usersData[uid], jar = cookieJar[uid]
      if (userData.status && userData.lottery) {
        let lotteryOptions: lotteryOptions = {
          raffleId: lightenInfo.id,
          roomID: lightenInfo.roomID,
          jar,
          nickname: userData.nickname
        }
        new Lottery(lotteryOptions).Lighten()
      }
    }
  }
  /**
   * 节奏风暴
   * 
   * @private
   * @param {beatStormInfo} beatStormInfo
   * @memberOf BiLive
   */
  private _BeatStorm(beatStormInfo: beatStormInfo) {
    if (options.beatStormBlackList.indexOf(beatStormInfo.roomID) > -1) return
    let usersData = options.usersData
    for (let uid in usersData) {
      let userData = usersData[uid],
        jar = cookieJar[uid]
      if (userData.status && userData.beatStorm) {
        let beatStormOptions: beatStormOptions = {
          content: beatStormInfo.content,
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
  private _Debug(debugInfo: debugInfo) {
    let usersData = options.usersData
    for (let uid in usersData) {
      let userData = usersData[uid], jar = cookieJar[uid]
      if (userData.status && userData.debug) {
        let debug = {
          method: debugInfo.method,
          uri: `${rootOrigin}${debugInfo.url}`,
          body: debugInfo.body,
          jar: cookieJar[uid]
        }
        tools.XHR<string>(debug)
          .then((resolve) => { tools.Log(userData.nickname, resolve) })
          .catch((reject) => { tools.Log(userData.nickname, reject) })
      }
    }
  }
  /**
   * 监听cookie失效事件
   * 
   * @private
   * @param {string} uid
   * @memberOf BiLive
   */
  private _CookieError(uid: string) {
    let userData = options.usersData[uid]
    tools.Log(`${userData.nickname} Cookie已失效`)
    AppClient.GetCookie(userData.accessToken)
      .then((resolve) => {
        cookieJar[uid] = resolve
        options.usersData[uid].cookie = resolve.getCookieString(rootOrigin)
        tools.UserInfo(options)
        tools.Log(`${userData.nickname} Cookie已更新`)
      })
      .catch((reject) => {
        this._TokenError(uid)
      })
  }
  /**
   * 监听token失效事件
   * 
   * @private
   * @param {string} uid
   * @memberOf BiLive
   */
  private _TokenError(uid: string) {
    let userData = options.usersData[uid]
    tools.Log(userData.nickname, 'Token已失效')
    AppClient.GetToken({
      userName: userData.userName,
      passWord: userData.passWord
    })
      .then((resolve) => {
        options.usersData[uid].accessToken = resolve
        tools.UserInfo(options)
        tools.Log(`${userData.nickname} Token已更新`)
      })
      .catch((reject) => {
        options.usersData[uid].status = false
        tools.UserInfo(options)
        tools.Log(userData.nickname, 'Token更新失败', reject)
      })
  }
}
export let rootOrigin = 'https://api.live.bilibili.com',
  cookieJar: cookieJar = {},
  options: config
/**
 * 应用设置
 * 
 * @export
 * @interface config
 */
export interface config {
  defaultUserID: number | null
  defaultRoomID: number
  apiOrigin: string
  apiKey: string
  eventRooms: number[]
  beatStormBlackList: number[]
  beatStormLiveTop: number
  usersData: usersData
}
export interface usersData {
  [index: string]: userData
}
export interface userData {
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
  lottery: boolean
  beatStorm: boolean
  debug: boolean
}
export interface cookieJar {
  [index: string]: request.CookieJar
}