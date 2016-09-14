import {EventEmitter}  from 'events'
import {CommentClient, SYS_MSG, SYS_GIFT} from './lib/comment_client'
import * as app from './index'
import * as Tools from '../lib/tools'
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
  public smallTVUrl = 'http://live.bilibili.com/SmallTV'
  /**
   * 特殊道具抽奖地址
   * 
   * @type {string}
   * @memberOf Lottery
   */
  public lotteryUrl = 'http://live.bilibili.com/eventRoom'
  /**
   * 用于接收系统消息
   * 
   * @private
   * @type {CommentClient}
   * @memberOf Lottery
   */
  private _CommentClient: CommentClient = null
  /**
   * 开始监听系统消息
   * 
   * @memberOf Lottery
   */
  public Start() {
    Tools.UserInfo<app.config>(app.appName)
      .then((resolve) => {
        this._CommentClient = new CommentClient(resolve.defaultRoomID, resolve.defaultUserID)
        this._CommentClient
          .on('SYS_MSG', this._SmallTVHandler.bind(this))
          .on('SYS_GIFT', this._LotteryHandler.bind(this))
          .on('serverError', (err) => { this.emit('serverError', err) })
          .Connect()
      })
  }
  /**
   * 获取房间ID
   * 
   * @private
   * @param {string} url
   * @returns {Promise<number>}
   * @memberOf Lottery
   */
  private GetRoomID(url: string): Promise<number> {
    return Tools.XHR(url)
      .then((resolve) => {
        let roomIDStr = resolve.toString().match(/var ROOMID = (\d+)/)[1]
        let roomID = parseInt(roomIDStr)
        return roomID
      })
  }
  /**
   * 监听小电视消息
   * 
   * @private
   * @param {SYS_MSG} dataJson
   * @memberOf Lottery
   */
  private _SmallTVHandler(dataJson: SYS_MSG) {
    if (dataJson.styleType !== 2 || dataJson.url === '') return
    let roomID: number
    this.GetRoomID(dataJson.url)
      .then((resolve) => {
        roomID = resolve
        return Tools.UserInfo<app.config>(app.appName)
      })
      .then((resolve) => {
        let usersData = resolve.usersData
        for (let uid in usersData) {
          let userData = usersData[uid]
          if (userData.smallTV) {
            let checkUrl = `${this.smallTVUrl}/index?roomid=${roomID}`
            this._SmallTVCheck(checkUrl, userData, roomID)
          }
        }
      })
  }
  /**
   * 获取房间小电视抽奖信息
   * 
   * @private
   * @param {string} checkUrl
   * @param {app.userData} userData
   * @param {number} roomID
   * @memberOf Lottery
   */
  private _SmallTVCheck(checkUrl: string, userData: app.userData, roomID: number) {
    Tools.XHR(checkUrl, userData.cookie)
      .then((resolve) => {
        let check = <smallTVCheck>JSON.parse(resolve.toString())
        if (check.code === 0) {
          let unjions = check.data.unjoin
          for (let unjion of unjions) {
            let jionID = unjion.id
            let joinUrl = `${this.smallTVUrl}/join?roomid=${roomID}&id=${jionID}`
            this._SmallTVJion(joinUrl, userData, jionID)
          }
        }
      })
  }
  /**
   * 参加小电视抽奖
   * 
   * @private
   * @param {string} joinUrl
   * @param {app.userData} userData
   * @param {number} jionID
   * @memberOf Lottery
   */
  private _SmallTVJion(joinUrl: string, userData: app.userData, jionID: number) {
    Tools.XHR(joinUrl, userData.cookie)
      .then((resolve) => {
        let join = <smallTVJoin>JSON.parse(resolve.toString())
        if (join.code === 0) {
          setTimeout(() => {
            let rewardUrl = `${this.smallTVUrl}/getReward?id=${jionID}`
            this._SmallTVReward(rewardUrl, userData)
          }, 28e4) // 280秒
        }
      })
  }
  /**
   * 获取小电视中奖结果
   * 
   * @private
   * @param {string} rewardUrl
   * @param {app.userData} userData
   * @memberOf Lottery
   */
  private _SmallTVReward(rewardUrl: string, userData: app.userData) {
    Tools.XHR(rewardUrl, userData.cookie)
      .then((resolve) => {
        let reward = <smallTVReward>JSON.parse(resolve.toString())
        if (reward.code === 0 && reward.data.status == 2) {
          setTimeout(() => {
            this._SmallTVReward(rewardUrl, userData)
          }, 6e4) // 60秒
        }
        else if (reward.code === 0 && reward.data.reward.id === 1) {
          this.emit('smalltv', userData)
        }
      })
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
    return Tools.UserInfo<app.config>(app.appName)
      .then((resolve) => {
        let usersData = resolve.usersData
        for (let uid in usersData) {
          let userData = usersData[uid]
          if (userData.lottery) {
            let checkUrl = `${this.lotteryUrl}/check?roomid=${roomID}`
            this._LotteryCheck(checkUrl, userData, roomID)
          }
        }
      })
  }
  /**
   * 获取房间抽奖信息
   * 
   * @private
   * @param {string} checkUrl
   * @param {app.userData} userData
   * @param {number} roomID
   * @memberOf Lottery
   */
  private _LotteryCheck(checkUrl: string, userData: app.userData, roomID: number) {
    Tools.XHR(checkUrl, userData.cookie)
      .then((resolve) => {
        let check = <lotteryCheck>JSON.parse(resolve.toString())
        if (check.code === 0) {
          let unjoins = check.data
          for (let unjoin of unjoins) {
            if (unjoin.status === false) {
              let jionID = unjoin.raffleId
              let joinUrl = `${this.lotteryUrl}/join?roomid=${roomID}&raffleId=${jionID}`
              this._LotteryJoin(joinUrl, userData, jionID, roomID)
            }
          }
        }
      })
  }
  /**
   * 参与抽奖
   * 
   * @private
   * @param {string} joinUrl
   * @param {app.userData} userData
   * @param {number} jionID
   * @param {number} roomID
   * @memberOf Lottery
   */
  private _LotteryJoin(joinUrl: string, userData: app.userData, jionID: number, roomID: number) {
    Tools.XHR(joinUrl, userData.cookie, 'POST')
      .then((resolve) => {
        let join = <lotteryJoin>JSON.parse(resolve.toString())
        if (join.code === 0) {
          setTimeout(() => {
            let rewardUrl = `${this.lotteryUrl}/notice?roomid=${roomID}&raffleId=${jionID}`
            this._LotteryReward(rewardUrl, userData)
          }, 2e5) // 200秒
        }
      })
  }
  /**
   * 获取中奖结果
   * 
   * @private
   * @param {string} rewardUrl
   * @param {app.userData} userData
   * @memberOf Lottery
   */
  private _LotteryReward(rewardUrl: string, userData: app.userData) {
    Tools.XHR(rewardUrl, userData.cookie)
      .then((resolve) => {
        let reward = <lotteryReward>JSON.parse(resolve.toString())
        if (reward.code === 0 && reward.data.giftName !== '') {
          let giftName = reward.data.giftName
          this.emit('lottery', userData, giftName)
        }
      })
  }
}
/**
 * 房间小电视抽奖信息
 * 
 * @interface smallTVCheck
 */
interface smallTVCheck {
  code: number
  msg: string
  data: smallTVCheckData
}
interface smallTVCheckData {
  lastid: number
  join: smallTVCheckDataJoin[]
  unjoin: smallTVCheckDataJoin[]
}
interface smallTVCheckDataJoin {
  id: number
  dtime: number
}
/**
 * 参与小电视抽奖信息
 * 
 * @interface smallTVJoin
 */
interface smallTVJoin {
  code: number
  msg: string
  data: smallTVJoinData
}
interface smallTVJoinData {
  id: number
  dtime: number
  status: number
}
/**
 * 小电视抽奖结果信息
 * 
 * @interface smallTVReward
 */
interface smallTVReward {
  code: number
  msg: string
  data: smallTVRewardData
}
interface smallTVRewardData {
  fname: string
  sname: string
  reward: smallTVRewardDataReward
  win: number
  status: number
}
interface smallTVRewardDataReward {
  id: number
  num: number
}
/**
 * 房间抽奖信息
 * 
 * @interface lotteryCheck
 */
interface lotteryCheck {
  code: number
  msg: string
  data: lotteryCheckData[]
}
interface lotteryCheckData {
  type: string
  raffleId: number
  time: number
  status: boolean
}
/**
 * 参与抽奖信息
 * 
 * @interface lotteryJoin
 */
interface lotteryJoin {
  code: number
  msg: string
  data: any[]
}
/**
 * 抽奖结果信息
 * 
 * @interface lotteryReward
 */
interface lotteryReward {
  code: number
  msg: string
  data: lotteryRewardData
}
interface lotteryRewardData {
  giftName: string
  giftNum: number
  giftId: number | string
  raffleId: number
}