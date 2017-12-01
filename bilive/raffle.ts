import * as request from 'request'
import * as tools from './lib/tools'
import { apiLiveOrigin, smallTVPathname, rafflePathname, lightenPathname } from './index'
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
    this._raffleId = raffleOptions.raffleId
    this._roomID = raffleOptions.roomID
    this._jar = raffleOptions.jar
    this._nickname = raffleOptions.nickname
  }
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
   * 昵称
   * 
   * @private
   * @type {string}
   * @memberof Raffle
   */
  private _nickname: string
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
        'Referer': `https://live.bilibili.com/${this._roomID}`
      }
    }
      , joinResponse = await tools.XHR<raffleJoinResponse>(join)
    if (joinResponse.response.statusCode === 200 && joinResponse.body.code === 0) {
      let time = joinResponse.body.data.time * 1e+3 + 3e+4
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
        'Referer': `https://live.bilibili.com/${this._roomID}`
      }
    }
      , rewardResponse = await tools.XHR<raffleRewardResponse>(reward)
    if (rewardResponse.response.statusCode !== 200) return
    if (rewardResponse.body.code === -400 || rewardResponse.body.data.status === 3) {
      await tools.Sleep(3e+4)
      this._RaffleReward()
    }
    else {
      let gift = rewardResponse.body.data
      if (gift.gift_num === 0) tools.Log(this._nickname, rewardResponse.body.msg)
      else tools.Log(this._nickname, `获得 ${gift.gift_num} 个${gift.gift_name}`)
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
        'Referer': `https://live.bilibili.com/${this._roomID}`
      }
    }
      , lightenRewardResponse = await tools.XHR<lightenRewardResponse>(getCoin)
        .catch((reject) => { tools.Error(this._nickname, reject) })
    if (lightenRewardResponse != null && lightenRewardResponse.body.code === 0) tools.Log(this._nickname, lightenRewardResponse.body.msg)
  }
}
/**
 * 抽奖设置
 * 
 * @export
 * @interface raffleOptions
 */
export interface raffleOptions {
  raffleId: number
  roomID: number
  jar: request.CookieJar
  nickname: string
}
/**
/**
 * 参与抽奖信息
 * 
 * @interface raffleJoinResponse
 */
interface raffleJoinResponse {
  code: number
  msg: string
  message: string
  data: raffleJoinResponseData
}
interface raffleJoinResponseData {
  face?: string
  from: string
  type: 'small_tv' | string
  roomid?: string
  raffleId: number | string
  time: number
  status: number
}
/**
 * 抽奖结果信息
 * 
 * @interface raffleRewardResponse
 */
interface raffleRewardResponse {
  code: number
  msg: string
  message: string
  data: raffleRewardResponse_Data
}
interface raffleRewardResponse_Data {
  gift_id: number
  gift_name: string
  gift_num: number
  gift_from: string
  gift_type: number
  gift_content: string
  status?: number
}
/**
 * 快速抽奖结果信息
 * 
 * @interface lightenRewardResponse
 */
interface lightenRewardResponse {
  code: number
  msg: string
  message: string
  data: [number]
}