import * as request from 'request'
import * as tools from './lib/tools'
import { EventEmitter } from 'events'
import { AppClient } from './lib/app_client'
import { CommentClient } from './lib/comment_client'
import { liveOrigin, apiLiveOrigin, smallTVPathname, rafflePathname, _options } from './index'
/**
 * 监听服务器消息
 * 
 * @export
 * @class Listener
 * @extends {EventEmitter}
 */
export class Listener extends EventEmitter {
  constructor() {
    super()
  }
  /**
   * 用于接收弹幕消息
   * 
   * @private
   * @type {CommentClient}
   * @memberof Listener
   */
  private _CommentClient: CommentClient
  /**
   * 小电视ID
   * 
   * @private
   * @type {number}
   * @memberof Listener
   */
  private _smallTVID: number = 0
  /**
   * 抽奖ID
   * 
   * @private
   * @type {number}
   * @memberof Listener
   */
  private _raffleID: number = 0
  /**
   * 快速抽奖ID
   * 
   * @private
   * @type {number}
   * @memberof Listener
   */
  private _lightenID: number = 0
  /**
   * app快速抽奖ID
   * 
   * @private
   * @type {number}
   * @memberof Listener
   */
  private _appLightenID: number = 0
  /**
   * 开始监听
   * 
   * @memberof Listener
   */
  public Start() {
    let config = _options.config
      , roomID = config.defaultRoomID
      , userID = config.defaultUserID
    this._CommentClient = new CommentClient({ roomID, userID })
    this._CommentClient
      .on('serverError', (error) => { tools.Log('与弹幕服务器断开五分钟', error) })
      .on('SYS_MSG', this._SYSMSGHandler.bind(this))
      .on('SYS_GIFT', this._SYSGiftHandler.bind(this))
      .Connect()
  }
  /**
   * 监听弹幕系统消息
   * 
   * @private
   * @param {SYS_MSG} dataJson
   * @memberof Listener
   */
  private _SYSMSGHandler(dataJson: SYS_MSG) {
    if (dataJson.real_roomid == null || dataJson.tv_id == null) return
    let url = apiLiveOrigin + smallTVPathname
      , roomID = dataJson.real_roomid
    this._RaffleCheck(url, roomID, 'smallTV')
  }
  /**
   * 监听系统礼物消息
   * 
   * @private
   * @param {SYS_GIFT} dataJson
   * @memberof Listener
   */
  private async _SYSGiftHandler(dataJson: SYS_GIFT) {
    if (dataJson.real_roomid == null || dataJson.giftId == null) return
    let url = apiLiveOrigin + rafflePathname
      , roomID = dataJson.real_roomid
    this._RaffleCheck(url, roomID, 'raffle')
    // this._AppLightenCheck(roomID)
  }
  /**
   * 检查房间抽奖信息
   * 
   * @private
   * @param {string} url 
   * @param {number} roomID 
   * @param {('smallTV' | 'raffle' | 'lighten')} raffle 
   * @memberof Listener
   */
  private async _RaffleCheck(url: string, roomID: number, raffle: 'smallTV' | 'raffle' | 'lighten') {
    let check: request.Options = {
      uri: `${url}/check?roomid=${roomID}`,
      json: true,
      headers: {
        'Referer': `${liveOrigin}/${roomID}`
      }
    }
      , raffleCheck = await tools.XHR<raffleCheck>(check)
    if (raffleCheck.response.statusCode === 200 && raffleCheck.body.code === 0 && raffleCheck.body.data.length > 0) {
      raffleCheck.body.data.forEach(data => {
        let message: raffleMSG = {
          cmd: raffle,
          roomID,
          id: data.raffleId
        }
        this._RaffleHandler(message)
        // 临时
        if (raffle === 'raffle') {
          let message: appLightenMSG = {
            cmd: 'appLighten',
            roomID,
            id: data.raffleId,
            type: 'openfire'
          }
          this._RaffleHandler(message)
        }
      })
    }
  }
  /**
   * 检查客户端房间信息
   * 
   * @private
   * @param {number} roomID 
   * @memberof Listener
   */
  private async _AppLightenCheck(roomID: number) {
    let room: request.Options = {
      uri: `${apiLiveOrigin}/AppRoom/index?${AppClient.ParamsSign(`room_id=${roomID}&${AppClient.baseQuery}`)}`,
      json: true
    }
      , roomInfo = await tools.XHR<roomInfo>(room, 'Android')
    if (roomInfo.response.statusCode === 200 && roomInfo.body.code === 0 && roomInfo.body.data.event_corner.length > 0) {
      roomInfo.body.data.event_corner.forEach(event => {
        let type = event.event_type.split('-')
        if (type.length !== 2) return
        let message: appLightenMSG = {
          cmd: 'appLighten',
          roomID,
          id: parseInt(type[1]),
          type: type[0]
        }
        this._RaffleHandler(message)
      })
    }
  }
  /**
   * 监听抽奖消息
   * 
   * @private
   * @param {(raffleMSG | appLightenMSG)} raffleMSG 
   * @memberof Listener
   */
  private _RaffleHandler(raffleMSG: raffleMSG | appLightenMSG) {
    let roomID = raffleMSG.roomID
      , id = raffleMSG.id
      , msg = ''
    switch (raffleMSG.cmd) {
      case 'smallTV':
        if (this._smallTVID >= id) return
        this._smallTVID = id
        msg = '小电视'
        break
      case 'raffle':
        if (this._raffleID >= id) return
        this._raffleID = id
        break
      case 'lighten':
        if (this._lightenID >= id) return
        this._lightenID = id
        break
      case 'appLighten':
        if (this._appLightenID >= id) return
        this._appLightenID = id
        msg = '客户端'
        break
      default:
        return
    }
    this.emit('raffle', raffleMSG)
    tools.Log(`房间 ${roomID} 开启了第 ${id} 轮${msg}抽奖`)
  }
}