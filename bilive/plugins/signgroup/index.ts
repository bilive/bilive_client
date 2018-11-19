import { Options as requestOptions } from 'request'
import Plugin, { tools, AppClient } from '../../plugin'

class SignGroup extends Plugin {
  constructor() {
    super()
  }
  public name = '应援团签到'
  public description = '在已加入的应援团签到'
  public version = '0.0.1'
  public author = 'lzghzr'
  /**
   * 任务表
   *
   * @private
   * @type {Map<string, boolean>}
   * @memberof SignGroup
   */
  private _signGroupList: Map<string, number> = new Map()
  public async load({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }) {
    // 应援团签到
    defaultOptions.newUserData['signGroup'] = false
    defaultOptions.info['signGroup'] = {
      description: '应援团签到',
      tip: '在已加入的应援团签到',
      type: 'boolean'
    }
    whiteList.add('signGroup')
    this.loaded = true
  }
  public async start({ users }: { users: Map<string, User> }) {
    this._signGroup(users)
  }
  public async loop({ cstMin, cstHour, cstString, users }: { cstMin: number, cstHour: number, cstString: string, users: Map<string, User> }) {
    // 每天00:10刷新任务
    if (cstString === '00:10') this._signGroupList.clear()
    // 每天04:30, 12:30, 20:30做任务
    if (cstMin === 30 && cstHour % 8 === 4) this._signGroup(users)
  }
  /**
   * 应援团签到
   *
   * @private
   * @memberof SignGroup
   */
  private _signGroup(users: Map<string, User>) {
    users.forEach(async (user, uid) => {
      if (this._signGroupList.get(uid) || !user.userData['signGroup']) return
      // 获取已加入应援团列表
      const group: requestOptions = {
        uri: `https://api.live.bilibili.com/link_group/v1/member/my_groups?${AppClient.signQueryBase(user.tokenQuery)}`,
        json: true,
        headers: user.headers
      }
      const linkGroup = await tools.XHR<linkGroup>(group, 'Android')
      if (linkGroup !== undefined && linkGroup.response.statusCode === 200) {
        if (linkGroup.body.code === 0) {
          const listLength = linkGroup.body.data.list.length
          if (listLength === 0 || listLength === this._signGroupList.get(uid)) return
          let ok = 0
          for (const groupInfo of linkGroup.body.data.list) {
            const sign: requestOptions = {
              uri: `https://api.live.bilibili.com/link_setting/v1/link_setting/sign_in?\
${AppClient.signQueryBase(`${user.tokenQuery}&group_id=${groupInfo.group_id}&owner_id=${groupInfo.owner_uid}`)}`,
              json: true,
              headers: user.headers
            }
            // 应援团签到
            const signGroup = await tools.XHR<signGroup>(sign, 'Android')
            if (signGroup !== undefined && signGroup.response.statusCode === 200) {
              ok++
              if (signGroup.body.data.add_num > 0)
                tools.Log(user.nickname, '应援团签到', `在${groupInfo.group_name}签到获得 ${signGroup.body.data.add_num} 点亲密度`)
              else tools.Log(user.nickname, '应援团签到', `已在${groupInfo.group_name}签到过`)
            }
            else tools.Log(user.nickname, '应援团签到', '网络错误')
            await tools.Sleep(3000)
          }
          this._signGroupList.set(uid, ok)
        }
        else tools.Log(user.nickname, '应援团签到', '获取列表', linkGroup.body)
      }
      else tools.Log(user.nickname, '应援团签到', '获取列表', '网络错误')
    })
  }
}

/**
 * 应援团
 *
 * @interface linkGroup
 */
interface linkGroup {
  code: number
  msg: string
  message: string
  data: linkGroupData
}
interface linkGroupData {
  list: linkGroupInfo[]
}
interface linkGroupInfo {
  group_id: number
  owner_uid: number
  owner_name: string
  group_type: number
  group_level: number
  group_cover: string
  group_name: string
  group_notice: string
  group_status: number
}
/**
 * 应援团签到返回
 *
 * @interface signGroup
 */
interface signGroup {
  code: number
  msg: string
  message: string
  data: signGroupData
}
interface signGroupData {
  add_num: number
  status: number
}

export default new SignGroup()