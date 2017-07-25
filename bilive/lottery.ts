import * as request from 'request'
import * as tools from './lib/tools'
import { rootOrigin } from './index'
/**
 * 自动参与抽奖
 * 
 * @export
 * @class Lottery
 */
export class Lottery {
  /**
   * 创建一个 Lottery 实例
   * @param {lotteryOptions} lotteryOptions
   * @memberOf Lottery
   */
  constructor(lotteryOptions: lotteryOptions) {
    this._raffleId = lotteryOptions.raffleId
    this._roomID = lotteryOptions.roomID
    this._jar = lotteryOptions.jar
    this._nickname = lotteryOptions.nickname
  }
  /**
   * 参与ID
   * 
   * @private
   * @type {number}
   * @memberOf Lottery
   */
  private _raffleId: number
  /**
   * 房间号
   * 
   * @private
   * @type {number}
   * @memberOf Lottery
   */
  private _roomID: number
  /**
   * CookieJar
   * 
   * @private
   * @type {request.CookieJar}
   * @memberOf Lottery
   */
  private _jar: request.CookieJar
  /**
   * 昵称
   * 
   * @private
   * @type {string}
   * @memberOf Lottery
   */
  private _nickname: string
  /**
   * 小电视抽奖地址
   * 
   * @type {string}
   * @memberOf Lottery
   */
  public smallTVUrl: string = `${rootOrigin}/SmallTV`
  /**
   * 抽奖地址
   * 
   * @type {string}
   * @memberOf Lottery
   */
  public lotteryUrl: string = `${rootOrigin}/activity/v1/SummerBattle`
  /**
   * 活动地址
   * @type {string}
   * @memberOf Lottery
   */
  public lightenUrl: string = `${rootOrigin}/activity/v1/NeedYou`
  /**
   * 参与小电视抽奖
   * 
   * @memberOf Lottery
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
   * @memberOf Lottery
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
            let winGift = smallTVRewardResponse.data.reward,
              gift: string
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
   * @memberOf Lottery
   */
  public Lottery() {
    let join: request.Options = {
      method: 'POST',
      uri: `${this.lotteryUrl}/join`,
      body: `roomid=${this._roomID}&raffleId=${this._raffleId}`,
      jar: this._jar
    }
    tools.XHR<string>(join)
      .then((resolve) => {
        let lotteryJoinResponse: lotteryJoinResponse = JSON.parse(resolve)
        if (lotteryJoinResponse.code === 0) setTimeout(this._LotteryReward.bind(this), 1e5) // 100秒
      })
      .catch((reject) => { tools.Log(this._nickname, reject) })
  }
  /**
   * 获取抽奖结果
   * 
   * @private
   * @memberof Lottery
   */
  private _LotteryReward() {
    let reward: request.Options = {
      uri: `${this.lotteryUrl}/notice?roomid=${this._roomID}&raffleId=${this._raffleId}`,
      jar: this._jar
    }
    tools.XHR<string>(reward)
      .then((resolve) => {
        let lotteryRewardResponse: lotteryRewardResponse = JSON.parse(resolve)
        if (lotteryRewardResponse.code === 0) {
          let gift = lotteryRewardResponse.data
          if (gift.gift_num === 0) tools.Log(this._nickname, lotteryRewardResponse.msg)
          else tools.Log(this._nickname, `获得 ${gift.gift_num} 个${gift.gift_name}`)
        }
      })
      .catch((reject) => { tools.Log(this._nickname, reject) })
  }
  /**
   * 参与快速抽奖
   * 
   * @memberOf Lottery
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
 * @interface lotteryOptions
 */
export interface lotteryOptions {
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
 * @interface lotteryCheckResponse
 */
interface lotteryCheckResponse {
  code: number
  msg: string
  message: string
  data: lotteryCheckResponseData[]
}
interface lotteryCheckResponseData {
  form: string
  lotteryId: number
  status: boolean
  time: number
  type: string
}
/**
 * 参与小抽奖信息
 * 
 * @interface lotteryJoinResponse
 */
interface lotteryJoinResponse {
  code: number
  msg: string
  message: string
  data: lotteryJoinResponseData
}
interface lotteryJoinResponseData {
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
 * @interface lotteryRewardResponse
 */
interface lotteryRewardResponse {
  code: number
  msg: string
  message: string
  data: lotteryRewardResponse_Data
}
interface lotteryRewardResponse_Data {
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