import tools from './lib/tools'
import User from './daily'
import Raffle from './raffle'
import WebAPI from './webapi'
import Listener from './listener'
import Options from './options'
/**
 * 主程序
 *
 * @class BiLive
 */
class BiLive {
  constructor() {
  }
  // 系统消息监听
  private _Listener!: Listener
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
    await tools.testIP(Options._.apiIPs)
    for (const uid in Options._.user) {
      if (!Options._.user[uid].status) continue
      const user = new User(uid, Options._.user[uid])
      const status = await user.Start()
      if (status !== undefined) user.Stop()
    }
    Options.user.forEach(user => user.daily())
    this.loop = setInterval(() => this._loop(), 50 * 1000)
    new WebAPI().Start()
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
    if (cstString === '00:10') Options.user.forEach(user => user.nextDay())
    // 每天13:55再次自动送礼, 因为一般活动14:00结束
    else if (cstString === '13:55') Options.user.forEach(user => user.sendGift())
    // 每天04:30, 12:30, 20:30做日常
    if (cstMin === 30 && cstHour % 8 === 4) Options.user.forEach(user => user.daily())
    // 抽奖暂停
    const rafflePause = Options._.config.rafflePause
    if (rafflePause.length > 1) {
      const start = rafflePause[0]
      const end = rafflePause[1]
      if (start > end && (cstHour >= start || cstHour < end) || (cstHour >= start && cstHour < end)) this._raffle = false
      else this._raffle = true
    }
    else this._raffle = true
    // 礼物总数统计
    if (cstString === Options._.config.calcGiftTime) this.calcGift()
    if (cstMin % 10 === 0) {
      // 更新监听房间
      this._Listener.updateAreaRoom()
      // 清空ID缓存
      this._Listener.clearAllID()
    }
  }
  /**
   * 监听
   *
   * @memberof BiLive
   */
  public Listener() {
    this._Listener = new Listener()
    this._Listener
      .on('smallTV', (raffleMessage: raffleMessage) => this._Raffle(raffleMessage))
      .on('raffle', (raffleMessage: raffleMessage) => this._Raffle(raffleMessage))
      .on('lottery', (lotteryMessage: lotteryMessage) => this._Raffle(lotteryMessage))
      .on('beatStorm', (beatStormMessage: beatStormMessage) => this._Raffle(beatStormMessage))
      .Start()
  }
  /**
   * 参与抽奖
   *
   * @private
   * @param {raffleMessage | lotteryMessage | beatStormMessage} raffleMessage
   * @memberof BiLive
   */
  private async _Raffle(raffleMessage: raffleMessage | lotteryMessage | beatStormMessage) {
    if (!this._raffle) return
    Options.user.forEach(user => {
      if (user.captchaJPEG !== '' || !user.userData.raffle) return
      const droprate = Options._.config.droprate
      if (droprate !== 0 && Math.random() < droprate / 100)
        return tools.Log(user.nickname, '丢弃抽奖', raffleMessage.id)
      switch (raffleMessage.cmd) {
        case 'smallTV':
          new Raffle(raffleMessage, user).SmallTV()
          break
        case 'raffle':
          new Raffle(raffleMessage, user).Raffle()
          break
        case 'lottery':
          new Raffle(raffleMessage, user).Lottery()
          break
        case 'beatStorm':
          new Raffle(raffleMessage, user).BeatStorm()
          break
        default:
          break
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
    for (const [uid, user] of Options.user) {
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
export default BiLive