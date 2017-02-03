import * as bluebird from 'bluebird'
import * as request from 'request'
import * as tools from './lib/tools'
import { Online } from './online'
import { Options } from './options'
import { Lottery } from './lottery'
import { AppClient } from './lib/app_client'
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
    tools.UserInfo()
      .then((resolve) => {
        options = resolve
        let usersData = options.usersData
        for (let uid in usersData) {
          let userData = usersData[uid]
          userData.jar = tools.SetCookie(userData.cookie, rootOrigin)
        }
        this.Options()
        this.Online()
        this.Lottery()
      })
      .catch((reject) => { tools.Log(reject) })
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
   * 挂机抽奖
   * 
   * @memberOf BiLive
   */
  public Lottery() {
    const SLottery = new Lottery()
    SLottery.Start()
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
        options.usersData[uid].jar = resolve
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
        tools.Log(userData.nickname, '密码错误')
      })
  }
}
export let rootOrigin = 'https://api.live.bilibili.com'
export let options: config
/**
 * 应用设置
 * 
 * @export
 * @interface config
 */
export interface config {
  defaultUserID: number | null
  defaultRoomID: number
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
  jar?: request.CookieJar
  status: boolean
  doSign: boolean
  treasureBox: boolean
  eventRoom: boolean
  smallTV: boolean
  lottery: boolean
  beatStorm: boolean
}