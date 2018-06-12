import tools from './lib/tools'
import User from './user'
import Raffle from './raffle'
import Options from './options'
import Listener from './listener'
/**
 * 主程序
 *
 * @class BiLive
 */
class BiLive {
  constructor() {
  }
  // 是否开启抽奖
  private _raffle = true
  // 全局计时器
  private _lastTime = ''
  public loop!: NodeJS.Timer
  /**
   * 开始主程序
   *
   * @memberof BiLive
   */
  public async Start() {
    const option = await tools.Options()
    Object.assign(_options, option)
    await tools.testIP(_options.apiIPs)
    for (const uid in _options.user) {
      if (!_options.user[uid].status) continue
      const user = new User(uid, _options.user[uid])
      const status = await user.Start()
      if (status !== undefined) user.Stop()
    }
    _user.forEach(user => user.GetUserInfo())// 开始挂机时，获取用户信息
    _user.forEach(user => user.daily())
    this.loop = setInterval(() => this._loop(), 50 * 1000)
    new Options().Start()
    this.Listener()
  }
  /**
   * 计时器
   *
   * @private
   * @memberof BiLive
   */
  private _loop() {
    const csttime = Date.now() + 8 * 60 * 60 * 1000
    const cst = new Date(csttime)
    const cstString = cst.toUTCString().substr(17, 5) // 'HH:mm'
    if (cstString === this._lastTime) return
    this._lastTime = cstString
    const cstHour = cst.getUTCHours()
    const cstMin = cst.getUTCMinutes()
    if (cstString === '00:10') _user.forEach(user => user.nextDay())// 每天00:10刷新任务
    else if (cstString === '13:58') _user.forEach(user => user.sendGift())// 每天13:58再次自动送礼, 因为一般活动14:00结束
    if (cstMin === 30 && cstHour % 6 === 0) _user.forEach(user => user.daily())// 每天00:30, 06:30, 12:30, 18:30做日常
    else if (((cstHour - 1) % 12 === 0) && cstMin === 0) _user.forEach(user => user.autoSend())// 每天01:00, 13:00做自动送礼V2
    if (cstMin === 0) _user.forEach(user => user.GetUserInfo())//整点获取用户信息
  }
  /**
   * 监听
   *
   * @memberof BiLive
   */
  public Listener() {
    const SListener = new Listener()
      .on('raffle', raffleMSG => this._Raffle(raffleMSG))
    SListener.Start()
  }
  /**
   * 参与抽奖
   *
   * @private
   * @param {raffleMSG} raffleMSG
   * @memberof BiLive
   */
  private async _Raffle(raffleMSG: message) {
    if (!this._raffle) return
    const raffleDelay = _options.config.raffleDelay
    if (raffleDelay !== 0) await tools.Sleep(raffleDelay)
    _user.forEach(user => {
      if (user.captchaJPEG !== '' || !user.userData.raffle) return
      const raffleOptions: raffleOptions = { ...raffleMSG, raffleId: raffleMSG.id, user }
      switch (raffleMSG.cmd) {
        case 'smallTV':
          raffleOptions.time = raffleMSG.time
          return new Raffle(raffleOptions).SmallTV()
        case 'raffle':
          raffleOptions.time = raffleMSG.time
          return new Raffle(raffleOptions).Raffle()
        case 'lottery':
          raffleOptions.type = raffleMSG.type
          return new Raffle(raffleOptions).Lottery()
        case 'appLighten':
          raffleOptions.type = raffleMSG.type
          return new Raffle(raffleOptions).AppLighten()
        default:
          return
      }
    })
  }
}
// 自定义一些常量
const liveOrigin = 'http://live.bilibili.com'
const apiVCOrigin = 'http://api.vc.bilibili.com'
const apiLiveOrigin = 'http://api.live.bilibili.com'
const smallTVPathname = '/gift/v3/smalltv'
const rafflePathname = '/activity/v1/Raffle'
const lotteryPathname = '/lottery/v1/lottery'
const _user: Map<string, User> = new Map()
const _options: _options = <_options>{}
export default BiLive
export { liveOrigin, apiVCOrigin, apiLiveOrigin, smallTVPathname, rafflePathname, lotteryPathname, _user, _options }
