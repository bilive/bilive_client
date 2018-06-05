import request from 'request'
import { EventEmitter } from 'events'
import tools from './lib/tools'
import AppClient from './lib/app_client'
import DMclient from './dm_client_re'
import { apiLiveOrigin, smallTVPathname, rafflePathname, _options } from './index'
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
   * @type {Map<number, DMclient>}
   * @memberof Listener
   */
  private _DMclient: Map<number, DMclient> = new Map()
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
  private _lotteryID: number = 0
  /**
   * 开始监听
   * 
   * @memberof Listener
   */
  public Start() {
    this._addAreaRoom()
  }
  /**
   * 添加分区房间
   * 
   * @private
   * @memberof Listener
   */
  private async _addAreaRoom() {
    const userID = _options.config.defaultUserID
    // 获取直播列表
    const getAllList = await tools.XHR<getAllList>({
      uri: `${apiLiveOrigin}/room/v2/AppIndex/getAllList?${AppClient.baseQuery}`,
      json: true
    }, 'Android')
    if (getAllList !== undefined && getAllList.response.statusCode === 200 && getAllList.body.code === 0) {
      const moduleList = getAllList.body.data.module_list
      moduleList.forEach(modules => {
        if (modules.module_info.type === 9 && modules.list.length > 0) {
          const areaID = modules.module_info.id
          const areaTitle = modules.module_info.title
          const roomID = (<getAllListDataRoomList>modules.list[0]).roomid
          const areaDM = <DMclient>this._DMclient.get(areaID)
          if (areaDM === undefined || areaDM.roomID !== roomID) {
            if (areaDM !== undefined) {
              const areaRoomID = areaDM.roomID
              areaDM
                .removeAllListeners()
                .Close()
              this._DMclient.delete(areaID)
              tools.Log(`已移除${areaTitle}分区房间`, areaRoomID)
            }
            const newDMclient = new DMclient({ roomID, userID })
            newDMclient
              .on('SYS_MSG', dataJson => this._SYSMSGHandler(dataJson))
              .on('SYS_GIFT', dataJson => this._SYSGiftHandler(dataJson))
              .Connect()
            this._DMclient.set(areaID, newDMclient)
            tools.Log(`已监听${areaTitle}分区房间`, roomID)
          }
        }
      })
      await tools.Sleep(10 * 60 * 1000)
      this._addAreaRoom()
    }
    else {
      await tools.Sleep(3 * 1000)
      this._addAreaRoom()
    }
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
    this._RaffleCheck(url, roomID, 'raffle')
  }
  /**
   * 检查房间抽奖raffle信息
   * 
   * @private
   * @param {string} url 
   * @param {number} roomID 
   * @param {('smallTV' | 'raffle')} raffle 
   * @memberof Listener
   */
  private async _RaffleCheck(url: string, roomID: number, raffle: 'smallTV' | 'raffle') {
    const check: request.Options = {
      uri: `${url}/check?${AppClient.signQueryBase(`roomid=${roomID}`)}`,
      json: true
    }
    const raffleCheck = await tools.XHR<raffleCheck>(check, 'Android')
    if (raffleCheck !== undefined && raffleCheck.response.statusCode === 200
      && raffleCheck.body.code === 0 && raffleCheck.body.data.list.length > 0) {
      raffleCheck.body.data.list.forEach(data => {
        const message: message = {
          cmd: raffle,
          roomID,
          id: +data.raffleId,
          type: data.type,
          title: data.title,
          time: +data.time
        }
        this._RaffleHandler(message)
      })
    }
  }
  /**
   * 检查房间抽奖lottery信息
   * 
   * @private
   * @param {string} url 
   * @param {number} roomID 
   * @memberof Listener
   */
  // @ts-ignore 暂时无用
  private async _LotteryCheck(url: string, roomID: number) {
    const check: request.Options = {
      uri: `${url}/check?${AppClient.signQueryBase(`roomid=${roomID}`)}`,
      json: true
    }
    const lotteryCheck = await tools.XHR<lotteryCheck>(check, 'Android')
    if (lotteryCheck !== undefined && lotteryCheck.response.statusCode === 200
      && lotteryCheck.body.code === 0 && lotteryCheck.body.data.guard.length > 0) {
      lotteryCheck.body.data.guard.forEach(data => {
        const message: message = {
          cmd: 'lottery',
          roomID,
          id: +data.id,
          type: data.keyword,
          title: '总督抽奖',
          time: 0
        }
        this._RaffleHandler(message)
      })
    }
  }
  /**
   * 监听抽奖消息
   * 
   * @private
   * @param {message} raffleMSG 
   * @memberof Listener
   */
  private _RaffleHandler(raffleMSG: message) {
    const roomID = raffleMSG.roomID
    const id = raffleMSG.id
    switch (raffleMSG.cmd) {
      case 'smallTV':
        if (this._smallTVID >= id) return
        this._smallTVID = id
        break
      case 'raffle':
        if (this._raffleID >= id) return
        this._raffleID = id
        break
      case 'lottery':
        if (this._lotteryID >= id) return
        this._lotteryID = id
        break
      default:
        return
    }
    this.emit('raffle', raffleMSG)
    tools.Log(`房间 ${tools.getShortRoomID(roomID)} 开启了第 ${id} 轮${raffleMSG.title}`)
  }
}
export default Listener