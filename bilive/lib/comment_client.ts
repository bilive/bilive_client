import * as net from 'net'
import * as events from 'events'
import {Tools} from '../../lib/tools'
/**
 * 弹幕客户端, 用于连接弹幕服务器和发送弹幕事件
 * 
 * @class CommentClient
 * @extends {events.EventEmitter}
 */
export class CommentClient extends events.EventEmitter {
  /**
   * 弹幕客户端, 用于连接弹幕服务器和发送弹幕事件
   * 
   * @param {number} [userID]
   * @param {number} [roomID=23058]
   */
  constructor(userID?: number, roomID = 23058) {
    super()
    this.userID = userID
    this.roomID = roomID
  }
  private userID: number
  private roomID: number
  private server: string
  private port = 788
  private version = 1
  private socket: net.Socket
  private timer: NodeJS.Timer
  private reConnectTime = 0
  public connected = false
  /**
   * 连接服务器
   */
  public Connect() {
    Tools.XHR(`http://live.bilibili.com/api/player?id=cid:${this.roomID}&ts=${Date.now().toString(16)}`)
      .then((resolve: Buffer) => {
        this.server = resolve.toString().match(/<server>(.+)<\/server>/)[1]
        this.SockeConnect()
      })
      .catch((reject) => {
        this.server = 'livecmt-1.bilibili.com'
        this.SockeConnect()
      })
  }
  /**
   * 30分钟后重新连接
   * 
   * @private
   */
  private ReConnect() {
    this.emit('serverError', '重新连接服务器失败')
    clearTimeout(this.timer)
    this.connected = false
    this.SocketClose()
    this.timer = setTimeout(() => {
      this.Connect()
    }, 18e5) // 30分钟
  }
  /**
   * 发起连接
   * 
   * @private
   */
  private SockeConnect() {
    this.socket = new net.Socket()
    this.socket
      .on('connect', this.SockeConnectHandler.bind(this))
      .on('data', this.ReadSocketData.bind(this))
      .on('error', this.SocketErrorHandler.bind(this))
    this.socket.connect(this.port, this.server)
  }
  /**
   * 关闭连接
   */
  public SocketClose() {
    clearTimeout(this.timer)
    if (this.socket == null) return
    this.socket.end()
    this.socket
      .removeListener('connect', this.SockeConnectHandler.bind(this))
      .removeListener('data', this.ReadSocketData.bind(this))
      .removeListener('error', this.SocketErrorHandler.bind(this))
    this.socket = null
    this.connected = false
  }
  /**
   * 重新连接
   * 
   * @private
   */
  private SocketReConnect() {
    clearTimeout(this.timer)
    this.connected = false
    this.SocketClose()
    this.timer = setTimeout(() => {
      if (this.reConnectTime >= 10) {
        this.reConnectTime = 0
        this.ReConnect()
      }
      else {
        this.reConnectTime++
        this.SockeConnect()
      }
    }, 3e4) // 30秒
  }
  /**
   * 监听连接事件
   * 
   * @private
   */
  private SockeConnectHandler() {
    let roomid = this.roomID
    let uid = this.userID || 100000000000000 + parseInt((200000000000000 * Math.random()).toFixed(0))
    let data = JSON.stringify({ roomid, uid })
    this.SocketSendData(16 + data.length, 16, this.version, 7, 1, data)
    this.SocketTimer()
    this.connected = true
  }
  /**
   * 向服务器发送数据
   * 
   * @private
   * @param {number} totalLen 总长度
   * @param {number} headLen 头部长度
   * @param {number} version 版本
   * @param {number} param4
   * @param {number} [param5]
   * @param {string} [data] 数据
   * @returns {boolean} 是否发送成功
   */
  private SocketSendData(totalLen: number, headLen: number, version: number, param4: number, param5 = 1, data?: string): boolean {
    var bufferData = new Buffer(totalLen)
    bufferData.writeUInt32BE(totalLen, 0)
    bufferData.writeUInt16BE(headLen, 4)
    bufferData.writeUInt16BE(version, 6)
    bufferData.writeUInt32BE(param4, 8)
    bufferData.writeUInt32BE(param5, 12)
    if (data) bufferData.write(data, headLen)
    return this.socket.write(bufferData)
  }
  /**
   * 监听服务器断开事件
   * 
   * @private
   * @param {any} err
   */
  private SocketErrorHandler(err) {
    this.emit('socketError', err)
    this.SocketReConnect()
  }
  /**
   * 心跳包
   * 
   * @private
   */
  private SocketTimer() {
    if (this.SocketSendData(16, 16, 1, 2)) {
      this.timer = setTimeout(() => {
        this.SocketTimer()
      }, 3e4) //30秒
    }
    else {
      this.emit('socketHeartError', '心跳失败')
      this.SocketReConnect()
    }
  }
  /**
   * 监听数据传输
   * 
   * @private
   * @param {Buffer} data
   */
  private ReadSocketData(data: Buffer) {
    if (data.length < 16) return
    let packageLen = data.readUInt32BE(0)
    if (data.length < packageLen) return
    let headLen = data.readUInt16BE(4)
    if (packageLen < headLen) return
    switch (data.readUInt32BE(8)) {
      case 3:
        this.emit('commentInLine', data.readUInt32BE(headLen))
        break
      case 5:
        try {
          let jsonData = JSON.parse(data.toString('utf8', headLen, packageLen))
          this.ParseSocketData(jsonData)
        }
        catch (err) {
          this.emit('commentError', '意外的弹幕信息')
        }
        break
      case 17:
        this.emit('serverUpdate', '服务器升级中')
        this.ReConnect()
        break
      default:
        break
    }
  }
  /**
   * 解析消息
   * 
   * @private
   * @param {JSON} jsonData
   */
  private ParseSocketData(jsonData: JSON) {
    switch (jsonData['cmd']) {
      case 'DANMU_MSG':
        // 房间弹幕消息
        // {
        //   info:
        //   [[0, 1, 25, 16738408, 1465212627, '1465209716', 0, '97c1ce5c', 0],
        //     'string', // 消息内容
        //     [number, 'string', 0, 1, 1, 10000], // uid, 用户名, 月费老爷, 年费老爷
        //     [12, '谜酥', '谜之声', 117, 9982427], // 徽章等级, 徽章名, 勋章主播, 直播间
        //     [34, 2315, 16745696], // 用户等级, 等级排名
        //     ['sweet']], // 头衔
        //   cmd: 'DANMU_MSG'
        // }
        this.emit('DANMU_MSG', jsonData)
        break
      case 'SEND_GIFT':
        // 房间礼物消息
        // {
        //   cmd: 'SEND_GIFT',
        //   data: {
        //     giftName: '辣条',
        //     num: 1,
        //     uname: 'string',
        //     rcost: 6020004, // 房间收礼数
        //     uid: number,
        //     top_list: [],
        //     timestamp: 1465213258,
        //     giftId: 1,
        //     giftType: 0,
        //     action: '喂食',
        //     super: 0,
        //     price: 100,
        //     rnd: '1465210863',
        //     newMedal: 0,
        //     medal: 1,
        //     capsule: []
        //   },
        //   roomid: 5082
        // }
        this.emit('SEND_GIFT', jsonData)
        break
      case 'WELCOME':
        // 房间欢迎消息
        // {
        //   cmd: 'WELCOME',
        //   data: {
        //     isadmin: 0,
        //     s?vip: 1,
        //     uid: number,
        //     uname: 'string'
        //   },
        //   roomid: 5082
        // }
        this.emit('WELCOME', jsonData)
        break
      case 'ROOM_BLOCK_MSG':
        // 房间封禁消息
        // {
        //   cmd: 'ROOM_BLOCK_MSG',
        //   uid: 'number',
        //   uname: 'string',
        //   roomid: 5082
        // }
        this.emit('ROOM_BLOCK_MSG', jsonData)
        break
      case 'ROOM_SILENT_ON':
        // 房间开启禁言消息
        // {
        //   cmd: 'ROOM_SILENT_ON',
        //   countdown: 600,
        //   type: -1, // -1为全局, 其他为等级
        //   roomid: 5082
        // }
        this.emit('ROOM_BLOCK_MSG', jsonData)
        break
      case 'ADD_RED_BAG':
        // 房间红包消息, 目前只在王尼玛看过
        // {
        //   cmd: 'ADD_RED_BAG',
        //   data: {
        //     id: 'number',
        //     type: '1',
        //     pwd: 'string',
        //     countdown: 23
        //   }
        // }
        this.emit('ADD_RED_BAG', jsonData)
        break
      case 'SYS_GIFT':
        // 系统礼物消息
        // {
        //   cmd: 'SYS_GIFT',
        //   msg: '', // 消息内容
        //   tips: '', // 聊天窗口tip
        //   rep: 1, // rep 1时是夏季活动消息
        //   msgTips: 1,
        //   url: '', // 点击跳转的地址
        //   roomid: number,
        //   rnd: 'number'
        // }
        this.emit('SYS_GIFT', jsonData)
        break
      case 'SYS_MSG':
        // 系统消息
        // {
        //   cmd: 'SYS_MSG',
        //   msg: '', // 消息内容
        //   rep: 1,
        //   styleType: 1 | 2, // 2为小电视通知
        //   url: '' // 点击跳转的地址
        // }
        this.emit('SYS_MSG', jsonData)
        break
      default:
        // 其他消息
        this.emit('OTHER', jsonData)
        break
    }
  }
}