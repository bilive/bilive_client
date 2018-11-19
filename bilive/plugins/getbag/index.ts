import { Options as requestOptions } from 'request'
import Plugin, { tools, AppClient } from '../../plugin'

class Bag extends Plugin {
  constructor() {
    super()
  }
  public name = '包裹道具'
  public description = '领取直播包裹道具'
  public version = '0.0.1'
  public author = 'lzghzr'
  /**
   * 任务表
   *
   * @private
   * @type {Map<string, boolean>}
   * @memberof Bag
   */
  private _getBagList: Map<string, boolean> = new Map()
  public async load({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }) {
    // 包裹道具
    defaultOptions.newUserData['getBag'] = false
    defaultOptions.info['getBag'] = {
      description: '包裹道具',
      tip: '领取直播包裹道具',
      type: 'boolean'
    }
    whiteList.add('getBag')
    this.loaded = true
  }
  public async start({ users }: { users: Map<string, User> }) {
    this._getBag(users)
  }
  public async loop({ cstMin, cstHour, cstString, users }: { cstMin: number, cstHour: number, cstString: string, users: Map<string, User> }) {
    // 每天00:10刷新任务
    if (cstString === '00:10') this._getBagList.clear()
    // 每天04:30, 12:30, 20:30做任务
    if (cstMin === 30 && cstHour % 8 === 4) this._getBag(users)
  }
  /**
   * 包裹道具
   *
   * @private
   * @memberof Bag
   */
  private _getBag(users: Map<string, User>) {
    users.forEach(async (user, uid) => {
      if (this._getBagList.get(uid) || !user.userData['getBag']) return
      const getBag: requestOptions = {
        uri: `https://api.live.bilibili.com/AppBag/getSendGift?${AppClient.signQueryBase(user.tokenQuery)}`,
        json: true,
        headers: user.headers
      }
      const getBagGift = await tools.XHR<{ code: number }>(getBag, 'Android')
      if (getBagGift !== undefined && getBagGift.response.statusCode === 200) {
        if (getBagGift.body.code === 0) {
          this._getBagList.set(uid, true)
          tools.Log(user.nickname, '包裹道具', '已获取每日包裹道具')
        }
        else tools.Log(user.nickname, '包裹道具', getBagGift.body)
      }
      else tools.Log(user.nickname, '包裹道具', '网络错误')
    })
  }
}

export default new Bag()