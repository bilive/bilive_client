import * as request from 'request'
import * as ws from 'ws'
import * as tools from './lib/tools'
import { BiliveClient, message, beatStormInfo } from './lib/bilive_client'
import { usersData, userData, rootOrigin, options } from './index'
/**
 * 自动参与节奏风暴
 * 
 * @export
 * @class BeatStorm
 */
export class BeatStorm {
  /**
   * BiliveClient
   * 
   * @private
   * @type {BiliveClient}
   * @memberOf BeatStorm
   */
  private _Client: BiliveClient
  /**
   * 开始挂机
   * 
   * @memberOf BeatStorm
   */
  public Start() {
    let apiOrigin = options.apiOrigin, apiKey = options.apiKey
    if (apiOrigin == null || apiKey == null) return
    this._Client = new BiliveClient(apiOrigin, apiKey)
    this._Client
      .on('serverError', (error) => { tools.Log('与监听服务器断开五分钟', error) })
      .on('sysmsg', (message: message) => { tools.Log('公告:', message.msg) })
      .on('beatStorm', this._BeatStormHandler.bind(this))
      .Connect()
  }
  /**
   * 监听节奏风暴消息
   * 
   * @private
   * @param {message} message
   * @memberOf BeatStorm
   */
  private _BeatStormHandler(message: message) {
    let beatStormInfo = <beatStormInfo>message.data
    let roomID = beatStormInfo.roomID
    if (options.beatStormBlackList.indexOf(roomID) > -1) return
    tools.Log(`房间 ${roomID} 赠送了第 ${beatStormInfo.id} 个节奏风暴`)
    let usersData = options.usersData
    for (let uid in usersData) {
      let userData = usersData[uid]
      if (userData.status && userData.beatStorm) {
        this._SendMsg(beatStormInfo.content, userData, roomID)
      }
    }
  }
  /**
   * 指定直播间发送消息
   * 
   * @private
   * @param {string} msg
   * @param {userData} userData
   * @param {number} roomID
   * @memberOf BeatStorm
   */
  private _SendMsg(msg: string, userData: userData, roomID: number) {
    let rnd = Math.floor(Date.now() / 1000 - 60 - 300 * Math.random())
    let sendMsg: request.Options = {
      method: 'POST',
      uri: `${rootOrigin}/msg/send`,
      body: `color=16777215&fontsize=25&mode=1&msg=${encodeURIComponent(msg)}&rnd=${rnd}&roomid=${roomID}`,
      jar: userData.jar
    }
    tools.XHR<string>(sendMsg)
      .then((resolve) => {
        let beatStormResponse: BeatStormResponse = JSON.parse(resolve)
        if (beatStormResponse.data.cmd === 'SPECIAL_TIPS') {
          let content = beatStormResponse.data.tips.content
          let gift = content.match(/恭喜你(.*)</)
          if (gift != null) tools.Log(userData.nickname, gift[1])
        }
      })
      .catch((error) => { tools.Log(error) })
  }
}
/**
 * 节奏跟风返回值
 * 
 * @interface BeatStormResponse
 */
interface BeatStormResponse {
  code: number
  msg: string
  data: BeatStormResponseData
}
interface BeatStormResponseData {
  cmd: string
  tips: BeatStormResponseDataTips
}
interface BeatStormResponseDataTips {
  gift_id: number
  title: string
  content: string
}