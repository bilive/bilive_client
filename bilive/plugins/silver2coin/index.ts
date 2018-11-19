import { Options as requestOptions } from 'request'
import Plugin, { tools, AppClient } from '../../plugin'

class Coin extends Plugin {
  constructor() {
    super()
  }
  public name = '兑换硬币'
  public description = '将银瓜子兑换成硬币'
  public version = '0.0.1'
  public author = 'lzghzr'
  /**
   * 任务表
   *
   * @private
   * @type {Map<string, boolean>}
   * @memberof Coin
   */
  private _silver2coinList: Map<string, boolean> = new Map()
  public async load({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }) {
    // 兑换硬币
    defaultOptions.newUserData['silver2coin'] = false
    defaultOptions.info['silver2coin'] = {
      description: '兑换硬币',
      tip: '将银瓜子兑换成硬币',
      type: 'boolean'
    }
    whiteList.add('silver2coin')
    this.loaded = true
  }
  public async start({ users }: { users: Map<string, User> }) {
    this._silver2coin(users)
  }
  public async loop({ cstMin, cstHour, cstString, users }: { cstMin: number, cstHour: number, cstString: string, users: Map<string, User> }) {
    // 每天00:10刷新任务
    if (cstString === '00:10') this._silver2coinList.clear()
    // 每天04:30, 12:30, 20:30做任务
    if (cstMin === 30 && cstHour % 8 === 4) this._silver2coin(users)
  }
  /**
   * 兑换硬币
   *
   * @private
   * @memberof Coin
   */
  private _silver2coin(users: Map<string, User>) {
    users.forEach(async (user, uid) => {
      if (this._silver2coinList.get(uid) || !user.userData['silver2coin']) return
      const exchange: requestOptions = {
        method: 'POST',
        uri: `https://api.live.bilibili.com/AppExchange/silver2coin?${AppClient.signQueryBase(user.tokenQuery)}`,
        json: true,
        headers: user.headers
      }
      const silver2coin = await tools.XHR<silver2coin>(exchange, 'Android')
      if (silver2coin !== undefined && silver2coin.response.statusCode === 200) {
        if (silver2coin.body.code === 0 || silver2coin.body.code === 403) {
          this._silver2coinList.set(uid, true)
          tools.Log(user.nickname, '兑换硬币', '已成功兑换硬币')
        }
        else tools.Log(user.nickname, '兑换硬币', silver2coin.body)
      }
      else tools.Log(user.nickname, '兑换硬币', '网络错误')
    })
  }
}

/**
 * 银瓜子兑换硬币返回
 *
 * @interface silver2coin
 */
interface silver2coin {
  code: number
  msg: string
  message: string
  data: silver2coinData
}
interface silver2coinData {
  silver: string
  gold: string
  tid: string
  coin: number
}

export default new Coin()