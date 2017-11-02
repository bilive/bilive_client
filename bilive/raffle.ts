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
   * 小电视抽奖地址
   * 
   * @type {string}
   * @memberof Raffle
   */
  public smallTVUrl: string = apiLiveOrigin + smallTVPathname
  /**
   * 抽奖地址
   * 
   * @type {string}
   * @memberof Raffle
   */
  public raffleUrl: string = apiLiveOrigin + rafflePathname
  /**
   * 活动地址
   * @type {string}
   * @memberof Raffle
   */
  public lightenUrl: string = apiLiveOrigin + lightenPathname
  /**
   * 参与小电视抽奖
   * 
   * @memberof Raffle
   */
  public async SmallTV() {
    let join: request.Options = {
      uri: `${this.smallTVUrl}/join?roomid=${this._roomID}&id=${this._raffleId}&_=${Date.now()}`,
      jar: this._jar,
      json: true,
      headers: {
        'Referer': `http://live.bilibili.com/neptune/${this._roomID}`
      }
    }
      , smallTVJoinResponse = await tools.XHR<smallTVJoinResponse>(join)
        .catch((reject) => { tools.Error(this._nickname, reject) })
    if (smallTVJoinResponse != null && smallTVJoinResponse.body.code === 0) {
      await tools.Sleep(2e+5) // 200秒
      this._SmallTVReward()
    }
  }
  /**
   * 获取小电视中奖结果
   * 
   * @private
   * @memberof Raffle
   */
  private async _SmallTVReward() {
    let reward: request.Options = {
      uri: `${this.smallTVUrl}/getReward?id=${this._raffleId}&_=${Date.now()}`,
      jar: this._jar,
      json: true,
      headers: {
        'Referer': `http://live.bilibili.com/neptune/${this._roomID}`
      }
    }
      , smallTVRewardResponse = await tools.XHR<smallTVRewardResponse>(reward)
        .catch((reject) => { tools.Error(this._nickname, reject) })
    if (smallTVRewardResponse != null && smallTVRewardResponse.body.code === 0) {
      if (smallTVRewardResponse.body.data.status === 2) {
        await tools.Sleep(3e+4) // 30秒
        this._SmallTVReward()
      }
      else if (smallTVRewardResponse.body.data.status === 0) {
        let winGift = smallTVRewardResponse.body.data.reward
          , gift: string
        switch (winGift.id) {
          case 1:
            gift = '小电视'
            break
          case 2:
            gift = '蓝白胖次'
            break
          case 3:
            gift = 'B坷垃'
            break
          case 4:
            gift = '喵娘'
            break
          case 5:
            gift = '便当'
            break
          case 6:
            gift = '银瓜子'
            break
          case 7:
            gift = '辣条'
            break
          default:
            gift = '空虚'
            break
        }
        tools.Log(this._nickname, `获得 ${winGift.num} 个${gift}`)
      }
    }
  }
  /**
   * 参与抽奖
   * 
   * @memberof Raffle
   */
  public async Raffle() {
    let join: request.Options = {
      method: 'POST',
      uri: `${this.raffleUrl}/join`,
      body: `roomid=${this._roomID}&raffleId=${this._raffleId}&_=${Date.now()}`,
      jar: this._jar,
      json: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `http://live.bilibili.com/neptune/${this._roomID}`
      }
    }
      , raffleJoinResponse = await tools.XHR<raffleJoinResponse>(join)
        .catch((reject) => { tools.Error(this._nickname, reject) })
    if (raffleJoinResponse != null && raffleJoinResponse.body.code === 0) {
      await tools.Sleep(1e+5) // 100秒
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
      uri: `${this.raffleUrl}/notice?roomid=${this._roomID}&raffleId=${this._raffleId}&_=${Date.now()}`,
      jar: this._jar,
      json: true,
      headers: {
        'Referer': `http://live.bilibili.com/neptune/${this._roomID}`
      }
    }
      , raffleRewardResponse = await tools.XHR<raffleRewardResponse>(reward)
        .catch((reject) => { tools.Error(this._nickname, reject) })
    if (raffleRewardResponse != null && raffleRewardResponse.body.code === 0) {
      let gift = raffleRewardResponse.body.data
      if (gift.gift_num === 0) tools.Log(this._nickname, raffleRewardResponse.body.msg)
      else tools.Log(this._nickname, `获得 ${gift.gift_num} 个${gift.gift_name}`)
    }
  }
  /**
   * 参与快速抽奖
   * 
   * @memberof Raffle
   */
  public async Lighten() {
    let getCoin: request.Options = {
      method: 'POST',
      uri: `${this.lightenUrl}/getCoin`,
      body: `roomid=${this._roomID}&lightenId=${this._raffleId}&_=${Date.now()}`,
      jar: this._jar,
      json: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `http://live.bilibili.com/neptune/${this._roomID}`
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
 * 参与小电视抽奖信息
 * 
 * @interface smallTVJoinResponse
 */
interface smallTVJoinResponse {
  code: number
  msg: string
  data: smallTVJoinResponseData
}
interface smallTVJoinResponseData {
  id: number
  dtime: number
  status: number
}
/**
 * 小电视抽奖结果信息
 * 
 * @interface smallTVRewardResponse
 */
interface smallTVRewardResponse {
  code: number
  msg: string
  data: smallTVRewardResponseData
}
interface smallTVRewardResponseData {
  fname: string
  sname: string
  reward: smallTVRewardResponseDataReward
  win: number
  status: number
}
interface smallTVRewardResponseDataReward {
  id: number
  num: number
}
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
  from: string
  raffleId: string
  roomid: string
  status: number
  time: number
  type: string
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
  gift_content: string
  gift_from: string
  gift_id: number
  gift_name: string
  gift_num: number
  gift_type: number
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