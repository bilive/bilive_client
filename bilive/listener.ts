import request from 'request'
import { EventEmitter } from 'events'
import tools from './lib/tools'
import AppClient from './lib/app_client'
import DMclient from './dm_client_re'
import { liveOrigin, apiLiveOrigin, smallTVPathname, rafflePathname, _options } from './index'
/**
 * 监听服务器消息
 * 
 * @class Listener
 * @extends {EventEmitter}
 */
class Listener extends EventEmitter {
  constructor() {
    super()
  }
  /**
   * 用于接收弹幕消息
   * 
   * @private
   * @type {DMclient}
   * @memberof Listener
   */
  private _DMclient!: DMclient
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
    const config = _options.config
    const roomID = tools.getLongRoomID(config.defaultRoomID)
    const userID = config.defaultUserID
    this._DMclient = new DMclient({ roomID, userID })
    this._DMclient
      .on('SYS_MSG', dataJson => this._SYSMSGHandler(dataJson))
      .on('SYS_GIFT', dataJson => this._SYSGiftHandler(dataJson))
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
    if (dataJson.real_roomid === undefined || dataJson.tv_id === undefined) return
    const url = apiLiveOrigin + smallTVPathname
    const roomID = dataJson.real_roomid
    this._RaffleCheck(url, roomID, 'smallTV')
  }
  /**
   * 监听系统礼物消息
   * 
   * @private
   * @param {SYS_GIFT} dataJson
   * @memberof Listener
   */
  private _SYSGiftHandler(dataJson: SYS_GIFT) {
    if (dataJson.real_roomid === undefined || dataJson.giftId === undefined) return
    const url = apiLiveOrigin + rafflePathname
    const roomID = dataJson.real_roomid
    this._AppLightenCheck(roomID)
    this._RaffleCheck(url, roomID, 'raffle')
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
    const check: request.Options = {
      uri: `${url}/check?roomid=${roomID}`,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
    }
    const raffleCheck = await tools.XHR<raffleCheck>(check)
    if (raffleCheck !== undefined && raffleCheck.response.statusCode === 200
      && raffleCheck.body.code === 0 && raffleCheck.body.data.length > 0) {
      raffleCheck.body.data.forEach(data => {
        const message: raffleMSG = {
          cmd: raffle,
          roomID,
          id: +data.raffleId,
          time: +data.time
        }
        this._RaffleHandler(message)
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
    const room: request.Options = {
      uri: `${apiLiveOrigin}/AppRoom/index?${AppClient.signQueryBase(`room_id=${roomID}`)}`,
      json: true
    }
    const roomInfo = await tools.XHR<roomInfo>(room, 'Android')
    if (roomInfo !== undefined && roomInfo.response.statusCode === 200
      && roomInfo.body.code === 0 && roomInfo.body.data.event_corner.length > 0) {
      roomInfo.body.data.event_corner.forEach(event => {
        const type = event.event_type.split('-')
        if (type.length !== 2) return
        const message: appLightenMSG = {
          cmd: 'appLighten',
          roomID,
          id: +type[1],
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
    const roomID = raffleMSG.roomID
    const id = raffleMSG.id
    let msg = ''
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
    tools.Log(`房间 ${tools.getShortRoomID(roomID)} 开启了第 ${id} 轮${msg}抽奖`)
  }
}
export default Listener