import * as request from 'request'
import * as tools from './lib/tools'
import { rootOrigin, smallTVPathname, rafflePathname, lightenPathname } from './index'
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
  public smallTVUrl: string = rootOrigin + smallTVPathname
  /**
   * 抽奖地址
   * 
   * @type {string}
   * @memberof Raffle
   */
  public raffleUrl: string = rootOrigin + rafflePathname
  /**
   * 活动地址
   * @type {string}
   * @memberof Raffle
   */
  public lightenUrl: string = rootOrigin + lightenPathname
  /**
   * 参与小电视抽奖
   * 
   * @memberof Raffle
   */
  public SmallTV() {
    let join: request.Options = {
      uri: `${this.smallTVUrl}/join?roomid=${this._roomID}&id=${this._raffleId}`,
      jar: this._jar
    }
    tools.XHR<string>(join)
      .then((resolve) => {
        let smallTVJoinResponse: smallTVJoinResponse = JSON.parse(resolve)
        if (smallTVJoinResponse.code === 0) setTimeout(this._SmallTVReward.bind(this), 2e5) // 200秒
      })
      .catch((reject) => { tools.Log(this._nickname, reject) })
  }
  /**
   * 获取小电视中奖结果
   * 
   * @private
   * @memberof Raffle
   */
  private _SmallTVReward() {
    let reward: request.Options = {
      uri: `${this.smallTVUrl}/getReward?id=${this._raffleId}`,
      jar: this._jar
    }
    tools.XHR<string>(reward)
      .then((resolve) => {
        let smallTVRewardResponse: smallTVRewardResponse = JSON.parse(resolve)
        if (smallTVRewardResponse.code === 0) {
          if (smallTVRewardResponse.data.status === 2) setTimeout(this._SmallTVReward.bind(this), 3e4) // 30秒
          else if (smallTVRewardResponse.data.status === 0) {
            let winGift = smallTVRewardResponse.data.reward
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
      })
      .catch((reject) => { tools.Log(this._nickname, reject) })
  }
  /**
   * 参与抽奖
   * 
   * @memberof Raffle
   */
  public Raffle() {
    let join: request.Options = {
      method: 'POST',
      uri: `${this.raffleUrl}/join`,
      body: `roomid=${this._roomID}&raffleId=${this._raffleId}`,
      jar: this._jar
    }
    tools.XHR<string>(join)
      .then((resolve) => {
        let raffleJoinResponse: raffleJoinResponse = JSON.parse(resolve)
        if (raffleJoinResponse.code === 0) setTimeout(this._RaffleReward.bind(this), 1e5) // 100秒
      })
      .catch((reject) => { tools.Log(this._nickname, reject) })
  }
  /**
   * 获取抽奖结果
   * 
   * @private
   * @memberof Raffle
   */
  private _RaffleReward() {
    let reward: request.Options = {
      uri: `${this.raffleUrl}/notice?roomid=${this._roomID}&raffleId=${this._raffleId}`,
      jar: this._jar
    }
    tools.XHR<string>(reward)
      .then((resolve) => {
        let raffleRewardResponse: raffleRewardResponse = JSON.parse(resolve)
        if (raffleRewardResponse.code === 0) {
          let gift = raffleRewardResponse.data
          if (gift.gift_num === 0) tools.Log(this._nickname, raffleRewardResponse.msg)
          else tools.Log(this._nickname, `获得 ${gift.gift_num} 个${gift.gift_name}`)
        }
      })
      .catch((reject) => { tools.Log(this._nickname, reject) })
  }
  /**
   * 参与快速抽奖
   * 
   * @memberof Raffle
   */
  public Lighten() {
    let getCoin: request.Options = {
      method: 'POST',
      uri: `${this.lightenUrl}/getCoin`,
      body: `roomid=${this._roomID}&lightenId=${this._raffleId}`,
      jar: this._jar
    }
    tools.XHR<string>(getCoin)
      .then((resolve) => {
        let lightenRewardResponse: lightenRewardResponse = JSON.parse(resolve)
        if (lightenRewardResponse.code === 0) tools.Log(this._nickname, lightenRewardResponse.msg)
      })
      .catch((reject) => { tools.Log(this._nickname, reject) })
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
 * 房间小电视抽奖信息
 * 
 * @interface smallTVCheckResponse
 */
interface smallTVCheckResponse {
  code: number
  msg: string
  data: smallTVCheckResponseData
}
interface smallTVCheckResponseData {
  lastid: number
  join: smallTVCheckResponseDataJoin[]
  unjoin: smallTVCheckResponseDataJoin[]
}
interface smallTVCheckResponseDataJoin {
  id: number
  dtime: number
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
 * 房间抽奖信息
 * 
 * @interface raffleCheckResponse
 */
interface raffleCheckResponse {
  code: number
  msg: string
  message: string
  data: raffleCheckResponseData[]
}
interface raffleCheckResponseData {
  form: string
  raffleId: number
  status: boolean
  time: number
  type: string
}
/**
 * 参与小抽奖信息
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