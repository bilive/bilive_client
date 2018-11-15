import { Options as requestOptions } from 'request'
import tools from '../../lib/tools'
import AppClient from '../../lib/app_client'
/**
 * 自动参与抽奖
 *
 * @class Raffle
 */
class Raffle {
  /**
   * 创建一个 Raffle 实例
   * @param {raffleMessage | lotteryMessage | beatStormMessage} raffleMessage
   * @memberof Raffle
   */
  constructor(raffleMessage: raffleMessage | lotteryMessage | beatStormMessage, user: User) {
    this._raffleMessage = raffleMessage
    this._user = user
  }
  /**
   * 抽奖设置
   *
   * @private
   * @type {raffleMessage | lotteryMessage}
   * @memberof Raffle
   */
  private _raffleMessage: raffleMessage | lotteryMessage | beatStormMessage
  /**
   * 抽奖用户
   *
   * @private
   * @type {User}
   * @memberof Raffle
   */
  private _user: User
  /**
   * 抽奖地址
   *
   * @private
   * @type {string}
   * @memberof Raffle
   */
  private _url!: string
  /**
   * 参与小电视抽奖
   *
   * @memberof Raffle
   */
  public SmallTV() {
    this._url = 'https://api.live.bilibili.com/gift/v4/smalltv'
    this._Raffle()
  }
  /**
   * 参与Raffle类抽奖
   *
   * @memberof Raffle
   */
  public Raffle() {
    this._url = 'https://api.live.bilibili.com/gift/v4/smalltv'
    this._Raffle()
  }
  /**
   * 参与Lottery类抽奖
   *
   * @memberof Raffle
   */
  public Lottery() {
    this._url = 'https://api.live.bilibili.com/lottery/v1/lottery'
    this._Lottery()
  }
  /**
   * 参与节奏风暴
   *
   * @memberof Raffle
   */
  public async BeatStorm() {
    this._url = 'https://api.live.bilibili.com/lottery/v1/Storm'
    this._BeatStorm()
  }
  /**
   * Raffle类抽奖
   *
   * @private
   * @memberof Raffle
   */
  private async _Raffle() {
    await tools.Sleep((<raffleMessage>this._raffleMessage).time_wait * 1000)
    this._RaffleAward()
  }
  /**
   * 获取抽奖结果
   *
   * @private
   * @memberof Raffle
   */
  private async _RaffleAward() {
    const { id, roomID, title, type } = this._raffleMessage
    const reward: requestOptions = {
      method: 'POST',
      uri: `${this._url}/getAward`,
      body: AppClient.signQueryBase(`${this._user.tokenQuery}&raffleId=${id}&roomid=${roomID}&type=${type}`),
      json: true,
      headers: this._user.headers
    }
    tools.XHR<raffleAward>(reward, 'Android').then(raffleAward => {
      if (raffleAward !== undefined && raffleAward.response.statusCode === 200) {
        if (raffleAward.body.code === 0) {
          const gift = raffleAward.body.data
          if (gift.gift_num === 0) tools.Log(this._user.nickname, title, id, raffleAward.body.msg)
          else {
            const msg = `${this._user.nickname} ${title} ${id} 获得 ${gift.gift_num} 个${gift.gift_name}`
            tools.Log(msg)
            if (gift.gift_name.includes('小电视')) tools.sendSCMSG(msg)
          }
        }
        else tools.Log(this._user.nickname, title, id, raffleAward.body)
      }
    })
  }
  /**
   * Lottery类抽奖
   *
   * @private
   * @memberof Raffle
   */
  private async _Lottery() {
    const { id, roomID, title, type } = this._raffleMessage
    const reward: requestOptions = {
      method: 'POST',
      uri: `${this._url}/join`,
      body: AppClient.signQueryBase(`${this._user.tokenQuery}&id=${id}&roomid=${roomID}&type=${type}`),
      json: true,
      headers: this._user.headers
    }
    tools.XHR<lotteryReward>(reward, 'Android').then(lotteryReward => {
      if (lotteryReward !== undefined && lotteryReward.response.statusCode === 200) {
        if (lotteryReward.body.code === 0) {
          tools.Log(this._user.nickname, title, id, lotteryReward.body.data.message)
        }
        else tools.Log(this._user.nickname, title, id, lotteryReward.body)
      }
    })
  }
  /**
   * 节奏风暴
   *
   * @private
   * @memberof Raffle
   */
  private async _BeatStorm() {
    const { id, title } = this._raffleMessage
    const join: requestOptions = {
      method: 'POST',
      uri: `${this._url}/join`,
      body: AppClient.signQuery(`${this._user.tokenQuery}&${AppClient.baseQuery}&id=${id}`),
      json: true,
      headers: this._user.headers
    }
    tools.XHR<joinStorm>(join, 'Android').then(joinStorm => {
      if (joinStorm !== undefined && joinStorm.response.statusCode === 200 && joinStorm.body !== undefined) {
        const content = joinStorm.body.data
        if (content !== undefined && content.gift_num > 0)
          tools.Log(this._user.nickname, title, id, `${content.mobile_content} 获得 ${content.gift_num} 个${content.gift_name}`)
        else tools.Log(this._user.nickname, title, id, joinStorm.body)
      }
    })
  }
}

/**
 * 参与抽奖信息
 *
 * @interface raffleJoin
 */
// @ts-ignore
interface raffleJoin {
  code: number
  msg: string
  message: string
  data: raffleJoinData
}
interface raffleJoinData {
  face?: string
  from: string
  type: 'small_tv' | string
  roomid?: string
  raffleId: number | string
  time: number
  status: number
}
/**
 * 抽奖结果信息
 *
 * @interface raffleReward
 */
interface raffleReward {
  code: number
  msg: string
  message: string
  data: raffleRewardData
}
interface raffleRewardData {
  raffleId: number
  type: string
  gift_id: number
  gift_name: string
  gift_num: number
  gift_from: string
  gift_type: number
  gift_content: string
  status?: number
}
type raffleAward = raffleReward
/**
 * 抽奖lottery
 *
 * @interface lotteryReward
 */
interface lotteryReward {
  code: number
  msg: string
  message: string
  data: lotteryRewardData
}
interface lotteryRewardData {
  id: number
  type: string
  award_type: number
  time: number
  message: string
  from: string
  award_list: lotteryRewardDataAwardlist[]
}
interface lotteryRewardDataAwardlist {
  name: string
  img: string
  type: number
  content: string
}
/**
 * 节奏跟风返回值
 *
 * @interface joinStorm
 */
interface joinStorm {
  code: number
  message: string
  msg: string
  data: joinStormData
}
interface joinStormData {
  gift_id: number
  title: string
  content: string
  mobile_content: string
  gift_img: string
  gift_num: number
  gift_name: string
}

export default Raffle