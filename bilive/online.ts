import {EventEmitter} from 'events'
import * as jpeg from 'jpeg-js'
import * as app from './index'
import * as Tools from '../lib/tools'
/**
 * 挂机得经验
 * 
 * @export
 * @class Online
 * @extends {EventEmitter}
 */
export class Online extends EventEmitter {
  constructor() {
    super()
  }
  /**
   * 心跳包发送地址
   * 
   * @memberOf Online
   */
  public heartUrl = 'http://live.bilibili.com'
  /**
   * 开始挂机
   * 
   * @memberOf Online
   */
  public Start() {
    this.OnlineHeart()
    this.DoLoop()
  }
  /**
   * 发送在线心跳包, 检查cookie是否失效
   * 
   * @memberOf Online
   */
  public OnlineHeart() {
    Tools.UserInfo<app.config>(app.appName)
      .then((resolve) => {
        let usersData = resolve.usersData
        for (let uid in usersData) {
          let userData = usersData[uid]
          Tools.XHR(`${this.heartUrl}/User/userOnlineHeart`, userData.cookie, 'POST')
            .then((resolve) => {
              let onlineInfo = <userOnlineHeart>JSON.parse(resolve.toString())
              if (onlineInfo.code === -101) {
                if (userData.failure < 5) {
                  userData.failure++
                  Tools.UserInfo(app.appName, uid, userData)
                }
                else {
                  this.emit('cookieInfo', userData)
                  userData.failure = 0
                  userData.status = false
                  Tools.UserInfo(app.appName, uid, userData)
                }
              }
              else if (userData.failure !== 0) {
                userData.failure = 0
                Tools.UserInfo(app.appName, uid, userData)
              }
            })
            .catch()
        }
      })
      .catch()
    setTimeout(() => {
      this.OnlineHeart()
    }, 3e5) // 5分钟
  }
  /**
   * 八小时循环, 用于签到, 宝箱, 日常活动
   * 
   * @memberOf Online
   */
  public DoLoop() {
    Tools.UserInfo<app.config>(app.appName)
      .then((resolve) => {
        let usersData = resolve.usersData
        let eventRooms = resolve.eventRooms
        for (let uid in usersData) {
          let userData = usersData[uid]
          // 每日签到
          if (userData.doSign) this._DoSign(userData)
          // 每日宝箱
          if (userData.treasureBox) this._TreasureBox(userData)
          // 日常活动
          if (userData.eventRoom && eventRooms.length > 0) this._EventRoom(userData, eventRooms)
          // 日常活动附加
          if (userData.eventRoom) Tools.XHR(`${this.heartUrl}/redLeaf/kingMoneyGift`, userData.cookie).catch()
        }
        // 日常活动附加
        this._EventSubject(usersData)
      })
      .catch()
    setTimeout(() => {
      this.DoLoop()
    }, 288e5) // 8小时
  }
  /**
   * 每日签到
   * 
   * @private
   * @param {app.userData} userData
   * @memberOf Online
   */
  private _DoSign(userData: app.userData) {
    Tools.XHR(`${this.heartUrl}/sign/GetSignInfo`, userData.cookie)
      .then((resolve) => {
        let signInfo = <signInfo>JSON.parse(resolve.toString())
        if (signInfo.data.status === 0) {
          this.emit('signInfo', userData)
          Tools.XHR(`${this.heartUrl}/sign/doSign`, userData.cookie)
          // 道具包裹
          Tools.XHR(`${this.heartUrl}/giftBag/getSendGift`, userData.cookie)
        }
      })
      .catch()
  }
  /**
   * 每日宝箱
   * 
   * @private
   * @param {app.userData} userData
   * @memberOf Online
   */
  private _TreasureBox(userData: app.userData) {
    // 获取宝箱状态, 好像终于不用换房间冷却了呢
    let currentTask: currentTask
    Tools.XHR(`${this.heartUrl}/FreeSilver/getCurrentTask?_=${Date.now()}`, userData.cookie)
      .then((resolve) => {
        currentTask = <currentTask>JSON.parse(resolve.toString())
        return new Promise((resolve, reject) => {
          if (currentTask.code === 0) {
            setTimeout(resolve, currentTask.data.minute * 6e4, 'ok')
          }
          else {
            reject('none')
          }
        })
      })
      .then((resolve) => {
        return Tools.XHR(`${this.heartUrl}/freeSilver/getCaptcha?ts=${Date.now()}`, userData.cookie)
      })
      .then((resolve) => {
        // 读取像素信息
        let rawImageData = jpeg.decode(resolve, true).data
        // 因为图片大小固定, 直接给定值
        let baseX = 20, baseY = 6, width = baseX + 80, height = baseY + 31, rawWidth = 480
        // 用来存储结果, id为位置
        let id = 0, num = []
        // 逐列扫描
        for (let x = baseX; x < width; x++) {
          // 就算第x行有效像素个数
          let sum = 0
          for (let y = baseY; y < height; y++) {
            sum += ImageBin(x, y)
          }
          // 像素个数大于3判断为有效列
          if (sum > 3) {
            // 逐个分析此列像素信息
            for (let y = baseY; y < height; y++) {
              // 分析第一个有效像素位置
              if (ImageBin(x, y) === 1) {
                // 可能数字0, 2, 3, 5, 6, 7, 8, 9
                if (y < baseY + 3) {
                  // 此列第12行有像素则可能数字0, 5, 6, 9
                  if (ImageBin(x, baseY + 12, true) === 1) {
                    // 右移12列第5行有像素则可能数字0, 6, 9
                    if (ImageBin(x + 12, baseY + 5, true) === 1) {
                      // 此列第19行有像素则可能数字0, 6
                      if (ImageBin(x, baseY + 19, true) === 1) {
                        // 右移16列第14行有像素则可能数字6
                        if (ImageBin(x + 6, baseY + 14, true) === 1) {
                          num[id] = 6
                          id++
                          x += 15
                          break
                        }
                        else {
                          num[id] = 0
                          id++
                          x += 15
                          break
                        }
                      }
                      else {
                        num[id] = 9
                        id++
                        x += 15
                        break
                      }
                    }
                    else {
                      num[id] = 5
                      id++
                      x += 15
                      break
                    }
                  }
                  else {
                    // 此列第28行有像素则可能数字2, 3, 8
                    if (ImageBin(x, baseY + 28, true) === 1) {
                      // 右移12列第23行有像素则可能数字3, 8
                      if (ImageBin(x + 12, baseY + 23, true) === 1) {
                        // 此列第18行有像素则可能数字8
                        if (ImageBin(x, baseY + 18, true) === 1) {
                          num[id] = 8
                          id++
                          x += 15
                          break
                        }
                        else {
                          num[id] = 3
                          id++
                          x += 15
                          break
                        }
                      }
                      else {
                        num[id] = 2
                        id++
                        x += 15
                        break
                      }
                    }
                    else {
                      num[id] = 7
                      id++
                      x += 15
                      break
                    }
                  }
                }
                // 可能数字1
                else if (y < baseY + 10) {
                  num[id] = 1
                  id++
                  x += 6
                  break
                }
                // 可能运算符'+', '-'
                else if (y < baseY + 18) {
                  // 右移6列第12行有像素则可能运算符'+'
                  if (ImageBin(x + 6, baseY + 12, true) === 1) {
                    num[id] = '+'
                    id++
                    x += 16
                    break
                  }
                  else {
                    num[id] = '-'
                    id++
                    x += 8
                    break
                  }
                }
                else {
                  num[id] = 4
                  id++
                  x += 16
                  break
                }
              }
            }
          }
        }
        // 最后结果为四位则可能正确
        return new Promise((resolve, reject) => {
          if (num.length === 4) {
            let captcha: number = num[2] === '+' ? num[0] * 10 + num[1] + num[3] : num[0] * 10 + num[1] - num[3]
            resolve(Tools.XHR(`${this.heartUrl}/FreeSilver/getAward?time_start=${currentTask.data.time_start}&time_end=${currentTask.data.time_end}&captcha=${captcha}&_=${Date.now()}`, userData.cookie))
          }
          else {
            reject('error')
          }
        })
        /**
         * 二值化
         * 
         * @param {number} x
         * @param {number} y
         * @param {boolean} [block=false]
         * @returns {number}
         */
        function ImageBin(x: number, y: number, block = false): number {
          if (block) {
            let sum = ImageBin(x, y) + ImageBin(x + 1, y) + ImageBin(x, y + 1) + ImageBin(x + 1, y + 1)
            return sum > 2 ? 1 : 0
          }
          else {
            return (rawImageData[x * 4 + y * rawWidth] * 3 + rawImageData[x * 4 + 1 + y * rawWidth] * 6 + rawImageData[x * 4 + 2 + y * rawWidth]) < 1280 ? 1 : 0
          }
        }
      })
      .then((resolve: Buffer) => {
        let award = <award>JSON.parse(resolve.toString())
        return new Promise((resolve, reject) => {
          if (award.code === 0) {
            this._TreasureBox(userData)
            resolve('ok')
          }
          else {
            reject('error')
          }
        })
      })
      .catch((reject: string) => {
        if (reject === 'error') { this._TreasureBox(userData) }
      })
  }
  /**
   * 日常活动
   * 
   * @private
   * @param {app.userData} userData
   * @param {number[]} roomIDs
   * @memberOf Online
   */
  private _EventRoom(userData: app.userData, roomIDs: number[]) {
    roomIDs.forEach((roomID) => {
      Tools.XHR(`${this.heartUrl}/live/getInfo?roomid=${roomID}`)
        .then((resolve) => {
          let roomInfo = <roomInfo>JSON.parse(resolve.toString())
          let masterID = roomInfo.data.MASTERID
          return Tools.XHR(`${this.heartUrl}/eventRoom/index?ruid=${masterID}`, userData.cookie)
        })
        .then((resolve) => {
          let eventRoom = <eventRoom>JSON.parse(resolve.toString())
          if (eventRoom.code === 0 && eventRoom.data.heart) {
            let heartTime = eventRoom.data.heartTime * 1000
            setTimeout(() => {
              this._EventRoomHeart(userData, heartTime, roomID)
            }, heartTime)
          }
        })
        .catch()
    })
  }
  /**
   * 发送活动心跳包
   * 
   * @private
   * @param {app.userData} userData
   * @param {number} heartTime
   * @param {number} roomID
   * @memberOf Online
   */
  private _EventRoomHeart(userData: app.userData, heartTime: number, roomID: number) {
    Tools.XHR(`${this.heartUrl}/eventRoom/heart?roomid=${roomID}`, userData.cookie, 'POST')
      .then((resolve) => {
        let eventRoomHeart = <eventRoomHeart>JSON.parse(resolve.toString())
        if (eventRoomHeart.code === 0 && eventRoomHeart.data.heart) {
          setTimeout(() => {
            this._EventRoomHeart(userData, heartTime, roomID)
          }, heartTime)
        }
      })
      .catch()
  }
  /**
   * 日常活动附加
   * 
   * @private
   * @param {app.usersData} usersData
   * @memberOf Online
   */
  private _EventSubject(usersData: app.usersData) {
    Tools.XHR(`${this.heartUrl}/eventSubject/masterRank?eventKey=redleaf&eventType=fete&page=1`)
      .then((resolve) => {
        let eventSubject = <eventSubject>JSON.parse(resolve.toString())
        let eventRoomList = eventSubject.data.list
        eventRoomList.forEach((room) => {
          Tools.XHR(`${this.heartUrl}/eventRoom/index?ruid=${room.ruid}`)
            .then((resolve) => {
              let eventRoom = <eventRoom>JSON.parse(resolve.toString())
              if (eventRoom.data.eventList[0].is2233 !== 1) {
                for (let uid in usersData) {
                  let userData = usersData[uid]
                  if (userData.eventRoom) Tools.XHR(`${this.heartUrl}/redLeaf/get33RoomCapsule?ruid=${room.ruid}`, userData.cookie).catch()
                }
              }
            })
            .catch()
        })
      })
      .catch()
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
 * @interface userOnlineHeart
 */
interface userOnlineHeart {
  code: number
  msg: string
}
/**
 * 在线领瓜子宝箱
 * 
 * @interface currentTask
 */
interface currentTask {
  code: number
  msg: string
  data: currentTaskData
}
interface currentTaskData {
  minute: number
  silver: number
  time_start: number
  time_end: number
}
/**
 * 领瓜子答案提交返回
 * 
 * @interface award
 */
interface award {
  code: number
  msg: string
  data: awardData
}
interface awardData {
  silver: number
  awardSilver: number
  isEnd: number
}
/**
 * 活动信息
 * 
 * @interface eventRoom
 */
interface eventRoom {
  code: number
  msg: string
  data: eventRoomData
}
interface eventRoomData {
  eventList: eventRoomDataEventList[]
  heart: boolean
  heartTime: number
}
interface eventRoomDataEventList {
  status: boolean
  score: number
  giftId: number
  type: string
  masterTitle: string
  keyword: string
  bagId: number
  num: number
  kingMoney: number
  isGoldBinBin: number
  goldBinBinInRoom: number
  team_id: number
  goldBinBinHeart: number
  is2233: number
}
/**
 * 活动心跳返回
 * 
 * @interface eventRoomHeart
 */
interface eventRoomHeart {
  code: number
  msg: string
  data: eventRoomHeartData
}
interface eventRoomHeartData {
  uid: number
  gift: eventRoomHeartDataGift
  heart: boolean
}
interface eventRoomHeartDataGift {
  '43': eventRoomHeartDataGiftOrange; // 命格转盘
}
interface eventRoomHeartDataGiftOrange {
  num: number
  bagId: number
  dayNum: number
}
/**
 * 日常活动附加
 * 
 * @interface eventSubject
 */
interface eventSubject {
  code: number
  msg: string
  data: eventSubjectData
}
interface eventSubjectData {
  uid: number
  page: number
  pageSize: number
  info: eventSubjectInfo
  list: eventSubjectList[]
}
interface eventSubjectInfo {
  uname: string
  ruid: number
  face: string
  score: number
  link: string
  title: string
  rank: string
}
interface eventSubjectList {
  uname: string
  ruid: string
  face: string
  rank: number
  score: number
  roomid: string
  title: string
  kingMoney: number
  link: string
}
/**
 * 房间信息
 * 
 * @interface roomInfo
 */
interface roomInfo {
  code: number
  msg: string
  data: roomInfoData
}
interface roomInfoData {
  UID: number
  IS_NEWBIE: number
  ISATTENTION: number
  ISADMIN: number
  ISANCHOR: number
  SVIP: number
  VIP: number
  SILVER: number
  GOLD: number
  BLOCK_TYPE: number
  BLOCK_TIME: number
  UNAME: number
  MASTERID: number
  ANCHOR_NICK_NAME: string
  ROOMID: number
  _status: string
  LIVE_STATUS: string
  ROUND_STATUS: number
  AREAID: number
  BACKGROUND_ID: number
  ROOMtITLE: string
  COVER: string
  LIVE_TIMELINE: number
  FANS_COUNT: number
  GIFT_TOP: roomInfoDataGiftTop[]
  RCOST: number
  MEDAL: any[]
  IS_STAR: boolean
  starRank: number
  TITLE: roomInfoDataTitle
  USER_LEVEL: roomInfoDataUserLevel[]
  IS_RED_BAG: boolean
  IS_HAVE_VT: boolean
  ACTIVITY_ID: number
  ACTIVITY_PIC: number
  MI_ACTIVITY: number
  PENDANT: string
}
interface roomInfoDataGiftTop {
  uid: number
  uname: string
  coin: number
  isSelf: number
}
interface roomInfoDataTitle {
  title: string
}
interface roomInfoDataUserLevel {
  level: number
  rank: number
}
// gm mogrify -crop 80x31+20+6 -quality 100 getCaptcha.jpg
// gm mogrify -format pbm -quality 0 getCaptcha.jpg