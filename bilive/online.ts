import * as events from 'events'
import * as app from './index'
import {CommentClient} from './lib/comment_client'
import {Tools} from '../lib/tools'
/**
 * 挂机得经验
 * 
 * @class Online
 * @extends {events.EventEmitter}
 */
export class Online extends events.EventEmitter {
  /**
   * 挂机得经验
   * 
   */
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
    this.GetUsersData()
      .then((resolve) => {
        let usersData = resolve
        for (let x in usersData) {
          Tools.XHR('http://live.bilibili.com/User/userOnlineHeart', usersData[x].cookie, 'POST')
            .then((resolve) => {
              let onlineInfo = JSON.parse(resolve.toString())
              if (onlineInfo['code'] == -101) {
                this.emit('cookieInfo', usersData[x])
                let changeUserData = usersData[x]
                changeUserData.status = false
                Tools.UserInfo(app.appName, { [x]: changeUserData })
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
   * @param {app.userData} userData
   */
  private SummerHeart(userData: app.userData) {
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
    this.GetUsersData()
      .then((resolve) => {
        let usersData = resolve
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
  /**
   * 获取可用用户信息
   * 
   * @private
   * @returns {Promise<app.usersData>}
   */
  private GetUsersData(): Promise<app.usersData> {
    return Tools.UserInfo(app.appName)
      .then((resolve: app.config) => {
        let usersData = resolve.usersData
        let canUsersData: app.usersData = {}
        for (let x in usersData) {
          if (usersData[x].status === true) {
            Object.assign(canUsersData, { [x]: usersData[x] })
          }
        }
        return canUsersData
      })
  }
}
// gm mogrify -crop 80x31+20+6 -quality 100 getCaptcha.jpg
// gm mogrify -format pbm -quality 0 getCaptcha.jpg
/**
 * 签到信息
 * 
 * @export
 * @interface signInfo
 */
export interface signInfo extends JSON {
  code: number
  msg: string
  data: signInfoData
}
export interface signInfoData extends JSON {
  text: string
  status: number
  allDays: string
  curMonth: string
  newTask: number
  hadSignDays: number
  remindDays: number
}
/**
 * 团扇活动信息
 * 
 * @export
 * @interface summerRoom
 */
export interface summerRoom extends JSON {
  code: number;
  msg: string;
  data: summerRoomData;
}
export interface summerRoomData extends JSON {
  summerStatus: number;
  masterTitle: string;
  summerScore: number;
  summerNum: number;
  isTop: number;
  isExtra: number;
  summerHeart: boolean;
  summerTimelen: number;
  bagId: number;
}
/**
 * 团扇活动心跳返回
 * 
 * @export
 * @interface summerHeart
 */
export interface summerHeart {
  code: number;
  msg: string;
  data: summerHeartData;
}
export interface summerHeartData {
  uid: number;
  bag_id: number;
  summerNum: number;
  summerHeart: boolean;
}