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
   * @param {message} message
   * @memberof Raffle
   */
  constructor(message: message, user: User) {
    this._message = message
    this._user = user
    this._resend = user.userData.raffleResend + 1
  }
  /**
   * 抽奖设置
   *
   * @private
   * @type {message}
   * @memberof Raffle
   */
  private _message: message
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
    const time = this._message.time
    this._timer = setTimeout(() => { this._timeout = true }, time * 1000)
    const delay = Math.floor((time * 1000 - this._raffleDelay) / this._resend)
    this._delay = delay < 50 ? 50 : delay
    if (this._raffleDelay !== 0) await tools.Sleep(this._raffleDelay)
    this._Lottery()
  }
  /**
   * 抽奖Raffle
   * 
   * @private
   * @memberof Raffle
   */
  private async _Raffle() {
    this._timer = setTimeout(() => { this._timeout = true }, this._message.time * 1000)
    const max_time = (<raffleMessage>this._message).max_time
    const time_wait = (<raffleMessage>this._message).time_wait
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
    for (let i = 0; i < this._resend; i++) {
      if (this._timeout || this._done) return
      const reward: requestOptions = {
        method: 'POST',
        uri: `${this._url}/getAward`,
        body: AppClient.signQueryBase(`${this._user.tokenQuery}&raffleId=${this._message.id}\
&roomid=${this._message.roomID}&type=${this._message.type}`),
        json: true,
        headers: this._user.headers
      }
      tools.XHR<raffleAward>(reward, 'Android').then(raffleAward => {
        if (raffleAward !== undefined && raffleAward.response.statusCode === 200 && raffleAward.body.code === 0) {
          // 抽奖完成
          this._done = true
          clearTimeout(this._timer)
          const gift = raffleAward.body.data
          if (gift.gift_num === 0) tools.Log(this._user.nickname, this._message.title, this._message.id, raffleAward.body.msg)
          else {
            const msg = `${this._user.nickname} ${this._message.title} ${this._message.id} 获得 ${gift.gift_num} 个${gift.gift_name}`
            tools.Log(msg)
            if (gift.gift_name.includes('小电视')) tools.sendSCMSG(msg)
          }
        }
      })
      await tools.Sleep(this._delay)
    }
  }
  /**
   * 抽奖Lottery
   * 
   * @memberof Raffle
   */
  public async _Lottery() {
    for (let i = 0; i < this._resend; i++) {
      if (this._timeout || this._done) return
      const reward: requestOptions = {
        method: 'POST',
        uri: `${this._url}/join`,
        body: AppClient.signQueryBase(`${this._user.tokenQuery}&id=${this._message.id}\
&roomid=${this._message.roomID}&type=${this._message.type}`),
        json: true,
        headers: this._user.headers
      }
      tools.XHR<lotteryReward>(reward, 'Android').then(lotteryReward => {
        if (lotteryReward !== undefined && lotteryReward.response.statusCode === 200 && lotteryReward.body.code === 0) {
          // 抽奖完成
          this._done = true
          clearTimeout(this._timer)
          tools.Log(this._user.nickname, this._message.title, this._message.id, lotteryReward.body.data.message)
        }
      })
      await tools.Sleep(this._delay)
    }
  }
}
export default Raffle