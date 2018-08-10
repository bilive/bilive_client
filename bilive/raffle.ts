import request from 'request'
import tools from './lib/tools'
import AppClient from './lib/app_client'
import { apiLiveOrigin, smallTVPathname, rafflePathname, lotteryPathname } from './index'
/**
 * 自动参与抽奖
 * 
 * @class Raffle
 */
class Raffle {
  /**
   * 创建一个 Raffle 实例
   * @param {raffleOptions} raffleOptions
   * @memberof Raffle
   */
  constructor(raffleOptions: raffleOptions) {
    this._options = raffleOptions
  }
  /**
   * 抽奖设置
   *
   * @private
   * @type {raffleOptions}
   * @memberof Raffle
   */
  private _options: raffleOptions
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
  public Lottery() {
    this._url = apiLiveOrigin + lotteryPathname
    this._Lottery()
  }
  /**
   * 抽奖Raffle
   * 
   * @private
   * @memberof Raffle
   */
  private async _Raffle() {
    await tools.Sleep(this._options.time * 1000)
    this._RaffleAward()
  }
  /**
   * 获取抽奖结果
   * 
   * @private
   * @memberof Raffle
   */
  private async _RaffleAward() {
    const reward: request.Options = {
      method: 'POST',
      uri: `${this._url}/getAward`,
      body: AppClient.signQueryBase(`${this._options.user.tokenQuery}&raffleId=${this._options.raffleId}\
&roomid=${this._options.roomID}&type=${this._options.type}`),
      json: true,
      headers: this._options.user.headers
    }
    const raffleAward = await tools.XHR<raffleAward>(reward, 'Android')
    if (raffleAward === undefined || raffleAward.response.statusCode !== 200) return
    if (raffleAward.body.code === -401) {
      await tools.Sleep(5 * 1000)
      this._RaffleAward()
    }
    else if (raffleAward.body.code === 0) {
      const gift = raffleAward.body.data
      if (gift.gift_num === 0) tools.Log(this._options.user.nickname, this._options.title, this._options.raffleId, raffleAward.body.msg)
      else {
        const msg = `${this._options.user.nickname} ${this._options.title} ${this._options.raffleId} 获得 ${gift.gift_num} 个${gift.gift_name}`
        tools.Log(msg)
        if (gift.gift_name.includes('小电视')) tools.sendSCMSG(msg)
      }
    }
    else tools.Log(this._options.user.nickname, this._options.title, this._options.raffleId, raffleAward.body)
  }
  /**
   * 抽奖Lottery
   * 
   * @memberof Raffle
   */
  public async _Lottery() {
    const reward: request.Options = {
      method: 'POST',
      uri: `${this._url}/join`,
      body: AppClient.signQueryBase(`${this._options.user.tokenQuery}&id=${this._options.raffleId}\
&roomid=${this._options.roomID}&type=${this._options.type}`),
      json: true,
      headers: this._options.user.headers
    }
    const lotteryReward = await tools.XHR<lotteryReward>(reward, 'Android')
    if (lotteryReward !== undefined && lotteryReward.response.statusCode === 200) {
      if (lotteryReward.body.code === 0)
        tools.Log(this._options.user.nickname, this._options.title, this._options.raffleId, lotteryReward.body.data.message)
      else tools.Log(this._options.user.nickname, this._options.title, this._options.raffleId, lotteryReward.body)
    }
  }
}
export default Raffle