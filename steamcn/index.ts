import * as Tools from '../lib/tools'
import {Online} from './online'
/**
 * 主程序
 * 
 * @export
 * @class SteamCN
 */
export class SteamCN {
  constructor() {
  }
  /**
   * 开始主程序
   * 
   * @memberOf SteamCN
   */
  public Start() {
    this.Online()
  }
  /**
   * 在线挂机
   * 
   * @memberOf SteamCN
   */
  public Online() {
    const SOnline = new Online()
    SOnline
      .on('cookieInfo', this._CookieInfoHandler.bind(this))
      .Start()
  }
  /**
   * 监听cookie失效事件
   * 
   * @private
   * @param {Tools.userData} userData
   * @memberOf SteamCN
   */
  private _CookieInfoHandler(userData: Tools.userData) {
    Tools.Log(appName, `${userData.userName} Cookie已失效`)
    Tools.SendMail(appName, 'Cookie 已失效', `<p>${userData.userName} Cookie失效了, 无法继续享受服务, 但是网站还在建设中, 无法提供自主更新...所以忍着吧</p>`, userData)
      .catch(() => { Tools.Log(appName, `${userData.userName} Cookie 已失效通知发出失败`) })
  }
}
export const appName = 'SteamCN'