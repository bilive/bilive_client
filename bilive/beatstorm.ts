import * as request from 'request'
import * as tools from './lib/tools'
import { rootOrigin } from './index'
/**
 * 自动参与节奏风暴
 * 
 * @export
 * @class BeatStorm
 */
export class BeatStorm {
  /**
   * 创建一个 BeatStorm 实例
   * @param {beatStormOptions} beatStormOptions
   * @memberOf BeatStorm
   */
  constructor(beatStormOptions: beatStormOptions) {
    this._content = beatStormOptions.content
    this._roomID = beatStormOptions.roomID
    this._jar = beatStormOptions.jar
    this._nickname = beatStormOptions.nickname
    this._SendMsg()
  }
  /**
   * 弹幕
   * 
   * @private
   * @type {string}
   * @memberOf BeatStorm
   */
  private _content: string
  /**
   * 房间号
   * 
   * @private
   * @type {number}
   * @memberOf BeatStorm
   */
  private _roomID: number
  /**
   * CookieJar
   * 
   * @private
   * @type {request.CookieJar}
   * @memberOf BeatStorm
   */
  private _jar: request.CookieJar
  /**
   * 昵称
   * 
   * @private
   * @type {string}
   * @memberOf BeatStorm
   */
  private _nickname: string
  /**
   * 指定直播间发送消息
   * 
   * @private
   * @memberOf BeatStorm
   */
  private _SendMsg() {
    let rnd = Math.floor(Date.now() / 1000 - 60 - 300 * Math.random()),
      sendMsg: request.Options = {
        method: 'POST',
        uri: `${rootOrigin}/msg/send`,
        body: `color=16777215&fontsize=25&mode=1&msg=${encodeURIComponent(this._content)}&rnd=${rnd}&roomid=${this._roomID}`,
        jar: this._jar
      }
    tools.XHR<string>(sendMsg)
      .then((resolve) => {
        let beatStormResponse: beatStormResponse = JSON.parse(resolve)
        if (beatStormResponse.data.cmd === 'SPECIAL_TIPS') {
          let content = beatStormResponse.data.tips.content,
            gift = content.match(/恭喜你(.*)</)
          if (gift != null) tools.Log(this._nickname, gift[1])
        }
      })
      .catch((error) => { tools.Log(error) })
  }
}
/**
 * 节奏风暴设置
 * 
 * @export
 * @interface beatStormOptions
 */
export interface beatStormOptions {
  content: string
  roomID: number
  jar: request.CookieJar
  nickname: string
}
/**
 * 节奏跟风返回值
 * 
 * @interface BeatStormResponse
 */
interface beatStormResponse {
  code: number
  msg: string
  data: beatStormResponseData
}
interface beatStormResponseData {
  cmd: string
  tips: beatStormResponseDataTips
}
interface beatStormResponseDataTips {
  gift_id: number
  title: string
  content: string
}