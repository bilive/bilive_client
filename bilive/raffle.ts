import { Options as requestOptions } from 'request'
import tools from './lib/tools'
import AppClient from './lib/app_client'
import Options, { apiLiveOrigin, smallTVPathname, rafflePathname, lotteryPathname } from './options'
/**
 * 自动参与抽奖
 *
 * @class Raffle
 */
class Raffle {
  /**
   * 创建一个 Raffle 实例
   * @param {raffleMessage | lotteryMessage | beatStormMessage} raffleMessage
   * @memberof Raffle
   */
  constructor(raffleMessage: raffleMessage | lotteryMessage | beatStormMessage, user: User) {
    this._raffleMessage = raffleMessage
    this._user = user
    this._resend = user.userData.raffleResend + 1
  }
  /**
   * 抽奖设置
   *
   * @private
   * @type {raffleMessage | lotteryMessage}
   * @memberof Raffle
   */
  private _raffleMessage: raffleMessage | lotteryMessage | beatStormMessage
  /**
   * 抽奖用户
   *
   * @private
   * @type {User}
   * @memberof Raffle
   */
  private _user: User
  /**
   * 抽奖超时
   *
   * @private
   * @type {boolean}
   * @memberof Raffle
   */
  private _timeout: boolean = false
  /**
   * 抽奖完成
   *
   * @private
   * @type {boolean}
   * @memberof Raffle
   */
  private _done: boolean = false
  /**
   * 计时器
   *
   * @private
   * @type {NodeJS.Timer}
   * @memberof Raffle
   */
  private _timer!: NodeJS.Timer
  /**
   * 延迟抽奖
   *
   * @private
   * @memberof Raffle
   */
  private _raffleDelay = Options._.config.raffleDelay
  /**
   * 每次抽奖延时
   *
   * @private
   * @type {number}
   * @memberof Raffle
   */
  private _delay: number = 50
  /**
   * 重发包次数
   *
   * @private
   * @type {number}
   * @memberof Raffle
   */
  private _resend: number = 1
  /**
   * 抽奖地址
   *
   * @private
   * @type {string}
   * @memberof Raffle
   */
  private _url!: string
  /**
   * 参与小电视抽奖
   *
   * @memberof Raffle
   */
  public SmallTV() {
    this._url = apiLiveOrigin + smallTVPathname
    this._Raffle()
  }
  /**
   * 参与抽奖Raffle
   *
   * @memberof Raffle
   */
  public Raffle() {
    this._url = apiLiveOrigin + rafflePathname
    this._Raffle()
  }
  /**
   * 参与抽奖Lottery
   *
   * @memberof Raffle
   */
  public async Lottery() {
    this._url = apiLiveOrigin + lotteryPathname
    const time = this._raffleMessage.time
    this._timer = setTimeout(() => { this._timeout = true }, time * 1000)
    const delay = Math.floor((time * 1000 - this._raffleDelay) / this._resend)
    this._delay = delay < 50 ? 50 : delay
    if (this._raffleDelay !== 0) await tools.Sleep(this._raffleDelay)
    this._Lottery()
  }
  /**
   * 参与节奏风暴
   *
   * @memberof Raffle
   */
  public async BeatStorm() {
    this._timer = setTimeout(() => { this._timeout = true }, 20 * 1000)
    const delay = Math.floor((20 * 1000 - this._raffleDelay) / this._resend)
    this._delay = delay < 50 ? 50 : delay
    if (this._raffleDelay !== 0) await tools.Sleep(this._raffleDelay)
    this._BeatStorm()
  }
  /**
   * 抽奖Raffle
   *
   * @private
   * @memberof Raffle
   */
  private async _Raffle() {
    this._timer = setTimeout(() => { this._timeout = true }, this._raffleMessage.time * 1000)
    const { max_time, time_wait } = (<raffleMessage>this._raffleMessage)
    const time = max_time - time_wait
    await tools.Sleep(time_wait * 1000)
    const delay = Math.floor((time * 1000 - this._raffleDelay) / this._resend)
    this._delay = delay < 50 ? 50 : delay
    if (this._raffleDelay !== 0) await tools.Sleep(this._raffleDelay)
    this._RaffleAward()
  }
  /**
   * 获取抽奖结果
   *
   * @private
   * @memberof Raffle
   */
  private async _RaffleAward() {
    const { id, roomID, title, type } = this._raffleMessage
    for (let i = 0; i < this._resend; i++) {
      if (this._timeout || this._done) return
      const reward: requestOptions = {
        method: 'POST',
        uri: `${this._url}/getAward`,
        body: AppClient.signQueryBase(`${this._user.tokenQuery}&raffleId=${id}&roomid=${roomID}&type=${type}`),
        json: true,
        headers: this._user.headers
      }
      tools.XHR<raffleAward>(reward, 'Android').then(raffleAward => {
        if (raffleAward !== undefined && raffleAward.response.statusCode === 200) {
          if (raffleAward.body.code === 0) {
            // 抽奖完成
            this._done = true
            clearTimeout(this._timer)
            const gift = raffleAward.body.data
            if (gift.gift_num === 0) tools.Log(this._user.nickname, title, id, raffleAward.body.msg)
            else {
              const msg = `${this._user.nickname} ${title} ${id} 获得 ${gift.gift_num} 个${gift.gift_name}`
              tools.Log(msg)
              if (gift.gift_name.includes('小电视')) tools.sendSCMSG(msg)
            }
          }
          else if (this._resend === 1) tools.Log(this._user.nickname, title, id, raffleAward.body)
        }
      })
      await tools.Sleep(this._delay)
    }
  }
  /**
   * 抽奖Lottery
   * @private
   * @memberof Raffle
   */
  private async _Lottery() {
    const { id, roomID, title, type } = this._raffleMessage
    for (let i = 0; i < this._resend; i++) {
      if (this._timeout || this._done) return
      const reward: requestOptions = {
        method: 'POST',
        uri: `${this._url}/join`,
        body: AppClient.signQueryBase(`${this._user.tokenQuery}&id=${id}&roomid=${roomID}&type=${type}`),
        json: true,
        headers: this._user.headers
      }
      tools.XHR<lotteryReward>(reward, 'Android').then(lotteryReward => {
        if (lotteryReward !== undefined && lotteryReward.response.statusCode === 200) {
          if (lotteryReward.body.code === 0) {
            // 抽奖完成
            this._done = true
            clearTimeout(this._timer)
            tools.Log(this._user.nickname, title, id, lotteryReward.body.data.message)
          }
          else if (this._resend === 1) tools.Log(this._user.nickname, title, id, lotteryReward.body)
        }
      })
      await tools.Sleep(this._delay)
    }
  }
  /**
   * 节奏风暴
   *
   * @private
   * @memberof Raffle
   */
  private async _BeatStorm() {
    const { id, title } = this._raffleMessage
    for (let i = 0; i < this._resend; i++) {
      if (this._timeout || this._done) return
      const join: requestOptions = {
        method: 'POST',
        uri: `${apiLiveOrigin}/lottery/v1/Storm/join`,
        body: AppClient.signQuery(`${this._user.tokenQuery}&${AppClient.baseQuery}&id=${id}`),
        json: true,
        headers: this._user.headers
      }
      tools.XHR<joinStorm>(join, 'Android').then(joinStorm => {
        if (joinStorm !== undefined && joinStorm.response.statusCode === 200 && joinStorm.body !== undefined) {
          const content = joinStorm.body.data
          if (content !== undefined && content.gift_num > 0) {
            this._done = true
            tools.Log(this._user.nickname, title, id, `${content.mobile_content} 获得 ${content.gift_num} 个${content.gift_name}`)
          }
          else if (this._resend === 1) tools.Log(this._user.nickname, title, id, joinStorm.body)
        }
      })
      await tools.Sleep(this._delay)
    }
  }
}
export default Raffle