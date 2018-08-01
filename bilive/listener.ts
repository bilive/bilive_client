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
   * 用于记录小电视/摩天大楼/活动礼物raffle历史房间（怀疑raffle已被B站弃用）
   *
   * @private
   * @type {Map<number, number>}
   * @memberof Listener
   */
  private _RaffleRoomID: number = 0
  private _SmallTVHistory: Map<number, number> = new Map()
  private _raffleID: number = 0
  private _lotteryID: number = 0
  /**
   * 开始监听
   *
   * @memberof Listener
   */
  public async Start() {
    this._addAreaRoom()
    await tools.Sleep(24 * 60 * 60 * 1000)//每天重设监听方法
    this.Stop()
    this.Start()
  }
  /**
   * 停止监听
   *
   * @memberof Listener
   */
  public Stop() {
    for (let roomOrder=50;roomOrder<90;roomOrder++) {
      const roomDM = <DMclient>this._DMclient.get(roomOrder)
      roomDM.removeAllListeners().Close()
      this._DMclient.delete(roomOrder)
    }
    this._RaffleRoomID = 0
    this._SmallTVHistory = new Map()
  }
  /**
   * 获取各分区开播房间
   *
   * @private
   *
   * @memberof Listener
   */
  private async _addAreaRoom(id?: number,oldroom?: number) {
    const userID = _options.config.defaultUserID
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
          const areaRooms = (<getAllListDataRooms>modules).list
          let order = 0, i = 0
          while (order < _options.config.listenNumber) {
            let Room = areaRooms[i]
            const roomID = Room.roomid
            const roomOrder = areaID * 10 + order
            const roomDM = <DMclient>this._DMclient.get(roomOrder)
            if (oldroom !== undefined && roomID === oldroom) {}
            else if (roomDM === undefined || roomDM.roomID !== roomID) {
              if (roomDM !== undefined) {
                roomDM.removeAllListeners().Close()
                this._DMclient.delete(roomOrder)
              }
              const newDMclient = new DMclient({ roomID, userID })
              newDMclient
                .on('SYS_MSG', dataJson => this._SYSMSGHandler(dataJson))
                .on('SYS_GIFT', dataJson => this._SYSGiftHandler(dataJson))
                .on('GUARD_MSG', dataJson => this._LotteryHandler(dataJson))
                .on('PREPARING', async () => {
                  await tools.Sleep(5 * 1000)
                  this._addAreaRoom(areaID, roomID)
                })
                .Connect()
              this._DMclient.set(roomOrder, newDMclient)
              order++
            }
            i++
          }
        }
      })
    }
    else {
      await tools.Sleep(2 * 1000)
      if (id !== undefined) this._addAreaRoom(id)
      else this._addAreaRoom()
    }
  }
  /**
   * 监听弹幕系统消息
   *
   * @private
   * @param {SYS_MSG} dataJson
   * @memberof Listener
   */
  private async _SYSMSGHandler(dataJson: SYS_MSG) {
    if (dataJson.real_roomid === undefined || dataJson.tv_id === undefined) return
    const url = apiLiveOrigin + smallTVPathname
    const roomID = dataJson.real_roomid
    if (this._RaffleRoomID === roomID) return
    this._RaffleRoomID = roomID
    await tools.Sleep(15 * 1000)
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
    if (dataJson.real_roomid === undefined || dataJson.giftId === undefined) return
    const url = apiLiveOrigin + rafflePathname
    const roomID = dataJson.real_roomid
    if (this._RaffleRoomID === roomID) return
    this._RaffleRoomID = roomID
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
    if (this._RaffleRoomID === roomID) return
    this._RaffleRoomID = roomID
    this._LotteryCheck(url, roomID)
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
    const raffleCheck = await tools.XHR<raffleCheck>({
      uri: `${url}/check?${AppClient.signQueryBase(`roomid=${roomID}`)}`,
      json: true
    }, 'Android')
    if (raffleCheck !== undefined && raffleCheck.response.statusCode === 200
      && raffleCheck.body.code === 0 && raffleCheck.body.data.list.length > 0) {
      raffleCheck.body.data.list.forEach(data => {
        const message: message = {
          cmd: raffle,
          roomID,
          id: +data.raffleId,
          type: data.type,
          title: data.title,
          time: +data.time_wait
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
      uri: `${url}/check?${AppClient.signQueryBase(`roomid=${roomID}`)}`,
      json: true
    }, 'Android')
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
  private async _RaffleHandler(raffleMSG: message) {
    const roomID = raffleMSG.roomID
    const id = raffleMSG.id
    switch (raffleMSG.cmd) {
      case 'smallTV':
        if (this._SmallTVHistory.get(id) !== undefined) return
        this._SmallTVHistory.set(id,roomID)
        break
      case 'raffle':
        if (this._raffleID >= id) return
        this._raffleID = id
        break
      case 'lottery':
        if (this._lotteryID >= id) return
        this._lotteryID = id
        break
      default: return
    }
    const entryCheck = await tools.XHR<entryCheck>({//验证是否为钓鱼房间，整合到listener
      uri: `${apiLiveOrigin}/room/v1/Room/room_init?id=${tools.getShortRoomID(roomID)}`,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
    })
    if (entryCheck === undefined) {
      await tools.Sleep(5 * 1000)
      this._RaffleHandler(raffleMSG)
    }
    else if (entryCheck.body.data.encrypted === true || entryCheck.body.data.is_hidden === true || entryCheck.body.data.is_locked === true) return tools.Log(`发现钓鱼房间 ${tools.getShortRoomID(roomID)}`)
    else {
      this.emit('raffle', raffleMSG)
      tools.Log(`房间 ${tools.getShortRoomID(roomID)} 开启了第 ${id} 轮${raffleMSG.title}`)
    }
  }
}
export default Listener
