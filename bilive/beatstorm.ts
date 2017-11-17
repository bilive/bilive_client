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
    this._stormID = beatStormOptions.stormID
    this._roomID = beatStormOptions.roomID
    this._jar = beatStormOptions.jar
    this._nickname = beatStormOptions.nickname
    this._JoinStorm()
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
   * 节奏编号
   * 
   * @private
   * @type {number}
   * @memberof BeatStorm
   */
  private _stormID: number
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
   * 参与节奏风暴
   * 
   * @private
   * @memberof BeatStorm
   */
  private async _JoinStorm() {
    let joinStorm: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/lottery/v1/Storm/join`,
      // body: `id=${this._stormID}&captcha_token=&captcha_phrase=&token=adcd50de0df31150da71bf19c8230d282d8c9d6d&csrf_token=b36ede23909f6aed6e853ac02746ac0d`,
      body: `id=${this._stormID}`,
      jar: this._jar,
      json: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `http://live.bilibili.com/neptune/${this._roomID}`
      }
    }
    let joinStormResponse = await tools.XHR<joinStormResponse>(joinStorm).catch(tools.Error)
    if (joinStormResponse != null && joinStormResponse.body.code ===0) {
      let content = joinStormResponse.body.data
        tools.Log(this._nickname, `获得 ${content.gift_num} 个${content.gift_name}`)
    }
  }
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
}
/**
 * 节奏风暴设置
 * 
 * @export
 * @interface beatStormOptions
 */
export interface beatStormOptions {
  content: string
  stormID: number
  roomID: number
  jar: request.CookieJar
  nickname: string
}
/**
 * 节奏跟风返回值
 * 
 * @interface beatStormResponse
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
/**
 * 节奏跟风返回值
 * 
 * @interface joinStormResponse
 */
interface joinStormResponse {
  code: number
  msg: string
  message: string
  data: joinStormResponseData
}
interface joinStormResponseData {
  gift_id: number
  title: string
  content: string
  mobile_content: string
  gift_img: string
  gift_num: number
  gift_name: string
}