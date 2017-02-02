import * as bluebird from 'bluebird'
import * as request from 'request'
import * as tools from './lib/tools'
import { Online } from './online'
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
        this.Online()
        this.Lottery()
      })
      .catch((reject) => { tools.Log(reject) })
  }
  /**
   * 在线挂机
   * 
   * @memberOf BiLive
   */
  public Online() {
    const SOnline = new Online()
    SOnline
      .on('cookieError', this._CookieErrorHandler.bind(this))
      .on('tokenError', this._TokenErrorHandler.bind(this))
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
   * @param {userData} userData
   * @memberOf BiLive
   */
  private _CookieErrorHandler([uid, userData]: [string, userData]) {
    tools.Log(`${userData.nickname} Cookie已失效`)
    AppClient.GetCookie(userData.accessToken)
      .then((resolve) => {
        userData.cookie = resolve
        tools.UserInfo(uid, userData)
        userData.jar = tools.SetCookie(userData.cookie, rootOrigin)
        tools.Log(`${userData.nickname} Cookie已更新`)
      })
      .catch((reject) => {
        this._TokenErrorHandler([uid, userData])
      })
  }
  /**
   * 监听token失效事件
   * 
   * @private
   * @param {userData} userData
   * @memberOf BiLive
   */
  private _TokenErrorHandler([uid, userData]: [string, userData]) {
    tools.Log(userData.nickname, 'Token已失效')
    AppClient.GetToken({
      userName: userData.userName,
      passWord: userData.passWord
    })
      .then((resolve) => {
        userData.accessToken = resolve
        tools.UserInfo(uid, userData)
        tools.Log(`${userData.nickname} Token已更新`)
      })
      .catch((reject) => {
        userData.status = false
        tools.UserInfo(uid, userData)
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
  defaultUserID: number
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
  jar: request.CookieJar
  status: boolean
  doSign: boolean
  treasureBox: boolean
  eventRoom: boolean
  smallTV: boolean
  lottery: boolean
  beatStorm: boolean
}