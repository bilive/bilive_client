import { EventEmitter } from 'events'
import tools from './lib/tools'
import AppClient from './lib/app_client'

class Plugin extends EventEmitter implements IPlugin {
  constructor() {
    super()
  }
  /**
   * 插件名
   *
   * @memberof Plugin
   */
  public name = '测试插件'
  /**
   * 说明
   *
   * @memberof Plugin
   */
  public description = '这是用来测试的'
  /**
   * 版本
   *
   * @memberof Plugin
   */
  public version = '0.0.1'
  /**
   * 作者
   *
   * @memberof Plugin
   */
  public author = 'lzghzr'
  /**
   * 是否已加载
   *
   * @memberof Plugin
   */
  public loaded = false
}

export default Plugin
export { tools, AppClient }