import request from 'request'
import tools from './lib/tools'
import User from './user'
import AppClient from './lib/app_client'
import { liveOrigin, apiLiveOrigin, smallTVPathname, rafflePathname, lotteryPathname } from './index'
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
    this._raffleId = raffleOptions.raffleId
    this._roomID = raffleOptions.roomID
    this._type = raffleOptions.type
    this._time = raffleOptions.time
    this._user = raffleOptions.user
  }
  /**
   * type
   * 
   * @private
   * @type {string}
   * @memberof Raffle
   */
  private _type: string
  /**
   * time
   * 
   * @private
   * @type {number}
   * @memberof Raffle
   */
  private _time: number
  /**
   * 参与ID
   * 
   * @private
   * @type {number}
   * @memberof Raffle
   */
  private _raffleId: number
  /**
   * 房间号
   * 
   * @private
   * @type {number}
   * @memberof Raffle
   */
  private _roomID: number
  /**
   * User
   * 
   * @private
   * @type {User}
   * @memberof Raffle
   */
  private _user: User
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
    const join: request.Options = {
      method: 'POST',
      uri: `${this._url}/join`,
      body: AppClient.signQueryBase(`raffleId=${this._raffleId}&roomid=${this._roomID}&type=${this._type}&${this._user.tokenQuery}`),
      json: true
    }
    const raffleJoin = await tools.XHR<raffleJoin>(join, 'Android')
    if (raffleJoin !== undefined && raffleJoin.response.statusCode === 200 && raffleJoin.body.code === 0) {
      await tools.Sleep(this._time * 1000 + 15 * 1000)
      this._RaffleReward()
    }
  }
  /**
   * 获取抽奖结果
   * 
   * @private
   * @memberof Raffle
   */
  private async _RaffleReward() {
    const reward: request.Options = {
      uri: `${this._url}/notice?${AppClient.signQueryBase(`raffleId=${this._raffleId}&type=${this._type}&${this._user.tokenQuery}`)}`,
      json: true,
    }
    const raffleReward = await tools.XHR<raffleReward>(reward, 'Android')
    if (raffleReward === undefined || raffleReward.response.statusCode !== 200) return
    if (raffleReward.body.code === -400 || raffleReward.body.data.status === 3) {
      await tools.Sleep(30 * 1000)
      this._RaffleReward()
    }
    else {
      const gift = raffleReward.body.data
      if (gift.gift_num === 0) tools.Log(this._user.nickname, `抽奖 ${this._raffleId}`, raffleReward.body.msg)
      else {
        const msg = `${this._user.nickname} 抽奖 ${this._raffleId} 获得 ${gift.gift_num} 个${gift.gift_name}`
        tools.Log(msg)
        if (gift.gift_name.includes('小电视')) tools.sendSCMSG(msg)
      }
    }
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
      body: `roomid=${this._roomID}&id=${this._raffleId}&type=${this._type}&csrf_token=${tools.getCookie(this._user.jar, 'bili_jct')}`,
      jar: this._user.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(this._roomID)}` }
    }
    const lotteryReward = await tools.XHR<lotteryReward>(reward)
    if (lotteryReward !== undefined && lotteryReward.response.statusCode === 200 && lotteryReward.body.code === 0)
      tools.Log(this._user.nickname, `抽奖 ${this._raffleId}`, lotteryReward.body.data.message)
  }
}
export default Raffle