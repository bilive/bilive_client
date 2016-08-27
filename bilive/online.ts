import * as events from 'events'
import * as jpeg from 'jpeg-js'
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
  private rootUrl = 'http://live.bilibili.com'
  /**
   * 开始挂机
   */
  public Start() {
    this.OnlineHeart()
    this.DoLoop()
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
          Tools.XHR(`${this.rootUrl}/User/userOnlineHeart`, usersData[x].cookie, 'POST')
            .then((resolve) => {
              let onlineInfo = <userOnlineHeart>JSON.parse(resolve.toString())
              if (onlineInfo.code === -101) {
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
   * 八小时循环
   * 
   * @private
   */
  private DoLoop() {
    Tools.UserInfo<app.config>(app.appName)
      .then((resolve) => {
        let usersData = resolve.usersData
        for (let x in usersData) {
          this.DoSign(usersData[x])
          // 每日宝箱
          this.TreasureBox(usersData[x])
          // 夏季团扇活动
          this.SummerActivity(usersData[x])
        }
        // 夏季团扇活动附加
        this.SummerActivityExtra(usersData)
      })
    setTimeout(() => {
      this.DoLoop()
    }, 288e5) // 8小时
  }
  /**
   * 每日签到
   * 
   * @private
   * @param {Tools.userData} userData
   */
  private DoSign(userData: Tools.userData) {
    Tools.XHR(`${this.rootUrl}/sign/GetSignInfo`, userData.cookie)
      .then((resolve) => {
        let signInfo = <signInfo>JSON.parse(resolve.toString())
        if (signInfo.data.status === 0) {
          this.emit('signInfo', userData)
          Tools.XHR(`${this.rootUrl}/sign/doSign`, userData.cookie)
        }
      })
  }
  /**
   * 每日宝箱
   * 
   * @private
   * @param {Tools.userData} userData
   */
  private TreasureBox(userData: Tools.userData) {
    // 道具包裹, 暂时不知道有没有用
    Tools.XHR(`${this.rootUrl}/giftBag/getSendGift`, userData.cookie)
    // 获取宝箱状态, 好像终于不用换房间冷却了呢
    let currentTask: currentTask
    Tools.XHR(`${this.rootUrl}/FreeSilver/getCurrentTask?_=${Date.now()}`, userData.cookie)
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
        return Tools.XHR(`${this.rootUrl}/freeSilver/getCaptcha?ts=${Date.now()}`, userData.cookie)
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
            resolve(Tools.XHR(`${this.rootUrl}/FreeSilver/getAward?time_start=${currentTask.data.time_start}&time_end=${currentTask.data.time_end}&captcha=${captcha}&_=${Date.now()}`, userData.cookie))
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
         * @returns
         */
        function ImageBin(x: number, y: number, block = false) {
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
            this.TreasureBox(userData)
            resolve('ok')
          }
          else {
            reject('error')
          }
        })
      })
      .catch((reject: string) => {
        if (reject === 'error') { this.TreasureBox(userData) }
      })
  }
  /**
   * 夏季团扇活动
   * 
   * @private
   * @param {Tools.userData} userData
   */
  private SummerActivity(userData: Tools.userData) {
    Tools.XHR(`${this.rootUrl}/summer/getSummerRoom?ruid=673816`, userData.cookie)
      .then((resolve) => {
        let summerRoom = <summerRoom>JSON.parse(resolve.toString())
        if (summerRoom.code === 0 && summerRoom.data.summerHeart) {
          setTimeout(() => {
            this.SummerHeart(userData)
          }, 3e5) // 5分钟
        }
      })
  }
  /**
   * 夏季团扇活动附加
   * 
   * @private
   * @param {Tools.usersData} usersData
   */
  private SummerActivityExtra(usersData: Tools.usersData) {
    Tools.XHR(`${this.rootUrl}/summer/dayRank?page=1&type=2`)
      .then((resolve) => {
        let dayRank = <dayRank>JSON.parse(resolve.toString())
        let link = dayRank.data.list[0].link
        let roomID = link.match(/\d+/)[0]
        return Tools.XHR(`${this.rootUrl}/live/getInfo?roomid=${roomID}`)
      })
      .then((resolve) => {
        let roomInfo = <roomInfo>JSON.parse(resolve.toString())
        for (let x in usersData) {
          Tools.XHR(`${this.rootUrl}/summer/getExtra?ruid=${roomInfo.data.MASTERID}`, usersData[x].cookie, 'POST')
        }
      })
  }
  /**
   * 发送活动心跳包
   * 
   * @private
   * @param {Tools.userData} userData
   */
  private SummerHeart(userData: Tools.userData) {
    Tools.XHR(`${this.rootUrl}/summer/heart`, userData.cookie, 'POST')
      .then((resolve) => {
        let summerHeart = <summerHeart>JSON.parse(resolve.toString())
        if (summerHeart.code === 0 && summerHeart.data.summerHeart) {
          setTimeout(() => {
            this.SummerHeart(userData)
          }, 3e5) // 5分钟
        }
      })
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
/**
 * 团扇活动排行榜
 * 
 * @interface RootObject
 */
interface dayRank {
  code: number
  msg: string
  data: dayRankData
}
interface dayRankData {
  uid: number
  page: number
  pageSize: number
  info: any[]
  list: dayRankDataList[]
}
interface dayRankDataList {
  uname: string
  face: string
  rank: number
  score: number
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
  UID: number;
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
  AREAID: number
  BACKGROUND_ID: number
  ROOMtITLE: string
  COVER: string
  LIVE_TIMELINE: number
  FANS_COUNT: number
  GIFT_TOP: roomInfoDataGIFT_TOP[]
  RCOST: number
  MEDAL: any[]
  IS_STAR: boolean
  starRank: number
  TITLE: any[]
  USER_LEVEL: any[]
  IS_RED_BAG: boolean
  IS_HAVE_VT: boolean
  ACTIVITY_ID: number
  ACTIVITY_PIC: number
  MI_ACTIVITY: number
}
interface roomInfoDataGIFT_TOP {
  uid: number
  uname: string
  coin: number
  isSelf: number
}
// gm mogrify -crop 80x31+20+6 -quality 100 getCaptcha.jpg
// gm mogrify -format pbm -quality 0 getCaptcha.jpg