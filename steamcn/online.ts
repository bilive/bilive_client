import * as events from 'events'
import * as app from './index'
import * as Tools from '../lib/tools'
/**
 * 挂机得经验
 * 
 * @export
 * @class Online
 * @extends {events.EventEmitter}
 */
export class Online extends events.EventEmitter {
  constructor() {
    super()
  }
  /**
   * 开始挂机
   */
  public Start() {
    this.OnlineKeep()
  }
  /**
   * 保持在线
   * 
   * @private
   */
  private OnlineKeep() {
    Tools.UserInfo<Tools.config>(app.appName)
      .then((resolve) => {
        let usersData = resolve.usersData
        for (let x in usersData) {
          Tools.XHR('http://steamcn.com/home.php', usersData[x].cookie, 'GET')
            .then((resolve) => {
              let onlineInfo = resolve.toString()
              if (onlineInfo.includes('member.php?mod=register')) {
                this.emit('cookieInfo', usersData[x])
                usersData[x].status = false
                Tools.UserInfo(app.appName, x, usersData[x])
              }
            })
        }
      })
    setTimeout(() => {
      this.OnlineKeep()
    }, 3e5) // 5分钟
  }
}