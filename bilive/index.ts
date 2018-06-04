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
    // 礼物总数统计
    if (cstString === _options.config.calcGiftTime) this.calcGift()
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
   * @param {message} raffleMSG 
   * @memberof BiLive
   */
  private async _Raffle(raffleMSG: message) {
    if (!this._raffle) return
    const raffleDelay = _options.config.raffleDelay
    if (raffleDelay !== 0) await tools.Sleep(raffleDelay)
    _user.forEach(user => {
      if (user.captchaJPEG !== '' || !user.userData.raffle) return
      const droprate = _options.config.droprate
      if (droprate !== 0 && Math.random() < droprate / 100)
        return tools.Log(user.nickname, '丢弃抽奖', raffleMSG.id)
      const raffleOptions: raffleOptions = { ...raffleMSG, raffleId: raffleMSG.id, user }
      switch (raffleMSG.cmd) {
        case 'smallTV':
          return new Raffle(raffleOptions).SmallTV()
        case 'raffle':
          return new Raffle(raffleOptions).Raffle()
        case 'lottery':
          return new Raffle(raffleOptions).Lottery()
        default:
          return
      }
    })
  }
  /**
   * 礼物总数统计
   * 
   * @private
   * @memberof BiLive
   */
  private async calcGift() {
    // 缓存礼物名
    const giftList: giftList = new Map()
    // 缓存用户礼物数
    const userGiftList: userGiftList = new Map()
    for (const [uid, user] of _user) {
      const bagInfo = await user.checkBag()
      if (bagInfo === undefined || bagInfo.response.statusCode !== 200 || bagInfo.body.code !== 0 || bagInfo.body.data.length === 0)
        userGiftList.set(uid, { nickname: user.nickname, gift: new Map() })
      else {
        const gift: userGiftID = new Map()
        for (const giftData of bagInfo.body.data) {
          // 添加礼物名
          if (!giftList.has(giftData.gift_id)) giftList.set(giftData.gift_id, { name: giftData.gift_name, number: { all: 0, twoDay: 0, oneDay: 0 } })
          const allGiftNum = <giftNameNum>giftList.get(giftData.gift_id)
          allGiftNum.number.all += giftData.gift_num
          // 添加礼物数
          if (!gift.has(giftData.gift_id)) gift.set(giftData.gift_id, { all: 0, twoDay: 0, oneDay: 0 })
          const giftNum = <giftHas>gift.get(giftData.gift_id)
          giftNum.all += giftData.gift_num
          // 临期礼物
          if (giftData.expireat > 0 && giftData.expireat < 2 * 24 * 60 * 60) {
            allGiftNum.number.twoDay += giftData.gift_num
            giftNum.twoDay += giftData.gift_num
          }
          if (giftData.expireat > 0 && giftData.expireat < 24 * 60 * 60) {
            allGiftNum.number.oneDay += giftData.gift_num
            giftNum.oneDay += giftData.gift_num
          }
        }
        userGiftList.set(uid, { nickname: user.nickname, gift })
      }
    }
    // 构造表格
    let table = '用户\\礼物'
    let row = ':-:'
    let allGift = '总计'
    // 第一行为礼物名
    giftList.forEach(gift => {
      table += `|${gift.name}/48H/24H`
      row += '|:-:'
      allGift += `|${gift.number.all}/${gift.number.twoDay}/${gift.number.oneDay}`
    })
    table += '\n' + row + '\n' + allGift
    // 插入用户礼物信息
    userGiftList.forEach(userGift => {
      const nickname = userGift.nickname
      const gift = userGift.gift
      table += `\n|${nickname}`
      giftList.forEach((_name, id) => {
        const giftNum = gift.has(id) ? <giftHas>gift.get(id) : { all: 0, twoDay: 0, oneDay: 0 }
        table += `|${giftNum.all}/${giftNum.twoDay}/${giftNum.oneDay}`
      })
    })
    tools.sendSCMSG(table)
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