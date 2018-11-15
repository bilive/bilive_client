import fs from 'fs'
import util from 'util'
import tools from './lib/tools'
import User from './daily'
import WebAPI from './webapi'
import Listener from './listener'
import Options from './options'
const FSreadDir = util.promisify(fs.readdir)
/**
 * 主程序
 *
 * @class BiLive
 */
class BiLive {
  constructor() {
  }
  // 系统消息监听
  private _Listener!: Listener
  // 全局计时器
  private _lastTime = ''
  public loop!: NodeJS.Timer
  /**
   * 插件列表
   *
   * @private
   * @type {Map<string, plugin>}
   * @memberof BiLive
   */
  private _pluginList: Map<string, IPlugin> = new Map()
  /**
   * 开始主程序
   *
   * @memberof BiLive
   */
  public async Start() {
    // 加载插件
    await this._loadPlugin()
    Options.init()
    for (const uid in Options._.user) {
      if (!Options._.user[uid].status) continue
      const user = new User(uid, Options._.user[uid])
      const status = await user.Start()
      if (status !== undefined) user.Stop()
    }
    Options.user.forEach(user => user.daily())
    this.loop = setInterval(() => this._loop(), 50 * 1000)
    new WebAPI().Start()
    this.Listener()
  }
  /**
   * 计时器
   *
   * @private
   * @memberof BiLive
   */
  private _loop() {
    const csttime = Date.now() + 8 * 60 * 60 * 1000
    const cst = new Date(csttime)
    const cstString = cst.toUTCString().substr(17, 5) // 'HH:mm'
    if (cstString === this._lastTime) return
    this._lastTime = cstString
    const cstHour = cst.getUTCHours()
    const cstMin = cst.getUTCMinutes()
    // 每天00:10刷新任务
    if (cstString === '00:10') Options.user.forEach(user => user.nextDay())
    // 每天13:55再次自动送礼, 因为一般活动14:00结束
    else if (cstString === '13:55') Options.user.forEach(user => user.sendGift())
    // 每天04:30, 12:30, 20:30做日常
    if (cstMin === 30 && cstHour % 8 === 4) Options.user.forEach(user => user.daily())
    if (cstMin % 10 === 0) {
      // 更新监听房间
      this._Listener.updateAreaRoom()
      // 清空ID缓存
      this._Listener.clearAllID()
    }
    // 插件运行
    this._pluginList.forEach(plugin => plugin.loop({ cst, cstMin, cstHour, cstString, options: Options._, users: Options.user }))
  }
  /**
   * 加载插件
   *
   * @private
   * @memberof BiLive
   */
  private async _loadPlugin() {
    const pluginsPath = __dirname + '/plugins'
    const plugins = await FSreadDir(pluginsPath)
    for (const pluginName of plugins) {
      const { default: plugin }: { default: IPlugin } = await import(`${pluginsPath}/${pluginName}/index.js`)
      await plugin.start({ defaultOptions: Options._, whiteList: Options.whiteList })
      const { name, description, version, author } = plugin
      tools.Log(`已加载: ${name}, 用于: ${description}, 版本: ${version}, 作者: ${author}`)
      this._pluginList.set(pluginName, plugin)
    }
  }
  /**
   * 监听
   *
   * @memberof BiLive
   */
  public Listener() {
    this._Listener = new Listener()
    this._Listener
      .on('smallTV', (raffleMessage: raffleMessage) => this._Message(raffleMessage))
      .on('raffle', (raffleMessage: raffleMessage) => this._Message(raffleMessage))
      .on('lottery', (lotteryMessage: lotteryMessage) => this._Message(lotteryMessage))
      .on('beatStorm', (beatStormMessage: beatStormMessage) => this._Message(beatStormMessage))
      .Start()
  }
  /**
   * 监听消息
   *
   * @private
   * @param {raffleMessage | lotteryMessage | beatStormMessage} raffleMessage
   * @memberof BiLive
   */
  private async _Message(raffleMessage: raffleMessage | lotteryMessage | beatStormMessage) {
    // 插件运行
    this._pluginList.forEach(plugin => plugin.msg({ message: raffleMessage, options: Options._, users: Options.user }))
  }
}
export default BiLive