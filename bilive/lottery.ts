import * as events from 'events'
import * as app from './index'
import {CommentClient} from './lib/comment_client'
import * as Tools from '../lib/tools'
/**
 * 自动参与抽奖
 * 
 * @class Lottery
 * @extends {events.EventEmitter}
 */
export class Lottery extends events.EventEmitter {
  constructor() {
    super()
  }
  private lotteryUrl = 'http://live.bilibili.com/summer/'
  private smallTVUrl = 'http://live.bilibili.com/SmallTV/'
  private CommentClient: CommentClient
  /**
   * 开始挂机
   */
  public Start() {
    Tools.UserInfo<app.config>(app.appName)
      .then((resolve) => {
        this.CommentClient = new CommentClient(resolve.defaultUserID, resolve.defaultRommID)
        this.CommentClient
          .on('SYS_MSG', (jsonData) => { this.MSGHandler(<SYS_MSG>jsonData) })
          .on('SYS_GIFT', (jsonData) => { this.GiftHandler(<SYS_GIFT>jsonData) })
          .on('serverError', (err) => { this.emit('serverError', err) })
        this.CommentClient.Connect()
      })
  }
  /**
   * 获取房间ID
   * 
   * @private
   * @param {string} url
   * @returns {Promise<string>}
   */
  private GetRoomID(url: string): Promise<string> {
    return Tools.XHR(url)
      .then((resolve: Buffer) => {
        let roomID = resolve.toString().match(/var ROOMID = (\d+)/)[1]
        return roomID
      })
  }
  /**
   * 监听系统消息
   * 
   * @private
   * @param {SYS_MSG} jsonData 弹幕信息
   */
  private MSGHandler(jsonData: SYS_MSG) {
    if (jsonData.rep == 1 && jsonData.url != '') {
      let roomID: string
      this.GetRoomID(jsonData.url)
        .then((resolve) => {
          roomID = resolve
          return Tools.UserInfo<app.config>(app.appName)
        })
        .then((resolve) => {
          let usersData: Tools.usersData = resolve.usersData
          for (let x in usersData) {
            if (usersData[x].status === true) {
              let indexUrl = `${this.smallTVUrl}index?roomid=${roomID}`
              this.IndexSmallTV(indexUrl, usersData[x], roomID)
            }
          }
        })
    }
  }
  /**
   * 获取小电视活动id
   * 
   * @private
   * @param {string} indexUrl
   * @param {Tools.userData} userData
   * @param {string} roomID
   */
  private IndexSmallTV(indexUrl: string, userData: Tools.userData, roomID: string) {
    Tools.XHR(indexUrl, userData.cookie)
      .then((resolve) => {
        let index = <smallTVCheck>JSON.parse(resolve.toString())
        let unjion = index.data.unjoin
        for (let y of unjion) {
          let jionID = y.id
          let joinUrl = `${this.smallTVUrl}join?roomid=${roomID}&id=${jionID}`
          this.JionSmallTV(joinUrl, userData, jionID)
        }
      })
  }
  /**
   * 参加小电视活动
   * 
   * @private
   * @param {string} joinUrl
   * @param {Tools.userData} userData
   * @param {number} jionID
   */
  private JionSmallTV(joinUrl: string, userData: Tools.userData, jionID: number) {
    Tools.XHR(joinUrl, userData.cookie)
      .then((resolve) => {
        let join = <smallTVJoin>JSON.parse(resolve.toString())
        setTimeout(() => {
          let rewardUrl = `${this.smallTVUrl}getReward?id=${jionID}`
          this.RewardSmallTV(rewardUrl, userData)
        }, 28e4) // 280秒
      })
  }
  /**
   * 获取参与结果
   * 
   * @private
   * @param {string} rewardUrl
   * @param {Tools.userData} userData
   */
  private RewardSmallTV(rewardUrl: string, userData: Tools.userData) {
    Tools.XHR(rewardUrl, userData.cookie)
      .then((resolve) => {
        let reward = <smallTVReward>JSON.parse(resolve.toString())
        if (reward.code === 0 && reward.data.status == 2) {
          setTimeout(() => {
            this.RewardSmallTV(rewardUrl, userData)
          }, 6e4) // 60秒
        }
        else if (reward.code === 0 && reward.data.reward.id === 1) {
          this.emit('smalltv', userData)
        }
      })
  }
  /**
   * 监听系统礼物消息
   * 
   * @private
   * @param {SYS_GIFT} jsonData
   */
  private GiftHandler(jsonData: SYS_GIFT) {
    if (jsonData.rep === 1 && jsonData.url !== '') {
      let roomID: string
      this.GetRoomID(jsonData.url)
        .then((resolve) => {
          roomID = resolve
          return Tools.UserInfo<app.config>(app.appName)
        })
        .then((resolve) => {
          let usersData = resolve.usersData
          for (let x in usersData) {
            if (usersData[x].status === true) {
              let checkUrl = `${this.lotteryUrl}check?roomid=${roomID}`
              this.CheckLottery(checkUrl, usersData[x], roomID)
            }
          }
        })
    }
  }
  /**
   * 查看房间抽奖信息
   * 
   * @private
   * @param {string} checkUrl
   * @param {Tools.userData} userData
   * @param {string} roomID
   */
  private CheckLottery(checkUrl: string, userData: Tools.userData, roomID: string) {
    Tools.XHR(checkUrl, userData.cookie)
      .then((resolve) => {
        let check = <lotteryCheck>JSON.parse(resolve.toString())
        if (check.code === 0) {
          let unjoin = check.data
          for (let y of unjoin) {
            if (y.status === false) {
              let raffleID = y.raffleId
              let joinUrl = `${this.lotteryUrl}join?roomid=${roomID}&raffleId=${raffleID}`
              this.JoinLottery(joinUrl, userData, roomID, raffleID)
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
   * @param {Tools.userData} userData
   * @param {String} roomID
   * @param {number} raffleID
   */
  private JoinLottery(joinUrl: string, userData: Tools.userData, roomID: String, raffleID: number) {
    Tools.XHR(joinUrl, userData.cookie, 'POST')
      .then((resolve) => {
        let join = <lotteryJoin>JSON.parse(resolve.toString())
        if (join.code === 0) {
          setTimeout(() => {
            let resultUrl = `${this.lotteryUrl}notice?roomid=${roomID}&raffleId=${raffleID}`
            this.RewardLottery(resultUrl, userData)
          }, 2e5) // 200秒
        }
      })
  }
  /**
   * 获取中奖结果
   * 
   * @private
   * @param {string} resultUrl
   * @param {Tools.userData} userData
   */
  private RewardLottery(resultUrl: string, userData: Tools.userData) {
    Tools.XHR(resultUrl, userData.cookie)
      .then((resolve: Buffer) => {
        let reward = <lotteryReward>JSON.parse(resolve.toString())
        if (reward.code === 0 && reward.data.giftName !== '' && reward.data.giftId === 't') {
          this.emit('lottery', userData)
        }
      })
  }
}
/**
 * 系统消息
 * 
 * @interface SYS_MSG
 */
interface SYS_MSG {
  cmd: string
  msg: string
  rep: number
  styleType: number
  url: string
}
/**
 * 小电视信息
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
 * 小电视参与信息
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
 * 获奖信息
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
 * 系统礼物消息
 * 
 * @interface SYS_GIFT
 */
interface SYS_GIFT {
  cmd: string
  msg: string
  tips: string
  rep: number
  msgTips: number
  url: string
  roomid: number
  rnd: string
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