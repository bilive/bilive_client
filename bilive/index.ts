import * as Tools from '../lib/tools'
import {Online} from './online'
import {Lottery} from './lottery'
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
   */
  public Start() {
    this.Online()
    this.Lottery()
  }
  /**
   * 在线挂机
   * 
   * @private
   */
  private Online() {
    const SOnline = new Online()
    SOnline
      .on('cookieInfo', this.CookieInfoHandler.bind(this))
      .on('signInfo', (userData: Tools.userData) => { Tools.Log(appName, `${userData.userName} 正在签到`) })
    SOnline.Start()
  }
  /**
   * 挂机抽奖
   * 
   * @private
   */
  private Lottery() {
    const SLottery = new Lottery()
    SLottery
      .on('smalltv', this.SmallTVHandler.bind(this))
      .on('lottery', this.LotteryHandler.bind(this))
      .on('serverError', this.ServerErrorHandler.bind(this))
    SLottery.Start()
  }
  /**
   * 监听小电视事件
   * 
   * @private
   * @param {Tools.userData} userData
   */
  private SmallTVHandler(userData: Tools.userData) {
    Tools.Log(appName, `${userData.userName} 获得 1 个大号小电视`)
    Tools.SendMail(appName, '小电视已收入囊中', `<p>${userData.userName}, 你™居然中了个小电视, 滚去<a href="http://live.bilibili.com/i/awards">http://live.bilibili.com/i/awards</a>领取</p>`, userData)
      .catch(() => { Tools.Log(appName, `${userData.userName} 的大号小电视通知发出失败`) })
  }
  /**
   * 监听抽奖事件
   * 
   * @private
   * @param {Tools.userData} userData
   */
  private LotteryHandler(userData: Tools.userData) {
    Tools.Log(appName, `${userData.userName} 获得 1 个凉拖`)
    Tools.SendMail(appName, '凉拖已收入囊中', `<p>${userData.userName}, 你™居然中了个凉拖, 滚去<a href="http://live.bilibili.com/i/awards">http://live.bilibili.com/i/awards</a>领取</p>`, userData)
      .catch(() => { Tools.Log(appName, `${userData.userName} 的凉拖通知发出失败`) })
  }
  /**
   * 监听服务器连接异常事件
   * 
   * @private
   */
  private ServerErrorHandler() {
    Tools.Log(appName, '弹幕服务器连接中断30分钟')
    Tools.SendMail(appName, '弹幕服务器连接中断', '<p>弹幕服务器连接中断30分钟， 请及时检查网络配置</p>')
  }
  /**
   * 监听cookie失效事件
   * 
   * @private
   * @param {Tools.userData} userData
   */
  private CookieInfoHandler(userData: Tools.userData) {
    Tools.Log(appName, `${userData.userName} Cookie已失效`)
    Tools.SendMail(appName, 'Cookie 已失效', `<p>${userData.userName} Cookie失效了, 无法继续享受服务, 但是网站还在建设中, 无法提供自主更新...所以忍着吧</p>`, userData)
      .catch(() => { Tools.Log(appName, `${userData.userName} Cookie 已失效通知发出失败`) })
  }
}
export const appName = 'BiLive'
/**
 * 应用设置
 * 
 * @export
 * @interface config
 * @extends {Tools.config}
 */
export interface config extends Tools.config {
  defaultUserID: number
  defaultRommID: number
}