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
  constructor() {}
  // 是否开启抽奖
  private _raffle = false
  // 全局计时器
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
    _user.forEach(user => user.getUserInfo())// 开始挂机时，获取用户信息
    _user.forEach(user => user.getGiftBag())// 开始挂机时，获取用户礼物包裹信息
    _user.forEach(user => user.daily())
    this.loop = setInterval(() => this._loop(), 55 * 1000)
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
    const cstHour = cst.getUTCHours()
    const cstMin = cst.getUTCMinutes()
    if (cstString === '00:10') _user.forEach(user => user.nextDay())// 每天00:10刷新任务
    if (cstString === '13:58') _user.forEach(user => user.sendGift())// 每天13:58再次自动送礼, 因为一般活动14:00结束
    if (cstMin === 30 && cstHour % 6 === 0) _user.forEach(user => user.daily())// 每天00:30, 06:30, 12:30, 18:30做日常
    if (((cstHour - 1) % 12 === 0) && cstMin === 0) _user.forEach(user => user.autoSend())// 每天01:00, 13:00做自动送礼V2
    if (cstMin === 0) _user.forEach(user => user.getUserInfo())//整点获取用户信息
    if (cstMin === 30 && cstHour % 4 === 0) _user.forEach(user => user.getGiftBag())//每天00:30开始每隔4h获取用户包裹信息
    const rafflePause = _options.config.rafflePause// 抽奖暂停
    if (rafflePause.length > 1) {
      const start = rafflePause[0]
      const end = rafflePause[1]
      if (start > end && (cstHour >= start || cstHour < end) || (cstHour >= start && cstHour < end)) this._raffle = false
      else this._raffle = true
    }
    else this._raffle = true
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
    _user.forEach(user => {
      if (!this._raffle && user.userData.raffleLimit) return
      if (user.captchaJPEG !== '' || !user.userData.raffle) return
      if (Math.random() < _options.config.droprate / 100 && user.userData.raffleLimit) return tools.Log(user.nickname, "随机丢弃", raffleMSG.title, raffleMSG.id)
      const raffleOptions: raffleOptions = { ...raffleMSG, raffleId: raffleMSG.id, user }
      return new Raffle(raffleOptions).Start()
    })
  }
}
// 自定义一些常量
const liveOrigin = 'http://live.bilibili.com'
const apiVCOrigin = 'http://api.vc.bilibili.com'
const apiLiveOrigin = 'http://api.live.bilibili.com'
const smallTVPathname = '/gift/v4/smalltv'
const rafflePathname = '/activity/v1/Raffle'
const lotteryPathname = '/lottery/v1/lottery'
const _user: Map<string, User> = new Map()
const _options: _options = <_options>{}
export default BiLive
export { liveOrigin, apiVCOrigin, apiLiveOrigin, smallTVPathname, rafflePathname, lotteryPathname, _user, _options }
