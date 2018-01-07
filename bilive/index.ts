import * as tools from './lib/tools'
import { Options } from './options'
import { Listener } from './listener'
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
  // 全局计时器
  private _lastTime = ''
  public loop: NodeJS.Timer
  /**
   * 开始主程序
   * 
   * @memberof BiLive
   */
  public async Start() {
    let option = await tools.Options()
    _options = option
    tools.testIP(_options.apiIPs)
    for (let uid in _options.user) {
      if (!_options.user[uid].status) continue
      let user = new User(uid, _options.user[uid])
        , status = await user.Start()
      if (status === 'captcha') user.Stop()
    }
    this.Options()
    this.Listener()
    _user.forEach(user => user.daily())
    this.loop = setInterval(() => this._loop(), 5e+4) // 50s
  }
  /**
   * 计时器
   * 
   * @private
   * @memberof BiLive
   */
  private _loop() {
    let csttime = Date.now() + 2.88e+7
      , cst = new Date(csttime)
      , cstString = cst.toUTCString().substr(17, 5) // 'hh:mm'
    if (cstString === this._lastTime) return
    this._lastTime = cstString
    let cstHour = cst.getUTCHours()
      , cstMin = cst.getUTCMinutes()
    if (cstString === '00:10') {
      _user.forEach(user => user.nextDay())
      tools.testIP(_options.apiIPs).catch(tools.Error)
    }
    else if (cstString === '13:30') _user.forEach(user => user.sendGift().catch(error => { tools.Error(user.userData.nickname, error) }))
    if (cstMin === 30 && cstHour % 8 === 0) _user.forEach(user => user.daily())
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
    _user.forEach(user => {
      if (user.captchaJPEG !== '' || !user.userData.raffle) return
      let raffleOptions: raffleOptions = {
        raffleId: raffleMSG.id,
        roomID: raffleMSG.roomID,
        User: user
      }
      switch (raffleMSG.cmd) {
        case 'smallTV':
          new Raffle(raffleOptions).SmallTV().catch(error => { tools.Error(user.userData.nickname, raffleMSG.cmd, raffleMSG.id, error) })
          break
        case 'raffle':
          new Raffle(raffleOptions).Raffle().catch(error => { tools.Error(user.userData.nickname, raffleMSG.cmd, raffleMSG.id, error) })
          break
        case 'lighten':
          new Raffle(raffleOptions).Lighten().catch(error => { tools.Error(user.userData.nickname, raffleMSG.cmd, raffleMSG.id, error) })
          break
        case 'appLighten':
          raffleOptions.type = raffleMSG.type
          new Raffle(raffleOptions).AppLighten().catch(error => { tools.Error(user.userData.nickname, raffleMSG.cmd, raffleMSG.id, error) })
          break
        default:
          break
      }
    })
  }
}
export let liveOrigin = 'http://live.bilibili.com'
  , apiLiveOrigin = 'http://api.live.bilibili.com'
  , smallTVPathname = '/gift/v2/smalltv'
  , rafflePathname = '/activity/v1/Raffle'
  , lightenPathname = '/activity/v1/NeedYou'
  , _user: Map<string, User> = new Map()
  , _options: _options