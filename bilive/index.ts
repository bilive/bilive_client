import * as tools from './lib/tools'
import { Online } from './online'
import { Options } from './options'
import { Listener } from './listener'
import { AppClient } from './lib/app_client'
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
      let userData = user[uid]
      cookieJar[uid] = tools.setCookie(userData.cookie, [apiLiveOrigin])
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
    let usersData = _options.user
    for (let uid in usersData) {
      let userData = usersData[uid], jar = cookieJar[uid]
      if (userData.status && userData.raffle) {
        let raffleOptions: raffleOptions = {
          raffleId: raffleMSG.id,
          roomID: raffleMSG.roomID,
          userData,
          jar
        }
        switch (raffleMSG.cmd) {
          case 'smallTV':
            new Raffle(raffleOptions).SmallTV().catch(error => { tools.Error(userData.nickname, error) })
            break
          case 'raffle':
            new Raffle(raffleOptions).Raffle().catch(error => { tools.Error(userData.nickname, error) })
            break
          case 'lighten':
            new Raffle(raffleOptions).Lighten().catch(error => { tools.Error(userData.nickname, error) })
            break
          case 'appLighten':
            raffleOptions.type = raffleMSG.type
            new Raffle(raffleOptions).AppLighten().catch(error => { tools.Error(userData.nickname, error) })
            break
          default:
            break
        }
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
    let userData = _options.user[uid]
    tools.Log(userData.nickname, 'Cookie已失效')
    let cookie = await AppClient.GetCookie(userData.accessToken)
    if (cookie != null) {
      cookieJar[uid] = cookie
      _options.user[uid].cookie = cookie.getCookieString(apiLiveOrigin)
      _options.user[uid].biliUID = parseInt(tools.getCookie(cookie, 'DedeUserID'))
      tools.Options(_options)
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
    let userData = _options.user[uid]
    tools.Log(userData.nickname, 'Token已失效')
    let token = await AppClient.GetToken({
      userName: userData.userName,
      passWord: userData.passWord
    })
    if (typeof token === 'string') {
      _options.user[uid].accessToken = token
      tools.Options(_options)
      tools.Log(userData.nickname, 'Token已更新')
    }
    else if (token != null && token.response.statusCode === 200) {
      _options.user[uid].status = false
      tools.Options(_options)
      tools.Log(userData.nickname, 'Token更新失败', token.body)
    }
    else tools.Log(userData.nickname, 'Token更新失败')
  }
}
export let liveOrigin = 'http://live.bilibili.com'
  , apiLiveOrigin = 'http://api.live.bilibili.com'
  , smallTVPathname = '/gift/v2/smalltv'
  , rafflePathname = '/activity/v1/Raffle'
  , lightenPathname = '/activity/v1/NeedYou'
  , cookieJar: cookieJar = {}
  , _options: _options