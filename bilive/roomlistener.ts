import request from 'request'
import { EventEmitter } from 'events'
import tools from './lib/tools'
import DMclient from './dm_client_re'
import { liveOrigin, apiLiveOrigin, lotteryPathname, _options } from './index'
/**
 * 监听服务器消息
 *
 * @class RoomListener
 * @extends {EventEmitter}
 */
class RoomListener extends EventEmitter {
  constructor() {
    super()
  }
  /**
   * 用于接收弹幕消息
   *
   * @private
   * @type {DMclient}
   * @memberof RoomListener
   */
  private _DMclient!: DMclient
  /**
   * 抽奖ID
   *
   * @private
   * @type {number}
   * @memberof RoomListener
   */
  private _raffleID: number = 0
  /**
   * 开始监听
   *
   * @memberof RoomListener
   */
  public Start() {
    const config = _options.config
    const roomID = tools.getLongRoomID(config.defaultRoomID)
    const userID = config.defaultUserID
    this._DMclient = new DMclient({ roomID, userID })
    this._DMclient
      .on('LOTTERY_START', dataJson => this._LotteryHandler(dataJson))
      .on('SPECIAL_GIFT', dataJson => this._BeatStormHandler(dataJson))
      .Connect()
  }
  /**
   * 监听房间lottery
   *
   * @private
   * @param {LOTTERY_START} dataJson
   * @memberof RoomListener
   */
  private _LotteryHandler(dataJson: LOTTERY_START) {
    if (dataJson === undefined || dataJson.id === undefined) return
    const url = apiLiveOrigin + lotteryPathname
    const roomID = dataJson.roomid
    this._LotteryCheck(url, roomID)
  }
  /**
   * 监听房间
   *
   * @private
   * @param {SPECIAL_GIFT} dataJson
   * @memberof RoomListener
   */
  private _BeatStormHandler(dataJson: SPECIAL_GIFT) {
    let beatStormData = dataJson.data['39']
    if (beatStormData === undefined) return
    let message: beatStormMSG = {
        cmd: 'beatStorm',
        roomID: dataJson._roomid,
        id: beatStormData.id,
      }
    this._MSGHandler(message)
  }
  /**
   * 检查房间lottery信息
   *
   * @private
   * @param {string} url
   * @param {number} roomID
   * @memberof RoomListener
   */
  private async _LotteryCheck(url: string, roomID: number) {
    const check: request.Options = {
      uri: `${url}/check?roomid=${roomID}`,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
    }
    const lotteryCheck = await tools.XHR<lotteryCheck>(check)
    if (lotteryCheck !== undefined && lotteryCheck.response.statusCode === 200
      && lotteryCheck.body.code === 0 && lotteryCheck.body.data.length > 0) {
        const message: lotteryMSG = {
          cmd: 'lottery',
          roomID,
          id: lotteryCheck.body.data[0].id,//缺乏资料，暂时不写lottery路径
        }
        this._MSGHandler(message)
    }
  }
  /**
   * 消息提交
   *
   * @private
   * @param {(lotteryMSG | beatStormMSG)} raffleMSG
   * @memberof RoomListener
   */
  private _MSGHandler(roomMSG: lotteryMSG | beatStormMSG) {
    const roomID = roomMSG.roomID
    const id = roomMSG.id
    let msg = ''
    switch (roomMSG.cmd) {
      case 'lottery':
        if (this._raffleID >= id) return
        this._raffleID = id
        msg = 'lottery抽奖'
        break
      case 'beatStorm':
        if (this._raffleID >= id) return
        this._raffleID = id
        msg = '节奏风暴'
        break
      default:
        return
    }
    this.emit('room', roomMSG)
    tools.Log(`房间 ${tools.getShortRoomID(roomID)} 开启了第 ${id} 轮${msg}`)
  }
}
export default RoomListener
