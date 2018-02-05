import tools from './lib/tools'
import DMclient, { DMclientOptions } from './lib/dm_client'
/**
 * 弹幕客户端, 可自动重连
 * 因为之前重连逻辑写在一起实在太乱了, 所以独立出来
 * 
 * @class DMclientRE
 * @extends {DMclient}
 */
class DMclientRE extends DMclient {
  /**
   * Creates an instance of DMclientRE.
   * @param {DMclientOptions} [{ roomID = 23058, userID = 0, protocol = 'flash' }={}] 
   * @memberof DMclientRE
   */
  constructor({ roomID = 23058, userID = 0, protocol = 'flash' }: DMclientOptions = {}) {
    super({ roomID, userID, protocol })
    this.on('DMerror', error => tools.ErrorLog(error))
    this.on('close', () => this._ClientReConnect())
  }
  /**
   * 重连次数, 以五次为阈值
   * 
   * @type {number}
   * @memberof DMclientRE
   */
  public reConnectTime: number = 0
  /**
   * 重新连接
   * 
   * @private
   * @memberof DMclientRE
   */
  private _ClientReConnect() {
    this._Timer = setTimeout(() => {
      if (this.reConnectTime >= 5) {
        this.reConnectTime = 0
        this._DelayReConnect()
      }
      else {
        this.reConnectTime++
        this.Connect({ server: this._server, port: this.port })
      }
    }, 3 * 1000)
  }
  /**
   * 5分钟后重新连接
   * 
   * @private
   * @memberof DMclientRE
   */
  private _DelayReConnect() {
    this._Timer = setTimeout(() => this.Connect(), 5 * 60 * 1000)
    tools.ErrorLog('尝试重连弹幕服务器失败，五分钟后再次重新连接')
  }
}
export default DMclientRE