import * as request from 'request'
import * as tools from './lib/tools'
import { apiLiveOrigin } from './index'
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
   * @memberof BeatStorm
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
   * @memberof BeatStorm
   */
  private _content: string
  /**
   * 房间号
   * 
   * @private
   * @type {number}
   * @memberof BeatStorm
   */
  private _roomID: number
  /**
   * CookieJar
   * 
   * @private
   * @type {request.CookieJar}
   * @memberof BeatStorm
   */
  private _jar: request.CookieJar
  /**
   * 昵称
   * 
   * @private
   * @type {string}
   * @memberof BeatStorm
   */
  private _nickname: string
  /**
   * 指定直播间发送消息
   * 
   * @private
   * @memberof BeatStorm
   */
  private async _SendMsg() {
    let rnd = Math.floor(Date.now() / 1000 - 60 - 300 * Math.random())
      , sendMsg: request.Options = {
        method: 'POST',
        uri: `${apiLiveOrigin}/msg/send`,
        // body: `color=16777215&fontsize=25&mode=1&msg=${encodeURIComponent(this._content)}&rnd=${rnd}&roomid=${this._roomID}&csrf_token=${this._getCsrfToken()}`,
        body: `color=16777215&fontsize=25&mode=1&msg=${encodeURIComponent(this._content)}&rnd=${rnd}&roomid=${this._roomID}`,
        jar: this._jar,
        json: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Referer': `http://live.bilibili.com/neptune/${this._roomID}`
        }
      }
    let beatStormResponse = await tools.XHR<beatStormResponse>(sendMsg).catch(tools.Error)
    if (beatStormResponse != null && beatStormResponse.body.data.cmd === 'SPECIAL_TIPS') {
      let content = beatStormResponse.body.data.tips.content,
        gift = content.match(/恭喜你(.*)</)
      if (gift != null) tools.Log(this._nickname, gift[1])
    }
  }
  /**
   * 获取CsrfToken
   * 
   * @private
   * @returns 
   * @memberof BeatStorm
   */
  private _getCsrfToken() {
    let cookies = this._jar.getCookies(apiLiveOrigin)
      , cookieFind = cookies.find(cookie => {
        if (cookie.key === 'bili_jct')
          return cookie.value
      })
    return cookieFind == null ? '' : cookieFind.value
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