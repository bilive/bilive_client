import tools from './lib/tools'
import User from './user'
import Raffle from './raffle'
import RRaffle from './roomraffle'
import Options from './options'
import Listener from './listener'
import RoomListener from './roomlistener'
/**
 * 主程序
 *
 * @class BiLive
 */
class BiLive {
  constructor() {
  }
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
    tools.Log('正在测试可用ip')
    await tools.testIP(_options.apiIPs)
    for (const uid in _options.user) {
      if (!_options.user[uid].status) continue
      const user = new User(uid, _options.user[uid])
      const status = await user.Start()
      if (status !== undefined) user.Stop()
    }
    _user.forEach(user => user.daily())
    this.loop = setInterval(() => this._loop(), 50 * 1000)
    new Options().Start()
    this.Listener()
    this.RoomListener()
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
    if (cstString === '00:10') _user.forEach(user => user.nextDay())
    else if (cstString === '13:55') _user.forEach(user => user.sendGift())
    else if (cstString === '12:00') _user.forEach(user => user.autoSend())
    if (cstMin === 30 && cstHour % 8 === 0) _user.forEach(user => user.daily())
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
  private _Raffle(raffleMSG: raffleMSG | appLightenMSG) {
    _user.forEach(user => {
      if (user.captchaJPEG !== '' || !user.userData.raffle) return
      const raffleOptions: raffleOptions = {
        raffleId: raffleMSG.id,
        roomID: raffleMSG.roomID,
        user
      }
      switch (raffleMSG.cmd) {
        case 'smallTV':
          raffleOptions.time = raffleMSG.time
          return new Raffle(raffleOptions).SmallTV()
        case 'raffle':
          raffleOptions.time = raffleMSG.time
          return new Raffle(raffleOptions).Raffle()
        case 'lighten':
          raffleOptions.time = raffleMSG.time
          return new Raffle(raffleOptions).Lighten()
        case 'appLighten':
          raffleOptions.type = raffleMSG.type
          return new Raffle(raffleOptions).AppLighten()
        default:
          return
      }
    })
  }
  /**
   * 监听房间信息
   *
   * @memberof BiLive
   */
  public RoomListener() {
    const SRListener = new RoomListener()
      .on('room', roomMSG => this._RRaffle(roomMSG))
    SRListener.Start()
  }
  /**
   * 参与抽奖
   *
   * @private
   * @param {roomMSG} roomMSG
   * @memberof BiLive
   */
  private _RRaffle(roomMSG: lotteryMSG | beatStormMSG) {
    _user.forEach(user => {
      if (user.captchaJPEG !== '' || !user.userData.raffle) return
      const raffleOptions: raffleOptions = {
        raffleId: roomMSG.id,
        roomID: roomMSG.roomID,
        user
      }
      switch (roomMSG.cmd) {
        case 'lottery':
          return new RRaffle(raffleOptions).Lottery()
        case 'beatStorm':
          return new RRaffle(raffleOptions).BeatStorm()
        default:
          return
      }
    })
  }
}
// 自定义一些常量
const liveOrigin = 'http://live.bilibili.com'
const apiLiveOrigin = 'http://api.live.bilibili.com'
const smallTVPathname = '/gift/v2/smalltv'
const rafflePathname = '/activity/v1/Raffle'
const lightenPathname = '/activity/v1/NeedYou'
const lotteryPathname = '/lottery/v1/lottery'
const beatStormPathname = '/lottery/v1/Storm'
const _user: Map<string, User> = new Map()
const _options: _options = <_options>{}
export default BiLive
export { liveOrigin, apiLiveOrigin, smallTVPathname, rafflePathname, lightenPathname, lotteryPathname, beatStormPathname, _user, _options }
