import * as request from 'request'
import * as tools from './lib/tools'
import { EventEmitter } from 'events'
import { CommentClient, SYS_MSG, SYS_GIFT } from './lib/comment_client'
import { usersData, userData, rootOrigin, options } from './index'
/**
 * 自动参与抽奖
 * 
 * @export
 * @class Lottery
 * @extends {EventEmitter}
 */
export class Lottery extends EventEmitter {
  constructor() {
    super()
  }
  /**
   * 小电视抽奖地址
   * 
   * @type {string}
   * @memberOf Lottery
   */
  public smallTVUrl: string = `${rootOrigin}/SmallTV`
  /**
   * 特殊道具抽奖地址
   * 
   * @type {string}
   * @memberOf Lottery
   */
  public lotteryUrl: string = `${rootOrigin}/eventRoom`
  /**
   * 用于接收系统消息
   * 
   * @private
   * @type {CommentClient}
   * @memberOf Lottery
   */
  private _CommentClient: CommentClient
  /**
   * 开始监听系统消息
   * 
   * @memberOf Lottery
   */
  public Start() {
    this._CommentClient = new CommentClient(options.defaultRoomID, options.defaultUserID)
    this._CommentClient
      .on('SYS_MSG', this._SmallTVHandler.bind(this))
      .on('SYS_GIFT', this._LotteryHandler.bind(this))
      .on('serverError', (error) => { tools.Log('与弹幕服务器断开五分钟', error) })
      .Connect()
  }
  /**
   * 监听小电视消息
   * 
   * @private
   * @param {SYS_MSG} dataJson
   * @memberOf Lottery
   */
  private _SmallTVHandler(dataJson: SYS_MSG) {
    if (dataJson.real_roomid == null || dataJson.tv_id == null) return
    let roomID = dataJson.real_roomid
    let joinID = dataJson.tv_id
    tools.Log(`房间 ${roomID} 赠送了第 ${joinID} 个小电视`)
    let usersData = options.usersData
    for (let uid in usersData) {
      let userData = usersData[uid]
      if (userData.status && userData.smallTV) {
        let join: request.Options = {
          uri: `${this.smallTVUrl}/join?roomid=${roomID}&id=${joinID}`,
          jar: userData.jar
        }
        this._SmallTVjoin(join, userData, parseInt(joinID))
      }
    }
  }
  /**
   * 参加小电视抽奖
   * 
   * @private
   * @param {request.Options} join
   * @param {userData} userData
   * @param {number} joinID
   * @memberOf Lottery
   */
  private _SmallTVjoin(join: request.Options, userData: userData, joinID: number) {
    tools.XHR<string>(join)
      .then((resolve) => {
        let smallTVJoinResponse: smallTVJoinResponse = JSON.parse(resolve)
        if (smallTVJoinResponse.code === 0) {
          setTimeout(() => {
            let reward: request.Options = {
              uri: `${this.smallTVUrl}/getReward?id=${joinID}`,
              jar: userData.jar
            }
            this._SmallTVReward(reward, userData)
          }, 2e5) // 200秒
        }
      })
      .catch((reject) => { tools.Log(userData.nickname, reject) })
  }
  /**
   * 获取小电视中奖结果
   * 
   * @private
   * @param {request.Options} reward
   * @param {userData} userData
   * @memberOf Lottery
   */
  private _SmallTVReward(reward: request.Options, userData: userData) {
    tools.XHR<string>(reward)
      .then((resolve) => {
        let smallTVRewardResponse: smallTVRewardResponse = JSON.parse(resolve)
        if (smallTVRewardResponse.code === 0) {
          if (smallTVRewardResponse.data.status === 2) {
            setTimeout(() => {
              this._SmallTVReward(reward, userData)
            }, 3e4) // 30秒
          }
          else if (smallTVRewardResponse.data.status === 0) {
            let winGift = smallTVRewardResponse.data.reward
            let gift: string
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
            tools.Log(userData.nickname, `获得 ${winGift.num} 个${gift}`)
          }
        }
      })
      .catch((reject) => { tools.Log(userData.nickname, reject) })
  }
  /**
   * 监听特殊礼物抽奖消息
   * 
   * @private
   * @param {SYS_GIFT} dataJson
   * @memberOf Lottery
   */
  private _LotteryHandler(dataJson: SYS_GIFT) {
    if (dataJson.rep !== 1 || dataJson.url === '') return
    let roomID = dataJson.roomid
    tools.Log(`房间 ${roomID} 开启了抽奖`)
    let usersData = options.usersData
    for (let uid in usersData) {
      let userData = usersData[uid]
      if (userData.status && userData.lottery) {
        let check: request.Options = {
          uri: `${this.lotteryUrl}/check?roomid=${roomID}`,
          jar: userData.jar
        }
        this._LotteryCheck(check, userData, roomID)
      }
    }
  }
  /**
   * 获取房间抽奖信息
   * 
   * @private
   * @param {request.Options} check
   * @param {userData} userData
   * @param {number} roomID
   * @memberOf Lottery
   */
  private _LotteryCheck(check: request.Options, userData: userData, roomID: number) {
    tools.XHR<string>(check)
      .then((resolve) => {
        let lotteryCheckResponse: lotteryCheckResponse = JSON.parse(resolve)
        if (lotteryCheckResponse.code === 0 && lotteryCheckResponse.data.length > 0) {
          let unjoins = lotteryCheckResponse.data
          unjoins.forEach((unjoin) => {
            if (unjoin.status === false) {
              let joinID = unjoin.raffleId
              let join: request.Options = {
                method: 'POST',
                uri: `${this.lotteryUrl}/join?roomid=${roomID}&raffleId=${joinID}`,
                jar: userData.jar
              }
              this._LotteryJoin(join, userData, joinID, roomID)
            }
          })
        }
      })
      .catch((reject) => { tools.Log(userData.nickname, reject) })
  }
  /**
   * 参与抽奖
   * 
   * @private
   * @param {request.Options} join
   * @param {userData} userData
   * @param {number} joinID
   * @param {number} roomID
   * @memberOf Lottery
   */
  private _LotteryJoin(join: request.Options, userData: userData, joinID: number, roomID: number) {
    tools.XHR<string>(join)
      .then((resolve) => {
        let lotteryJoinResponse: lotteryJoinResponse = JSON.parse(resolve)
        if (lotteryJoinResponse.code === 0) {
          setTimeout(() => {
            let reward: request.Options = {
              uri: `${this.lotteryUrl}/notice?roomid=${roomID}&raffleId=${joinID}`,
              jar: userData.jar
            }
            this._LotteryReward(reward, userData)
          }, 2e5) // 200秒
        }
      })
      .catch((reject) => { tools.Log(userData.nickname, reject) })
  }
  /**
   * 获取中奖结果
   * 
   * @private
   * @param {request.Options} reward
   * @param {userData} userData
   * @memberOf Lottery
   */
  private _LotteryReward(reward: request.Options, userData: userData) {
    tools.XHR<string>(reward)
      .then((resolve) => {
        let lotteryRewardResponse: lotteryRewardResponse = JSON.parse(resolve)
        if (lotteryRewardResponse.code === 0 && lotteryRewardResponse.data.giftName !== '') {
          let winGift = lotteryRewardResponse.data
          tools.Log(userData.nickname, `获得 ${winGift.giftNum} 个 ${winGift.giftName}`)
        }
      })
      .catch((reject) => { tools.Log(userData.nickname, reject) })
  }
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
  data: lotteryCheckResponseData[]
}
interface lotteryCheckResponseData {
  type: string
  raffleId: number
  time: number
  status: boolean
}
/**
 * 参与抽奖信息
 * 
 * @interface lotteryJoinResponse
 */
interface lotteryJoinResponse {
  code: number
  msg: string
  data: any[]
}
/**
 * 抽奖结果信息
 * 
 * @interface lotteryRewardResponse
 */
interface lotteryRewardResponse {
  code: number
  msg: string
  data: lotteryRewardResponseData
}
interface lotteryRewardResponseData {
  giftName: string
  giftNum: number
  giftId: number | string
  raffleId: number
}