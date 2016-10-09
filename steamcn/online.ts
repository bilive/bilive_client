import {EventEmitter} from 'events'
import * as app from './index'
import * as Tools from '../lib/tools'
/**
 * 挂机得经验
 * 
 * @export
 * @class Online
 * @extends {EventEmitter}
 */
export class Online extends EventEmitter {
  constructor() {
    super()
  }
  /**
   * 开始挂机
   * 
   * @memberOf Online
   */
  public Start() {
    this.Online()
  }
  /**
   * 保持在线
   * 
   * @memberOf Online
   */
  public Online() {
    Tools.UserInfo<Tools.config>(app.appName)
      .then((resolve) => {
        let usersData = resolve.usersData
        for (let uid in usersData) {
          let userData = usersData[uid]
          Tools.XHR('http://steamcn.com/home.php', userData.cookie, 'GET')
            .then((resolve) => {
              let onlineInfo = resolve.toString()
              if (onlineInfo.includes('member.php?mod=register')) {
                this.emit('cookieInfo', userData)
                userData.status = false
                Tools.UserInfo(app.appName, uid, userData).catch()
              }
            })
            .catch()
        }
      })
      .catch()
    setTimeout(() => {
      this.Online()
    }, 3e5) // 5分钟
  }
}