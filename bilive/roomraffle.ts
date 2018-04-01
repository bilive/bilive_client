import request from 'request'
import tools from './lib/tools'
import User from './user'
import AppClient from './lib/app_client'
import { liveOrigin, apiLiveOrigin, lotteryPathname, beatStormPathname } from './index'
/**
 * 自动参与抽奖
 *
 * @class Raffle
 */
class RRaffle {
  /**
   * 创建一个 RRaffle 实例
   * @param {raffleOptions} raffleOptions
   * @memberof RRaffle
   */
  constructor(raffleOptions: raffleOptions) {
    if (raffleOptions.type !== undefined) this._type = raffleOptions.type
    this._raffleId = raffleOptions.raffleId
    this._roomID = raffleOptions.roomID
    this._user = raffleOptions.user
  }
  /**
   * type
   *
   * @private
   * @type {string}
   * @memberof RRaffle
   */
  private _type?: string
  /**
   * 参与ID
   *
   * @private
   * @type {number}
   * @memberof RRaffle
   */
  private _raffleId: number
  /**
   * 房间号
   *
   * @private
   * @type {number}
   * @memberof RRaffle
   */
  private _roomID: number
  /**
   * User
   *
   * @private
   * @type {User}
   * @memberof RRaffle
   */
  private _user: User
  /**
   * 抽奖地址
   *
   * @private
   * @type {string}
   * @memberof RRaffle
   */
  private _url!: string
  /**
   * 参与lottery抽奖
   *
   * @memberof RRaffle
   */
  public Lottery() {
    this._url = apiLiveOrigin + lotteryPathname
    this._Lottery()
  }
  /**
   * 参与节奏风暴
   *
   * @memberof RRaffle
   */
  public BeatStorm() {
    this._url = apiLiveOrigin + beatStormPathname
    this._BeatStorm()
  }
  /**
   * lottery抽奖
   *
   * @private
   * @memberof RRaffle
   */
  private async _Lottery() {
    const entry0: request.Options = {
      uri: `${apiLiveOrigin}/room/v1/Room/room_init?id=${tools.getShortRoomID(this._roomID)}`,
      jar: this._user.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(this._roomID)}` }
    }
    const entry1: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/room/v1/Room/room_entry_action`,
      jar: this._user.jar,
      form: {
        'csrf_token': this._user.userData.cookie.substr(9,32),
        'room_id': this._roomID
      },
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(this._roomID)}` }
    }
    const entryCheck0 = await tools.XHR<entryCheck0>(entry0)
    const entryCheck1 = await tools.XHR<entryCheck1>(entry1)
    if (entryCheck0 !== undefined && entryCheck0.response.statusCode === 200 && entryCheck0.body.code === 0 && entryCheck1 !== undefined && entryCheck1.response.statusCode === 200 && entryCheck1.body.code === 0) {
      await tools.Sleep(8000)
      const join: request.Options = {
        uri: `${this._url}/join?roomid=${this._roomID}&joinid=${this._raffleId}`,
        jar: this._user.jar,
        json: true,
        headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(this._roomID)}` }
      }
      const lotteryJoin = await tools.XHR<lotteryJoin>(join)
      if (lotteryJoin !== undefined && lotteryJoin.response.statusCode === 200 && lotteryJoin.body.code === 0) {
        tools.Log(lotteryJoin)
      }
    }
  }
  /**
   * 参与节奏风暴
   *
   * @memberof RRaffle
   */
   private async _BeatStorm() {
     const entry0: request.Options = {
       uri: `${apiLiveOrigin}/room/v1/Room/room_init?id=${tools.getShortRoomID(this._roomID)}`,
       jar: this._user.jar,
       json: true,
       headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(this._roomID)}` }
     }
     const entry1: request.Options = {
       method: 'POST',
       uri: `${apiLiveOrigin}/room/v1/Room/room_entry_action`,
       jar: this._user.jar,
       form: {
         'csrf_token': this._user.userData.cookie.substr(9,32),
         'room_id': this._roomID
       },
       json: true,
       headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(this._roomID)}` }
     }
     const entryCheck0 = await tools.XHR<entryCheck0>(entry0)
     const entryCheck1 = await tools.XHR<entryCheck1>(entry1)
     if (entryCheck0 !== undefined && entryCheck0.response.statusCode === 200 && entryCheck0.body.code === 0 && entryCheck1 !== undefined && entryCheck1.response.statusCode === 200 && entryCheck1.body.code === 0) {
       await tools.Sleep(8000)
       const join: request.Options = {
         uri: `${this._url}/join?roomid=${this._roomID}&joinid=${this._raffleId}`,
         jar: this._user.jar,
         json: true,
         headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(this._roomID)}` }
       }
       const lotteryJoin = await tools.XHR<lotteryJoin>(join)
       if (lotteryJoin !== undefined && lotteryJoin.response.statusCode === 200 && lotteryJoin.body.code === 0) {
         tools.Log(lotteryJoin)
       }
     }
   }
  /**
   * app快速抽奖
   *
   * @private
   * @memberof RRaffle
   */
  public async AppLighten() {
    const reward: request.Options = {
      uri: `${apiLiveOrigin}/YunYing/roomEvent?${AppClient.signQueryBase(`event_type=${this._type}-${this._raffleId}\
&room_id=${this._roomID}&${this._user.tokenQuery}`)}`,
      json: true,
      headers: this._user.headers
    }
    await tools.Sleep(5000)
    const appLightenReward = await tools.XHR<appLightenReward>(reward, 'Android')
    if (appLightenReward !== undefined
      && appLightenReward.response.statusCode === 200 && appLightenReward.body.code === 0)
      tools.Log(this._user.nickname, `抽奖 ${this._raffleId}`, `获得${appLightenReward.body.data.gift_desc}`)
  }
}
export default RRaffle
