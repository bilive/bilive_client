import * as request from 'request'
import * as tools from './lib/tools'
import { AppClient } from './lib/app_client'
import { liveOrigin, apiLiveOrigin, smallTVPathname, rafflePathname, lightenPathname } from './index'
/**
 * 自动参与抽奖
 * 
 * @export
 * @class Raffle
 */
export class Raffle {
  /**
   * 创建一个 Raffle 实例
   * @param {raffleOptions} raffleOptions
   * @memberof Raffle
   */
  constructor(raffleOptions: raffleOptions) {
    if (raffleOptions.type != null) this._type = raffleOptions.type
    this._raffleId = raffleOptions.raffleId
    this._roomID = raffleOptions.roomID
    this._jar = raffleOptions.jar
    this._userData = raffleOptions.userData
  }
  /**
   * type
   * 
   * @private
   * @type {string}
   * @memberof Raffle
   */
  private _type?: string
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
   * CookieJar
   * 
   * @private
   * @type {request.CookieJar}
   * @memberof Raffle
   */
  private _jar: request.CookieJar
  /**
   * userData
   * 
   * @private
   * @type {userData}
   * @memberof Raffle
   */
  private _userData: userData
  /**
   * 抽奖地址
   * 
   * @private
   * @type {string}
   * @memberof Raffle
   */
  private _url: string
  /**
   * 参与小电视抽奖
   * 
   * @memberof Raffle
   */
  public SmallTV() {
    this._url = apiLiveOrigin + smallTVPathname
    return this._Raffle()
  }
  /**
   * 参与抽奖
   * 
   * @memberof Raffle
   */
  public Raffle() {
    this._url = apiLiveOrigin + rafflePathname
    return this._Raffle()
  }
  /**
   * 抽奖
   * 
   * @private
   * @memberof Raffle
   */
  private async _Raffle() {
    let join: request.Options = {
      uri: `${this._url}/join?roomid=${this._roomID}&raffleId=${this._raffleId}`,
      jar: this._jar,
      json: true,
      headers: {
        'Referer': `${liveOrigin}/${this._roomID}`
      }
    }
      , raffleJoin = await tools.XHR<raffleJoin>(join)
    if (raffleJoin.response.statusCode === 200 && raffleJoin.body.code === 0) {
      let time = raffleJoin.body.data.time * 1e+3 + 3e+4
      await tools.Sleep(time)
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
    let reward: request.Options = {
      uri: `${this._url}/notice?roomid=${this._roomID}&raffleId=${this._raffleId}`,
      jar: this._jar,
      json: true,
      headers: {
        'Referer': `${liveOrigin}/${this._roomID}`
      }
    }
      , raffleReward = await tools.XHR<raffleReward>(reward)
    if (raffleReward.response.statusCode !== 200) return
    if (raffleReward.body.code === -400 || raffleReward.body.data.status === 3) {
      await tools.Sleep(3e+4)
      this._RaffleReward()
    }
    else {
      let gift = raffleReward.body.data
      if (gift.gift_num === 0) tools.Log(this._userData.nickname, `抽奖 ${this._raffleId} `, raffleReward.body.msg)
      else tools.Log(this._userData.nickname, `抽奖 ${this._raffleId} `, `获得 ${gift.gift_num} 个${gift.gift_name}`)
    }
  }
  /**
   * 参与快速抽奖
   * 
   * @memberof Raffle
   */
  public async Lighten() {
    this._url = apiLiveOrigin + lightenPathname
    let getCoin: request.Options = {
      method: 'POST',
      uri: `${this._url}/getCoin`,
      body: `roomid=${this._roomID}&lightenId=${this._raffleId}}`,
      jar: this._jar,
      json: true,
      headers: {
        'Referer': `${liveOrigin}/${this._roomID}`
      }
    }
      , lightenReward = await tools.XHR<lightenReward>(getCoin)
    if (lightenReward.response.statusCode === 200 && lightenReward.body.code === 0) tools.Log(this._userData.nickname, `抽奖 ${this._raffleId} `, lightenReward.body.msg)
  }
  /**
   * app快速抽奖
   * 
   * @private
   * @memberof Raffle
   */
  public async AppLighten() {
    let baseQuery = `access_key=${this._userData.accessToken}&${AppClient.baseQuery}`
      , reward: request.Options = {
        uri: `${apiLiveOrigin}/YunYing/roomEvent?${AppClient.ParamsSign(`event_type=${this._type}-${this._raffleId}&room_id=${this._roomID}&${baseQuery}`)}`,
        json: true
      }
      , appLightenReward = await tools.XHR<appLightenReward>(reward, 'Android')
    if (appLightenReward.response.statusCode === 200 && appLightenReward.body.code === 0) tools.Log(this._userData.nickname, `抽奖 ${this._raffleId}`, `获得${appLightenReward.body.data.gift_desc}`)
  }
}