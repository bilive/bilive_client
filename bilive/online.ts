import * as events from 'events'
import * as app from './index'
import {CommentClient} from './lib/comment_client'
import * as Tools from '../lib/tools'
/**
 * 挂机得经验
 * 
 * @export
 * @class Online
 * @extends {events.EventEmitter}
 */
export class Online extends events.EventEmitter {
  constructor() {
    super()
  }
  /**
   * 开始挂机
   */
  public Start() {
    this.OnlineHeart()
    this.DoSign()
  }
  /**
   * 发送心跳包
   * 
   * @private
   */
  private OnlineHeart() {
    Tools.UserInfo<app.config>(app.appName)
      .then((resolve) => {
        let usersData = resolve.usersData
        for (let x in usersData) {
          Tools.XHR('http://live.bilibili.com/User/userOnlineHeart', usersData[x].cookie, 'POST')
            .then((resolve) => {
              let onlineInfo = <userOnlineHeart>JSON.parse(resolve.toString())
              if (onlineInfo.code == -101) {
                this.emit('cookieInfo', usersData[x])
                Tools.UserInfo(app.appName, x, usersData[x])
              }
            })
        }
      })
    setTimeout(() => {
      this.OnlineHeart()
    }, 3e5) // 5分钟
  }
  /**
   * 发送活动心跳包
   * 
   * @private
   * @param {Tools.userData} userData
   */
  private SummerHeart(userData: Tools.userData) {
    Tools.XHR('http://live.bilibili.com/summer/heart', userData.cookie, 'POST')
      .then((resolve) => {
        let summerHeart = <summerHeart>JSON.parse(resolve.toString())
        if (summerHeart.code === 0 && summerHeart.data.summerHeart) {
          setTimeout(() => {
            this.SummerHeart(userData)
          }, 3e5) // 5分钟
        }
      })
  }
  /**
   * 每日签到
   * 
   * @private
   */
  private DoSign() {
    Tools.UserInfo<app.config>(app.appName)
      .then((resolve) => {
        let usersData = resolve.usersData
        for (let x in usersData) {
          Tools.XHR('http://live.bilibili.com/sign/GetSignInfo', usersData[x].cookie)
            .then((resolve) => {
              let signInfo = <signInfo>JSON.parse(resolve.toString())
              if (signInfo.data.status == 0) {
                this.emit('signInfo', usersData[x])
                Tools.XHR('http://live.bilibili.com/sign/doSign', usersData[x].cookie)
              }
            })
          // 夏季团扇活动
          Tools.XHR('http://live.bilibili.com/summer/getSummerRoom?ruid=673816', usersData[x].cookie)
            .then((resolve) => {
              let summerRoom = <summerRoom>JSON.parse(resolve.toString())
              if (summerRoom.code === 0 && summerRoom.data.summerHeart) {
                setTimeout(() => {
                  this.SummerHeart(usersData[x])
                }, 3e5) // 5分钟
              }
            })
        }
      })
    setTimeout(() => {
      this.DoSign()
    }, 288e5) // 8小时
  }
}
/**
 * 签到信息
 * 
 * @export
 * @interface signInfo
 */
interface signInfo {
  code: number
  msg: string
  data: signInfoData
}
interface signInfoData {
  text: string
  status: number
  allDays: string
  curMonth: string
  newTask: number
  hadSignDays: number
  remindDays: number
}
/**
 * 在线心跳返回
 * 
 * @export
 * @interface userOnlineHeart
 */
export interface userOnlineHeart {
  code: number
  msg: string
}
/**
 * 团扇活动信息
 * 
 * @interface summerRoom
 */
interface summerRoom {
  code: number
  msg: string
  data: summerRoomData
}
interface summerRoomData {
  summerStatus: number
  masterTitle: string
  summerScore: number
  summerNum: number
  isTop: number
  isExtra: number
  summerHeart: boolean
  summerTimelen: number
  bagId: number
}
/**
 * 团扇活动心跳返回
 * 
 * @interface summerHeart
 */
interface summerHeart {
  code: number
  msg: string
  data: summerHeartData
}
interface summerHeartData {
  uid: number
  bag_id: number
  summerNum: number
  summerHeart: boolean
}

// gm mogrify -crop 80x31+20+6 -quality 100 getCaptcha.jpg
// gm mogrify -format pbm -quality 0 getCaptcha.jpg