import { Options as requestOptions } from 'request'
import Plugin, { tools, AppClient } from '../../plugin'

class TreasureBox extends Plugin {
  constructor() {
    super()
  }
  public name = '宝箱道具'
  public description = '领取宝箱道具'
  public version = '0.0.1'
  public author = 'lzghzr'
  /**
   * 任务表
   *
   * @private
   * @type {Map<string, boolean>}
   * @memberof TreasureBox
   */
  private _treasureBoxList: Map<string, boolean> = new Map()
  public async load({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }) {
    // 宝箱道具
    defaultOptions.newUserData['treasureBox'] = false
    defaultOptions.info['treasureBox'] = {
      description: '宝箱道具',
      tip: '领取宝箱道具',
      type: 'boolean'
    }
    whiteList.add('treasureBox')
    this.loaded = true
  }
  public async start({ users }: { users: Map<string, User> }) {
    this._treasureBox(users)
  }
  public async loop({ cstMin, cstHour, cstString, users }: { cstMin: number, cstHour: number, cstString: string, users: Map<string, User> }) {
    // 每天00:10刷新任务
    if (cstString === '00:10') this._treasureBoxList.clear()
    // 每天04:30, 12:30, 20:30做任务
    if (cstMin === 30 && cstHour % 8 === 4) this._treasureBox(users)
  }
  /**
   * 宝箱道具
   *
   * @private
   * @memberof TreasureBox
   */
  private _treasureBox(users: Map<string, User>) {
    users.forEach((user, uid) => this._treasureBoxUser(uid, user))
  }
  /**
   * 分用户进行
   *
   * @private
   * @param {string} uid
   * @param {User} user
   * @memberof TreasureBox
   */
  private async _treasureBoxUser(uid: string, user: User) {
    if (this._treasureBoxList.get(uid) || !user.userData['treasureBox']) return
    // 获取宝箱状态,换房间会重新冷却
    const current: requestOptions = {
      uri: `https://api.live.bilibili.com/mobile/freeSilverCurrentTask?${AppClient.signQueryBase(user.tokenQuery)}`,
      json: true,
      headers: user.headers
    }
    const currentTask = await tools.XHR<currentTask>(current, 'Android')
    if (currentTask !== undefined && currentTask.response.statusCode === 200) {
      if (currentTask.body.code === 0) {
        await tools.Sleep(currentTask.body.data.minute * 60 * 1000)
        const award: requestOptions = {
          uri: `https://api.live.bilibili.com/mobile/freeSilverAward?${AppClient.signQueryBase(user.tokenQuery)}`,
          json: true,
          headers: user.headers
        }
        await tools.XHR<award>(award, 'Android')
        this._treasureBoxUser(uid, user)
      }
      else if (currentTask.body.code === -10017) {
        this._treasureBoxList.set(uid, true)
        tools.Log(user.nickname, '宝箱道具', '已领取所有宝箱')
      }
      else tools.Log(user.nickname, '宝箱道具', currentTask.body)
    }
    else tools.Log(user.nickname, '宝箱道具', '网络错误')
  }
}

/**
 * 在线领瓜子宝箱
 *
 * @interface currentTask
 */
interface currentTask {
  code: number
  msg: string
  data: currentTaskData
}
interface currentTaskData {
  minute: number
  silver: number
  time_start: number
  time_end: number
}
/**
 * 领瓜子答案提交返回
 *
 * @interface award
 */
interface award {
  code: number
  msg: string
  data: awardData
}
interface awardData {
  silver: number
  awardSilver: number
  isEnd: number
}

export default new TreasureBox()