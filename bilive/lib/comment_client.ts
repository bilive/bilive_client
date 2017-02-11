import { Socket } from 'net'
import { EventEmitter } from 'events'
import * as tools from './tools'
import { rootOrigin } from '../index'
/**
 * 弹幕客户端, 用于连接弹幕服务器和发送弹幕事件
 * 
 * @export
 * @class CommentClient
 * @extends {EventEmitter}
 */
export class CommentClient extends EventEmitter {
  /**
   * 创建一个 CommentClient 实例
   * 
   * @param {number} [roomID=23058] 哔哩哔哩音乐台
   * @param {number} [userID]
   * @memberOf CommentClient
   */
  constructor(roomID: number = 23058, userID?: number | null) {
    super()
    this.roomID = roomID
    if (userID != null) this.userID = userID
  }
  /**
   * 用户UID
   * 
   * @type {number}
   * @memberOf CommentClient
   */
  public userID: number
  /**
   * 房间号, 注意不要短号
   * 
   * @type {number}
   * @memberOf CommentClient
   */
  public roomID: number
  /**
   * 弹幕服务器
   * 
   * @private
   * @type {string}
   * @memberOf CommentClient
   */
  private _server: string
  /**
   * 服务器端口, 目前为788
   * 
   * @type {number}
   * @memberOf CommentClient
   */
  public port: number = 788
  /**
   * 客户端版本, 目前为1
   * 
   * @type {number}
   * @memberOf CommentClient
   */
  public version: number = 1
  /**
   * 重连次数, 以五次为阈值
   * 
   * @type {number}
   * @memberOf CommentClient
   */
  public reConnectTime: number = 0
  /**
   * 是否已经连接到服务器
   * 
   * @private
   * @type {boolean}
   * @memberOf CommentClient
   */
  private _connected: boolean = false
  /**
   * 模仿客户端与服务器进行通讯
   * 
   * @private
   * @type {Socket}
   * @memberOf CommentClient
   */
  private _Client: Socket
  /**
   * 全局计时器, 确保只有一个定时任务
   * 
   * @private
   * @type {NodeJS.Timer}
   * @memberOf CommentClient
   */
  private _Timer: NodeJS.Timer
  /**
   * 当前连接的弹幕服务器
   * 
   * @readonly
   * @type {string}
   * @memberOf CommentClient
   */
  public get server(): string {
    return this._server
  }
  /**
   * 是否已经连接到服务器
   * 
   * @readonly
   * @type {boolean}
   * @memberOf CommentClient
   */
  public get connected(): boolean {
    return this._connected
  }
  /**
   * 连接到指定服务器
   * 
   * @param {string} [server] 为了快速连接
   * @memberOf CommentClient
   */
  public Connect(server?: string) {
    if (this._connected) return
    clearTimeout(this._Timer)
    if (server == null) {
      // 动态获取服务器地址, 防止B站临时更换
      let options = { uri: `${rootOrigin}/api/player?id=cid:${this.roomID}&ts=${Date.now().toString(16)}` }
      tools.XHR<string>(options)
        .then((resolve) => {
          let server = resolve.match(/<server>(.+)<\/server>/)
          this._server = server == null ? 'livecmt-2.bilibili.com' : server[1]
          this._ClientConnect()
        })
        .catch(() => {
          this._server = 'livecmt-2.bilibili.com'
          this._ClientConnect()
        })
    }
    else {
      this._server = server
      this._ClientConnect()
    }
  }
  /**
   * 断开与服务器的连接
   * 
   * @memberOf CommentClient
   */
  public Close() {
    clearTimeout(this._Timer)
    if (!this._connected) return
    this._Client.end()
    this._Client.destroy()
    this._Client.removeAllListeners()
    this._connected = false
  }
  /**
   * 重新连接到服务器
   * 
   * @param {string} [server]
   * @memberOf CommentClient
   */
  public ReConnect(server?: string) {
    this.Close()
    this.Connect(server)
  }
  /**
   * 5分钟后重新连接
   * 
   * @private
   * @memberOf CommentClient
   */
  private _DelayReConnect() {
    this.emit('serverError', '尝试重新连接服务器失败')
    this.Close()
    this._Timer = setTimeout(() => {
      this.Connect()
    }, 3e5) // 5分钟
  }
  /**
   * 客户端连接
   * 
   * @private
   * @memberOf CommentClient
   */
  private _ClientConnect() {
    this._Client = new Socket()
    this._Client
      .on('error', this._ClientErrorHandler.bind(this))
      .on('connect', this._ClientConnectHandler.bind(this))
      .on('data', this._ClientDataHandler.bind(this))
      .on('end', this._ClientEndHandler.bind(this))
      .connect(this.port, this._server)
  }
  /**
   * 客户端连接重试
   * 
   * @private
   * @memberOf CommentClient
   */
  private _ClientReConnect() {
    this.Close()
    this._Timer = setTimeout(() => {
      if (this.reConnectTime >= 5) {
        this.reConnectTime = 0
        this._DelayReConnect()
      }
      else {
        this.reConnectTime++
        this._ClientConnect()
      }
    }, 3e3) // 3秒
  }
  /**
   * 客户端错误重连
   * 
   * @private
   * @param {Error} error
   * @memberOf CommentClient
   */
  private _ClientErrorHandler(error: Error) {
    this.emit('clientError', error)
    this._ClientReConnect()
  }
  /**
   * 服务器断开重连
   * 
   * @private
   * @memberOf CommentClient
   */
  private _ClientEndHandler() {
    this.emit('clientEnd', '服务器主动断开')
    this._ClientReConnect()
  }
  /**
   * 向服务器发送自定义握手数据
   * 
   * @private
   * @memberOf CommentClient
   */
  private _ClientConnectHandler() {
    this._connected = true
    let roomid = this.roomID
    let uid = this.userID || 100000000000000 + parseInt((200000000000000 * Math.random()).toFixed(0))
    let data = JSON.stringify({ uid, roomid })
    this._ClientSendData(16 + data.length, 16, this.version, 7, 1, data)
    this._ClientTimer()
  }
  /**
   * 心跳包
   * 
   * @private
   * @memberOf CommentClient
   */
  private _ClientTimer() {
    if (!this._connected) return
    if (this._ClientSendData(16, 16, 1, 2)) {
      this._Timer = setTimeout(() => {
        this._ClientTimer()
      }, 3e4) // 30秒
    }
    else {
      this.emit('clientHeartError', '心跳失败')
      this._ClientReConnect()
    }
  }
  /**
   * 向服务器发送数据
   * 
   * @private
   * @param {number} totalLen 总长度
   * @param {number} headLen 头部长度
   * @param {number} version 版本
   * @param {number} param4
   * @param {number} [param5=1]
   * @param {string} [data] 数据
   * @returns {boolean} 是否发送成功
   * @memberOf CommentClient
   */
  private _ClientSendData(totalLen: number, headLen: number, version: number, param4: number, param5 = 1, data?: string): boolean {
    var bufferData = new Buffer(totalLen)
    bufferData.writeUInt32BE(totalLen, 0)
    bufferData.writeUInt16BE(headLen, 4)
    bufferData.writeUInt16BE(version, 6)
    bufferData.writeUInt32BE(param4, 8)
    bufferData.writeUInt32BE(param5, 12)
    if (data) bufferData.write(data, headLen)
    return this._Client.write(bufferData)
  }
  /**
   * 解析从服务器接收的数据
   * 
   * @private
   * @param {Buffer} data
   * @memberOf CommentClient
   */
  private _ClientDataHandler(data: Buffer) {
    let dataLen = data.length
    if (dataLen < 16 || dataLen > 1048576) return
    let packageIndex = 0
    let packageLen = data.readUInt32BE(0)
    while (dataLen - packageIndex >= packageLen) {
      switch (data.readUInt32BE(packageIndex + 8)) {
        case 1:
        case 2:
        case 3:
          this.emit('commentInLine', data.readUInt32BE(packageIndex + 16))
          break
        case 4:
        case 5:
          try {
            let dataJson: danmuJson = JSON.parse(data.toString('utf8', packageIndex + 16, packageIndex + packageLen))
            this._ParseClientData(dataJson)
          }
          catch (error) {
            this.emit('commentError', '意外的弹幕信息')
          }
          break
        case 8:
          this.emit('serverSuccess', '服务器连接成功')
          break
        case 17:
          this.emit('serverUpdate', '服务器升级中')
          this._DelayReConnect()
          break
        default:
          break
      }
      packageIndex += packageLen
      packageLen = (dataLen - packageIndex >= 16) ? data.readUInt32BE(packageIndex) : 1048576
      if (packageLen < 16) packageLen = 1048576
    }
  }
  /**
   * 解析消息
   * 
   * @private
   * @param {danmuJson} dataJson
   * @memberOf CommentClient
   */
  private _ParseClientData(dataJson: danmuJson) {
    dataJson._roomid = this.roomID
    switch (dataJson.cmd) {
      case 'DANMU_MSG':
        this.emit('DANMU_MSG', dataJson)
        break
      case 'SEND_GIFT':
        this.emit('SEND_GIFT', dataJson)
        break
      case 'WELCOME':
        this.emit('WELCOME', dataJson)
        break
      case 'WELCOME_GUARD':
        this.emit('WELCOME_GUARD', dataJson)
        break
      case 'SYS_MSG':
        this.emit('SYS_MSG', dataJson)
        break
      case 'SYS_GIFT':
        this.emit('SYS_GIFT', dataJson)
        break
      case 'SPECIAL_GIFT':
        this.emit('SPECIAL_GIFT', dataJson)
        break
      case 'ROOM_BLOCK_MSG':
        this.emit('ROOM_BLOCK_MSG', dataJson)
        break
      case 'ROOM_SILENT_ON':
        this.emit('ROOM_SILENT_ON', dataJson)
        break
      case 'ROOM_SILENT_OFF':
        this.emit('ROOM_SILENT_OFF', dataJson)
        break
      case 'PREPARING':
        this.emit('PREPARING', dataJson)
        break
      case 'LIVE':
        this.emit('LIVE', dataJson)
        break
      case 'MOBILE_LIVE':
        this.emit('MOBILE_LIVE', dataJson)
        break
      case 'CUT_OFF':
        this.emit('CUT_OFF', dataJson)
        break
      case 'TV_START':
        this.emit('TV_START', dataJson)
        break
      case 'TV_END':
        this.emit('TV_END', dataJson)
        break
      case 'RAFFLE_START':
        this.emit('RAFFLE_START', dataJson)
        break
      case 'RAFFLE_END':
        this.emit('RAFFLE_END', dataJson)
        break
      case 'ROOM_ADMINS':
        this.emit('ROOM_ADMINS', dataJson)
        break
      default:
        this.emit('OTHER', dataJson)
        break
    }
  }
}
/**
 * 弹幕基本格式
 * 
 * @export
 * @interface danmuJson
 */
export interface danmuJson {
  cmd: string
  roomid: number
  _roomid: number
}
/**
 * 弹幕消息
 * 
 * @export
 * @interface DANMU_MSG
 * @extends {danmuJson}
 */
export interface DANMU_MSG extends danmuJson {
  info:
  [
    [
      number,
      number, // 模式
      number, // 字号
      number, // 颜色
      number, // 发送时间
      number | string,// rnd
      number,
      string,
      number
    ],
    string, // 弹幕
    [
      number, // 用户uid
      string, // 用户名
      number, // 月费老爷
      number, // 年费老爷
      number,
      number
    ],
    [
      number, // 徽章等级
      string, // 勋章名
      string, // 主播名
      number, // 直播间
      number
    ],
    [
      number, // 用户等级
      number, // 等级排名
      number,
      number | string// 等级排名
    ],
    [
      string // 头衔
    ]
  ]
}
/**
 * 礼物消息
 * 
 * @export
 * @interface SEND_GIFT
 * @extends {danmuJson}
 */
export interface SEND_GIFT extends danmuJson {
  data:
  {
    giftName: string // 道具文案
    num: number // 数量
    uname: string // 用户名
    rcost: number
    uid: number // 用户uid
    top_list: SEND_GIFT_top_list[], // 更新排行榜
    timestamp: number
    giftId: number // 礼物id
    giftType: number // 礼物类型(活动)
    action: string // 喂食|赠送
    super: number // 连击
    price: number // 价值
    rnd: number
    newMedal: number // 是否获取到新徽章
    newTitle?: number // 是否获取到新头衔
    medal: number | SEND_GIFT_medal // 新徽章
    title?: string // 新头衔
    newMedalName?: string // 新徽章名
    capsule?: any[]
    specialGift?: SPECIAL_GIFT_Data | boolean // 特殊礼物
  }
}
export interface SEND_GIFT_top_list {
  uid: number // 用户uid
  uname: string // 用户名
  coin: number // 投喂总数
}
export interface SEND_GIFT_medal {
  medalId: number // 徽章id
  medalName: string // 徽章名
  level: number // 徽章等级
}
/**
 * 欢迎消息
 * 
 * @export
 * @interface WELCOME
 * @extends {danmuJson}
 */
export interface WELCOME extends danmuJson {
  data: WELCOME_Data
}
export interface WELCOME_Data {
  uid: number // 用户uid
  uname: string // 用户名
  isadmin: number // 管理员
  vip?: number // 月费老爷
  svip?: number // 年费老爷
}
/**
 * 欢迎消息-舰队
 * 
 * @export
 * @interface WELCOME_GUARD
 * @extends {danmuJson}
 */
export interface WELCOME_GUARD extends danmuJson {
  data: WELCOME_GUARD_Data
}
export interface WELCOME_GUARD_Data {
  uid: number // 用户uid
  uname: string // 用户名
  guard_level: number // 舰队等级
}
/**
 * 系统消息
 * 
 * @export
 * @interface SYS_MSG
 * @extends {danmuJson}
 */
export interface SYS_MSG extends danmuJson {
  msg: string // 消息内容
  rep: number
  styleType?: number // 2为小电视通知
  url: string // 点击跳转的地址
  real_roomid?: number // 原始房间号
  rnd?: number
  tv_id?: string // 小电视编号
}
/**
 * 系统礼物消息
 * 
 * @export
 * @interface SYS_GIFT
 * @extends {danmuJson}
 */
export interface SYS_GIFT extends danmuJson {
  msg: string // 消息内容
  tips: string // 聊天窗口tip
  rep: number // 1为活动消息
  msgTips: number
  url: string // 点击跳转的地址
  rnd: number
}
/**
 * 特殊礼物消息
 * 
 * @export
 * @interface SPECIAL_GIFT
 * @extends {danmuJson}
 */
export interface SPECIAL_GIFT extends danmuJson {
  data: SPECIAL_GIFT_Data
}
export interface SPECIAL_GIFT_Data {
  '39': SPECIAL_GIFT_Data_BeatStorm // 节奏风暴
}
export interface SPECIAL_GIFT_Data_BeatStorm {
  id: string // 参与id
  num: number // 节奏数量
  time: number // 节奏持续时间
  content: string // 节奏内容
  hadJoin: number // 是否已经参与
  action: string // start|end
}
export interface SPECIAL_GIFT_Data_BeatStorm {
  action: string // start|end
}
/**
 * 房间封禁消息
 * 
 * @export
 * @interface ROOM_BLOCK_MSG
 * @extends {danmuJson}
 */
export interface ROOM_BLOCK_MSG extends danmuJson {
  uid: number // 用户uid
  uname: string // 用户名
}
/**
 * 房间开启禁言
 * 
 * @export
 * @interface ROOM_SILENT_ON
 * @extends {danmuJson}
 */
export interface ROOM_SILENT_ON extends danmuJson {
  countdown: number // 禁言时间
  type: number // -1为全局, 其他为等级
}
/**
 * 房间禁言结束
 * 
 * @export
 * @interface ROOM_SILENT_OFF
 * @extends {danmuJson}
 */
export interface ROOM_SILENT_OFF extends danmuJson { }
/**
 * 准备直播
 * 
 * @export
 * @interface PREPARING
 * @extends {danmuJson}
 */
export interface PREPARING extends danmuJson {
  round?: number
}
/**
 * 开始直播
 * 
 * @export
 * @interface LIVE
 * @extends {danmuJson}
 */
export interface LIVE extends danmuJson { }
/**
 * 开始手机直播
 * 
 * @export
 * @interface MOBILE_LIVE
 * @extends {danmuJson}
 */
export interface MOBILE_LIVE extends danmuJson {
  type: number
}
/**
 * 直播强制切断
 * 
 * @export
 * @interface CUT_OFF
 * @extends {danmuJson}
 */
export interface CUT_OFF extends danmuJson {
  msg: string // 切断原因
}
/**
 * 小电视抽奖开始
 * 
 * @export
 * @interface TV_START
 * @extends {danmuJson}
 */
export interface TV_START extends danmuJson {
  data: TV_START_Data
}
export interface TV_START_Data extends danmuJson {
  id: number // 小电视编号
  dtime: number // 持续时间
  msg: SYS_MSG
}
/**
 * 小电视抽奖结束
 * 
 * @export
 * @interface TV_END
 * @extends {danmuJson}
 */
export interface TV_END extends danmuJson {
  data: TV_END_Data
}
export interface TV_END_Data extends danmuJson {
  id: number // 小电视编号
  uname: string // 中奖者
  sname: string // 赠送者
  giftName: string // 10W瓜子|抱枕
}
/**
 * 抽奖开始
 * 
 * @export
 * @interface RAFFLE_START
 * @extends {danmuJson}
 */
export interface RAFFLE_START extends danmuJson {
  data: RAFFLE_START_Data
}
export interface RAFFLE_START_Data extends danmuJson {
  raffleId: number // 编号
  lotteryType: string // 文案
  time: number // 持续时间
}
/**
 * 抽奖结束
 * 
 * @export
 * @interface RAFFLE_END
 * @extends {danmuJson}
 */
export interface RAFFLE_END extends danmuJson {
  data: RAFFLE_END_Data
}
export interface RAFFLE_END_Data extends danmuJson {
  raffleId: number // 编号
  lotteryType: string // 文案
}
/**
 * 管理员变更
 * 
 * @export
 * @interface ROOM_ADMINS
 * @extends {danmuJson}
 */
export interface ROOM_ADMINS extends danmuJson {
  uids: number[] // 管理员列表
}