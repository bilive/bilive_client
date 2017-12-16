import * as tools from './lib/tools'
import { Online } from './online'
import { Options } from './options'
import { Listener } from './listener'
import { AppClient } from './lib/app_client'
import { User } from './user'
import { Raffle } from './raffle'
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
    let option = await tools.Options()
    _options = option
    let user = option.user
    for (let uid in user) {
      if (!user[uid].status) continue
      _user.set(uid, new User(user[uid]))
    }
    this.Options()
    this.Online()
    this.Listener()
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
      .on('raffle', this._Raffle.bind(this))
      .Start()
  }
  /**
   * 参与抽奖
   * 
   * @private
   * @param {raffleMSG} raffleMSG 
   * @memberof BiLive
   */
  private _Raffle(raffleMSG: raffleMSG | appLightenMSG) {
    _user.forEach(User => {
      if (!User.userData.raffle) return
      let raffleOptions: raffleOptions = {
        raffleId: raffleMSG.id,
        roomID: raffleMSG.roomID,
        User: User
      }
      switch (raffleMSG.cmd) {
        case 'smallTV':
          new Raffle(raffleOptions).SmallTV().catch(error => { tools.Error(User.userData.nickname, error) })
          break
        case 'raffle':
          new Raffle(raffleOptions).Raffle().catch(error => { tools.Error(User.userData.nickname, error) })
          break
        case 'lighten':
          new Raffle(raffleOptions).Lighten().catch(error => { tools.Error(User.userData.nickname, error) })
          break
        case 'appLighten':
          raffleOptions.type = raffleMSG.type
          new Raffle(raffleOptions).AppLighten().catch(error => { tools.Error(User.userData.nickname, error) })
          break
        default:
          break
      }
    })
  }
  /**
   * 监听cookie失效事件
   * 
   * @private
   * @param {string} uid
   * @memberof BiLive
   */
  private async _CookieError(uid: string) {
    let User = _user.get(uid)
    if (User == null) {
      tools.Log('Cookie更新', `uid ${uid} 无效`)
      return
    }
    tools.Log(User.userData.nickname, 'Cookie已失效')
    let cookie = await AppClient.GetCookie(User.userData.accessToken)
    if (cookie != null) {
      User.jar = cookie
      User.userData.cookie = cookie.getCookieString(apiLiveOrigin)
      User.userData.biliUID = parseInt(tools.getCookie(cookie, 'DedeUserID'))
      tools.Options(_options)
      tools.Log(User.userData.nickname, 'Cookie已更新')
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
    let User = _user.get(uid)
    if (User == null) {
      tools.Log('Token更新', `uid ${uid} 无效`)
      return
    }
    tools.Log(User.userData.nickname, 'Token已失效')
    let token = await AppClient.GetToken({
      userName: User.userData.userName,
      passWord: User.userData.passWord
    })
    if (typeof token === 'string') {
      User.userData.accessToken = token
      tools.Options(_options)
      tools.Log(User.userData.nickname, 'Token已更新')
    }
    else if (token != null && token.response.statusCode === 200) {
      User.userData.status = false
      _user.delete(uid)
      tools.Options(_options)
      tools.Log(User.userData.nickname, 'Token更新失败', token.body)
    }
    else tools.Log(User.userData.nickname, 'Token更新失败')
  }
}
export let liveOrigin = 'http://live.bilibili.com'
  , apiLiveOrigin = 'http://api.live.bilibili.com'
  , smallTVPathname = '/gift/v2/smalltv'
  , rafflePathname = '/activity/v1/Raffle'
  , lightenPathname = '/activity/v1/NeedYou'
  , _user: Map<string, User> = new Map()
  , _options: _options