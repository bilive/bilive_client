import { EventEmitter } from 'events'
import tools from './lib/tools'
import AppClient from './lib/app_client'
import DMclient from './dm_client_re'
import { liveOrigin, apiLiveOrigin, smallTVPathname, rafflePathname, lotteryPathname, _options } from './index'
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
   * 小电视/摩天大楼ID, 活动抽奖ID, lottery抽奖ID, app抽奖ID
   *
   * @private
   * @type {number}
   * @memberof Listener
   */
  private _smallTVID: number = 0
  private _raffleID: number = 0
  private _lotteryID: number = 0
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
    this._addAreaRoom(0)
    const RegularDM = new DMclient({ roomID, userID })
    RegularDM
      .on('SYS_MSG', dataJson => this._SYSMSGHandler(dataJson))
      .on('SYS_GIFT', dataJson => this._SYSGiftHandler(dataJson))
      .on('GUARD_MSG', dataJson => this._LotteryHandler(dataJson))
      .Connect()
  }
  /**
   * 获取各分区开播房间
   *
   * @private
   *
   * @memberof Listener
   */
  private async _addAreaRoom(prior: number, id?: number) {
    const userID = tools.getLongRoomID(_options.config.defaultRoomID)
    const getAllList = await tools.XHR<getAllList>({// 获取直播列表
      uri: `${apiLiveOrigin}/room/v2/AppIndex/getAllList?${AppClient.baseQuery}`,
      json: true
    }, 'Android')
    if (getAllList !== undefined && getAllList.response.statusCode === 200 && getAllList.body.code === 0) {
      let moduleList = getAllList.body.data.module_list
      if (id !== undefined) {
        while (moduleList[0].module_info.id !== id) {
          moduleList.splice(0, 1)
        }
        moduleList.splice(1, moduleList.length - 1)
      }
      moduleList.forEach(modules => {
        if (modules.module_info.type === 9 && modules.list.length > 0) {
          const areaID = modules.module_info.id
          if (areaID !== 7) {
            const roomID = (<getAllListDataRoomList>modules.list[prior]).roomid
            const areaDM = <DMclient>this._DMclient.get(areaID)
            if (areaDM !== undefined) {
              const areaRoomID = areaDM.roomID
              if (areaRoomID !== roomID) {
                areaDM
                  .removeAllListeners()
                  .Close()
                this._DMclient.delete(areaRoomID)
              }
              else {
                this._addAreaRoom(prior + 1, areaID)
                return
              }
            }
            const newDMclient = new DMclient({ roomID, userID })
            newDMclient
              .on('SYS_MSG', dataJson => this._SYSMSGHandler2(dataJson))
              .on('PREPARING', async () => this._addAreaRoom(0, areaID))
              .Connect()
            this._DMclient.set(areaID, newDMclient)
          }
        }
      })
    }
    else {
      await tools.Sleep(3 * 1000)
      if (id !== undefined) this._addAreaRoom(0, id)
      else this._addAreaRoom(0)
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
    if (dataJson.msg_text.search('摩天大楼') === -1) this._RaffleCheck(url, roomID, 'smallTV')
    else this._RaffleCheck(url, roomID, 'skyscraper')
  }
  /**
   * 监听非娱乐分区摩天大楼消息
   *
   * @private
   * @param {SYS_MSG} dataJson
   * @memberof Listener
   */
  private _SYSMSGHandler2(dataJson: SYS_MSG) {
    if (dataJson.real_roomid === undefined || dataJson.tv_id === undefined || dataJson.msg_text.search('摩天大楼') === -1) return
    const url = apiLiveOrigin + smallTVPathname
    const roomID = dataJson.real_roomid
    this._RaffleCheck(url, roomID, 'skyscraper')
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
   * 监听Lottery消息
   *
   * @private
   * @param {GUARD_MSG} dataJson
   * @memberof Listener
   */
  private async _LotteryHandler(dataJson: GUARD_MSG) {
    const url = apiLiveOrigin + lotteryPathname
    const rege = /(?:(主播 )).*(?=( 的直播间开通了总督))/
    const res = rege.exec(dataJson.msg)
    if (res === null) return
    const upID = res[0].toString().substr(3)
    const searchCheck = await tools.XHR<searchID>({
      uri: encodeURI('https://search.bilibili.com/api/search?search_type=live&keyword=' + upID),
      json: true
    })
    if (searchCheck === undefined || searchCheck.body.result.live_user === null) return
    const roomID = searchCheck.body.result.live_user[0].roomid
    this._LotteryCheck(url, roomID)
  }
  /**
   * 检查房间抽奖raffle信息
   *
   * @private
   * @param {string} url
   * @param {number} roomID
   * @param {('smallTV'| 'skyscraper' | 'raffle')} raffle
   * @memberof Listener
   */
  private async _RaffleCheck(url: string, roomID: number, raffle: 'smallTV' | 'skyscraper' | 'raffle') {
    const raffleCheck = await tools.XHR<raffleCheck>({
      uri: `${url}/check?roomid=${roomID}`,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
    })
    if (raffleCheck !== undefined && raffleCheck.response.statusCode === 200
      && raffleCheck.body.code === 0 && raffleCheck.body.data.list.length > 0) {
      raffleCheck.body.data.list.forEach(data => {
        const message: message = {
          cmd: raffle,
          roomID,
          id: +data.raffleId,
          type: raffle,
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
  private async _LotteryCheck(url: string, roomID: number) {
    const lotteryCheck = await tools.XHR<lotteryCheck>({
      uri: `${url}/check?roomid=${roomID}`,
      json: true
    })
    if (lotteryCheck !== undefined && lotteryCheck.response.statusCode === 200
      && lotteryCheck.body.code === 0 && lotteryCheck.body.data.guard.length > 0) {
      lotteryCheck.body.data.guard.forEach(data => {// 只考虑总督，节奏风暴不考虑
        const message: message = {
          cmd: 'lottery',
          roomID,
          id: +data.id,
          type: data.keyword,
          time: 0
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
    const roomInfo = await tools.XHR<roomInfo>({
      uri: `${apiLiveOrigin}/AppRoom/index?${AppClient.signQueryBase(`room_id=${roomID}`)}`,
      json: true
    }, 'Android')
    if (roomInfo !== undefined && roomInfo.response.statusCode === 200
      && roomInfo.body.code === 0 && roomInfo.body.data.event_corner.length > 0) {
      roomInfo.body.data.event_corner.forEach(event => {
        const type = event.event_type.split('-')
        if (type.length !== 2) return
        const message: message = {
          cmd: 'appLighten',
          roomID,
          id: +type[1],
          type: type[0],
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
  private async _RaffleHandler(raffleMSG: message) {
    const roomID = raffleMSG.roomID
    const id = raffleMSG.id
    let msg = ''
    switch (raffleMSG.cmd) {
      case 'smallTV':
        if (this._smallTVID >= id) return
        this._smallTVID = id
        msg = '小电视'
        break
      case 'skyscraper':
        if (this._smallTVID >= id) return
        this._smallTVID = id
        raffleMSG.cmd = 'smallTV'
        msg = '摩天大楼'
        break
      case 'raffle':
        if (this._raffleID >= id) return
        this._raffleID = id
        msg = '活动'
        break
      case 'lottery':
        if (this._lotteryID >= id) return
        this._lotteryID = id
        msg = '总督'
        break
      case 'appLighten':
        if (this._appLightenID >= id) return
        this._appLightenID = id
        msg = '客户端'
        break
      default:
        return
    }
    const entryCheck0 = await tools.XHR<entryCheck0>({//验证是否为钓鱼房间，整合到listener
      uri: `${apiLiveOrigin}/room/v1/Room/room_init?id=${tools.getShortRoomID(roomID)}`,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
    })
    if (entryCheck0 === undefined) {
      await tools.Sleep(5 * 1000)
      this._RaffleHandler(raffleMSG)
    }
    else if (entryCheck0.body.data.encrypted === true || entryCheck0.body.data.is_hidden === true || entryCheck0.body.data.is_locked === true) {
      tools.Log(`发现钓鱼房间 ${tools.getShortRoomID(roomID)}`)
      return
    }
    this.emit('raffle', raffleMSG)
    tools.Log(`房间 ${tools.getShortRoomID(roomID)} 开启了第 ${id} 轮${msg}抽奖`)
  }
}
export default Listener
