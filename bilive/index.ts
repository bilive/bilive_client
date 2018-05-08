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
  private _raffle = false
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
    // 每天00:10刷新任务
    if (cstString === '00:10') _user.forEach(user => user.nextDay())
    // 每天13:55再次自动送礼, 因为一般活动14:00结束
    else if (cstString === '13:55') _user.forEach(user => user.sendGift())
    // 每天00:30, 08:30, 16:30做日常
    if (cstMin === 30 && cstHour % 8 === 0) _user.forEach(user => user.daily())
    // 抽奖暂停
    const rafflePause = _options.config.rafflePause
    if (rafflePause.length > 1) {
      const start = rafflePause[0]
      const end = rafflePause[1]
      if (start > end && (cstHour >= start || cstHour < end) || (cstHour >= start && cstHour < end)) this._raffle = false
      else this._raffle = true
    }
    else this._raffle = true
    if (cstString === _options.config.calcgifttime) this.calcgift()
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
  private async _Raffle(raffleMSG: raffleMSG | lotteryMSG) {
    if (!this._raffle) return
    const raffleDelay = _options.config.raffleDelay
    if (raffleDelay !== 0) await tools.Sleep(raffleDelay)
    _user.forEach(user => {
      if (user.captchaJPEG !== '' || !user.userData.raffle) return
      if (Math.random() < _options.config.droprate / 100) {
        tools.Log(user.nickname, "随机丢弃", raffleMSG.cmd, raffleMSG.id)
        return
      }
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
  /**
 * calcgift
 */
  private async calcgift() {
    var giftBundles: { "id": number; "name": string; "total": number; "oneDay": number; "twoDay": number; }[] = []
    var faillist: { "user": string; "reason": string; }[] = []
    var checking: Promise<any>[] = [];
    _user.forEach((user) => {
      checking.push(user.checkgift().then(value => {
        var baginfo = value
        if (baginfo === undefined || baginfo.response.statusCode !== 200) {
          faillist.push({ "user": user.nickname, "reason": "未知" });
          return;
        }
        if (baginfo.body.code === 0) {
          for (const giftData of baginfo.body.data) {
            var target = -1;
            for (let index = 0; index < giftBundles.length; index++) {
              if (giftBundles[index].id == giftData.gift_id) {
                target = index;
                break;
              }
            }
            if (target == -1) {
              giftBundles.push({ "id": giftData.gift_id, "name": giftData.gift_name, "total": giftData.gift_num, "oneDay": (giftData.expireat > 0 && giftData.expireat < 24 * 60 * 60) ? giftData.gift_num : 0, "twoDay": (giftData.expireat > 0 && giftData.expireat < 48 * 60 * 60) ? giftData.gift_num : 0 })
            } else {
              giftBundles[target].total += giftData.gift_num;
              giftBundles[target].oneDay += (giftData.expireat > 0 && giftData.expireat < 24 * 60 * 60) ? giftData.gift_num : 0
              giftBundles[target].twoDay += (giftData.expireat > 0 && giftData.expireat < 48 * 60 * 60) ? giftData.gift_num : 0
            }
          }
        } else {
          faillist.push({ "user": user.nickname, "reason": JSON.stringify(baginfo.body) });
        }
      }))
    });
    await Promise.all(checking);
    var checkresulttext = "###礼物检查结果\n";
    checkresulttext = checkresulttext + "| ==礼物名称== | ==总共== | ==48小时之内== | ==24小时之内== |\n| :-: | :-: | :-: | :-: |\n"
    giftBundles.forEach(giftBundle => {
      checkresulttext = checkresulttext + "| " + giftBundle.name + " | " + giftBundle.total + " | " + giftBundle.twoDay + " |" + giftBundle.oneDay + " |\n";
    });
    var faillisttext = "###检查失败用户\n"
    faillisttext = faillisttext + "| =========昵称========= | =========原因========= |\n| :-: | :-: |\n"
    faillist.forEach(failuser => {
      faillisttext = faillisttext + "| " + failuser.user + " | " + failuser.reason + " |\n";
    });
    var texttosend = "";
    if (faillist.length > 0) {
      texttosend = checkresulttext + "\n" + faillisttext;
    } else {
      texttosend = checkresulttext;
    }
    tools.sendSCMSG(texttosend);

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