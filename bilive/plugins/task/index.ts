import { Options as requestOptions } from 'request'
import Plugin, { tools } from '../../plugin'

class Task extends Plugin {
  constructor() {
    super()
  }
  public name = '日常任务'
  public description = '完成日常任务'
  public version = '0.0.1'
  public author = 'lzghzr'
  /**
   * 任务表
   *
   * @private
   * @type {Map<string, boolean>}
   * @memberof Task
   */
  private _taskList: Map<string, boolean> = new Map()
  public async load({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }) {
    // 日常任务
    defaultOptions.newUserData['doTask'] = false
    defaultOptions.info['doTask'] = {
      description: '日常任务',
      tip: '完成日常任务',
      type: 'boolean'
    }
    whiteList.add('doTask')
    this.loaded = true
  }
  public async start({ users }: { users: Map<string, User> }) {
    this._task(users)
  }
  public async loop({ cstMin, cstHour, cstString, users }: { cstMin: number, cstHour: number, cstString: string, users: Map<string, User> }) {
    // 每天00:10刷新任务
    if (cstString === '00:10') this._taskList.clear()
    // 每天04:30, 12:30, 20:30做任务
    if (cstMin === 30 && cstHour % 8 === 4) this._task(users)
  }
  /**
   * 日常任务
   *
   * @private
   * @memberof Task
   */
  private _task(users: Map<string, User>) {
    users.forEach(async (user, uid) => {
      if (this._taskList.get(uid) || !user.userData['doTask']) return
      const task: requestOptions = {
        method: 'POST',
        uri: 'https://api.live.bilibili.com/activity/v1/task/receive_award',
        body: `task_id=double_watch_task&csrf_token=${tools.getCookie(user.jar, 'bili_jct')}&csrf=${tools.getCookie(user.jar, 'bili_jct')}`,
        jar: user.jar,
        json: true,
        headers: { 'Referer': 'https://live.bilibili.com/p/center/index' }
      }
      const doubleWatchTask = await tools.XHR<{ code: number }>(task)
      if (doubleWatchTask !== undefined && doubleWatchTask.response.statusCode === 200) {
        if (doubleWatchTask.body.code === 0 || doubleWatchTask.body.code === -400) {
          this._taskList.set(uid, true)
          tools.Log(user.nickname, '日常任务', '日常任务已完成')
        }
        else tools.Log(user.nickname, '日常任务', doubleWatchTask.body)
      }
      else tools.Log(user.nickname, '日常任务', '网络错误')
    })
  }
}

/**
 * 日常任务
 *
 * @interface taskInfo
 */
// @ts-ignore
interface taskInfo {
  code: number
  msg: string
  data: taskInfoData
}
interface taskInfoData {
  [index: string]: taskInfoDoublewatchinfo
}
interface taskInfoDoublewatchinfo {
  task_id: string | undefined
}

export default new Task()