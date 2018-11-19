import { Options as requestOptions } from 'request'
import Plugin, { tools, AppClient } from '../../plugin'

class Sign extends Plugin {
  constructor() {
    super()
  }
  public name = '自动签到'
  public description = '每天自动签到'
  public version = '0.0.1'
  public author = 'lzghzr'
  /**
   * 任务表
   *
   * @private
   * @type {Map<string, boolean>}
   * @memberof Sign
   */
  private _signList: Map<string, boolean> = new Map()
  public async load({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }) {
    // 自动签到
    defaultOptions.newUserData['doSign'] = false
    defaultOptions.info['doSign'] = {
      description: '自动签到',
      tip: '每天自动签到',
      type: 'boolean'
    }
    whiteList.add('doSign')
    this.loaded = true
  }
  public async start({ users }: { users: Map<string, User> }) {
    this._sign(users)
  }
  public async loop({ cstMin, cstHour, cstString, users }: { cstMin: number, cstHour: number, cstString: string, users: Map<string, User> }) {
    // 每天00:10刷新任务
    if (cstString === '00:10') this._signList.clear()
    // 每天04:30, 12:30, 20:30做任务
    if (cstMin === 30 && cstHour % 8 === 4) this._sign(users)
  }
  /**
   * 自动签到
   *
   * @private
   * @memberof Sign
   */
  private _sign(users: Map<string, User>) {
    users.forEach(async (user, uid) => {
      if (this._signList.get(uid) || !user.userData['doSign']) return
      const sign: requestOptions = {
        uri: `https://api.live.bilibili.com/AppUser/getSignInfo?${AppClient.signQueryBase(user.tokenQuery)}`,
        json: true,
        headers: user.headers
      }
      const signInfo = await tools.XHR<signInfo>(sign, 'Android')
      if (signInfo !== undefined && signInfo.response.statusCode === 200) {
        if (signInfo.body.code === 0 || signInfo.body.code === -500) {
          this._signList.set(uid, true)
          tools.Log(user.nickname, '自动签到', '已签到')
        }
        else tools.Log(user.nickname, '自动签到', signInfo.body)
      }
      else tools.Log(user.nickname, '自动签到', '网络错误')
    })
  }
}

/**
 * 签到信息
 *
 * @interface signInfo
 */
interface signInfo {
  code: number
  msg: string
  data: signInfoData
}
interface signInfoData {
  text: string
  status: number
  allDays: string
  curMonth: string
  newTask: number
  hadSignDays: number
  remindDays: number
}

export default new Sign()