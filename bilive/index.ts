import fs from 'fs'
import util from 'util'
import tools from './lib/tools'
import User from './online'
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
  /**
   * 版本
   *
   * @type {version}
   * @memberof BiLive
   */
  public version: version = {
    major: 3,
    minor: 0,
    patch: 0,
    semver: '3.0.0'
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
    // 初始化设置
    Options.init()
    // 初始化运行插件
    this._pluginList.forEach(async plugin => {
      if (typeof plugin.options === 'function') await plugin.options({ options: Options._ })
    })
    // 新用户
    Options.on('newUser', (user: User) => {
      // 运行插件
      this._pluginList.forEach(async plugin => {
        if (typeof plugin.start === 'function') await plugin.start({ options: Options._, users: new Map([[user.uid, user]]) })
      })
    })
    for (const uid in Options._.user) {
      if (!Options._.user[uid].status) continue
      const user = new User(uid, Options._.user[uid])
      const status = await user.Start()
      if (status !== undefined) {
        if (status === 'validate' && typeof tools.Validate === 'function') {
          const validate = await tools.Validate(user.validateURL)
          if (validate !== '') {
            user.validate = validate
            const secondStatus = await user.Start()
            if (secondStatus !== undefined) user.Stop()
          }
          else user.Stop()
        }
        else user.Stop()
      }
    }
    // 运行插件
    this._pluginList.forEach(async plugin => {
      if (typeof plugin.start === 'function') await plugin.start({ options: Options._, users: Options.user })
    })
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
    // 运行插件
    this._pluginList.forEach(plugin => {
      if (typeof plugin.loop === 'function') plugin.loop({ cst, cstMin, cstHour, cstString, options: Options._, users: Options.user })
    })
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
      if (typeof plugin.load === 'function') await plugin.load({ defaultOptions: Options._, whiteList: Options.whiteList, plugins, version: this.version })
      if (plugin.loaded) {
        const { name, description, version, author } = plugin
        tools.Log(`已加载: ${name}, 用于: ${description}, 版本: ${version}, 作者: ${author}`)
        this._pluginList.set(pluginName, plugin)
      }
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
      .on('raffle', (raffleMessage: raffleMessage) => this._Message(raffleMessage))
      .on('lottery', (lotteryMessage: lotteryMessage) => this._Message(lotteryMessage))
      .on('pklottery', (lotteryMessage: lotteryMessage) => this._Message(lotteryMessage))
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
    // 运行插件
    this._pluginList.forEach(plugin => {
      if (typeof plugin.msg === 'function')
        plugin.msg({ message: raffleMessage, options: Options._, users: Options.user })
    })
  }
}
export default BiLive