import { CookieJar } from 'tough-cookie'
import tools from './lib/tools'
import AppClient from './lib/app_client'
import Options, { apiLiveOrigin, liveOrigin } from './options'
/**
 * Creates an instance of Online.
 *
 * @class Online
 * @extends {AppClient}
 */
class Online extends AppClient {
  /**
   *Creates an instance of Online.
   * @param {string} uid
   * @param {userData} userData
   * @memberof Online
   */
  constructor(uid: string, userData: userData) {
    super()
    this.uid = uid
    this.userData = userData
  }
  // 存储用户信息
  public uid: string
  public userData: userData
  public get nickname(): string { return this.userData.nickname }
  public get userName(): string { return this.userData.userName }
  public set userName(userName: string) { this.userData.userName = userName }
  public get passWord(): string { return this.userData.passWord }
  public set passWord(passWord: string) { this.userData.passWord = passWord }
  public get biliUID(): number { return this.userData.biliUID }
  public set biliUID(biliUID: number) { this.userData.biliUID = biliUID }
  public get accessToken(): string { return this.userData.accessToken }
  public set accessToken(accessToken: string) { this.userData.accessToken = accessToken }
  public get refreshToken(): string { return this.userData.refreshToken }
  public set refreshToken(refreshToken: string) { this.userData.refreshToken = refreshToken }
  public get cookieString(): string { return this.userData.cookie }
  public set cookieString(cookieString: string) { this.userData.cookie = cookieString }
  public jar!: CookieJar
  /**
   * 如果抽奖做到外面的话应该有用
   *
   * @readonly
   * @memberof Online
   */
  public get tokenQuery() {
    return `access_key=${this.accessToken}`
  }
  /**
   * 负责心跳定时
   *
   * @protected
   * @type {NodeJS.Timer}
   * @memberof Online
   */
  protected _loopTimer!: NodeJS.Timer
  /**
   * 当账号出现异常时, 会返回'validate'或'stop'
   * 'validate'为登录需要极验验证码, 若无法处理需Stop()
   *
   * @returns {(Promise<'validate' | 'authcode' | 'stop' | void>)}
   * @memberof Online
   */
  public async Start(): Promise<'validate' | 'authcode' | 'stop' | void> {
    clearTimeout(this._loopTimer)
    if (!Options.user.has(this.uid)) Options.user.set(this.uid, this)
    if (this.jar === undefined) this.jar = tools.setCookie(this.cookieString)
    const statusTest = await this._getUserStatus()
    if (statusTest !== undefined) return statusTest
    this._loopTimer = setTimeout(() => this._getUserStatusLoop(), 5 * 60 * 1000)
  }
  /**
   * 停止挂机
   *
   * @memberof Online
   */
  public Stop() {
    clearTimeout(this._loopTimer)
    Options.user.delete(this.uid)
    this.userData.status = false
    Options.save()
    tools.emit('systemMSG', <systemMSG>{
      message: `${this.nickname} 已停止挂机`,
      options: Options._,
      user: this
    })
  }
  /**
   * 获取用户状态
   *
   * @protected
   * @returns {(Promise<'validate' | 'authcode' | 'stop' | void>)}
   * @memberof Online
   */
  protected async _getUserStatus(): Promise<'validate' | 'authcode' | 'stop' | void> {
    const roomID = 3
    const PCUserInfoXHRoptions = await tools.XHR<{ code: number }>({
      url: `${apiLiveOrigin}/xlive/web-ucenter/user/get_user_info`,
      cookieJar: this.jar,
      responseType: 'json',
      headers: { 'Referer': `${liveOrigin}/${Options.getShortRoomID(roomID)}` }
    })
    if (PCUserInfoXHRoptions !== undefined && PCUserInfoXHRoptions.response.statusCode === 200 && PCUserInfoXHRoptions.body.code === -101) return await this._cookieError()
    const AppUserInfoXHRoptions = await tools.XHR<{ code: number }>({
      url: `${apiLiveOrigin}/xlive/app-ucenter/v1/user/get_user_info?${AppClient.signQueryBase(this.tokenQuery)}`,
      responseType: 'json'
    }, 'Android')
    if (AppUserInfoXHRoptions !== undefined && AppUserInfoXHRoptions.response.statusCode === 200 && (AppUserInfoXHRoptions.body.code === -101 || AppUserInfoXHRoptions.body.code === -400)) return await this._tokenError()
  }
  /**
   * 循环获取用户状态
   *
   * @protected
   * @memberof Online
   */
  protected async _getUserStatusLoop() {
    const statusTest = await this._getUserStatus()
    if (statusTest !== undefined) this.Stop()
    else this._loopTimer = setTimeout(() => this._getUserStatusLoop(), 5 * 60 * 1000)
  }
  /**
   * cookie失效
   *
   * @protected
   * @returns {(Promise<'validate' | 'authcode' | 'stop' | void>)}
   * @memberof Online
   */
  protected async _cookieError(): Promise<'validate' | 'authcode' | 'stop' | void> {
    tools.Log(this.nickname, 'Cookie已失效')
    const refresh = await this.refresh()
    if (refresh.status === AppClient.status.success) {
      this.jar = tools.setCookie(this.cookieString)
      Options.save()
      this._getUserStatusLoop()
      tools.Log(this.nickname, 'Cookie已更新')
    }
    else return await this._tokenError()
  }
  /**
   * token失效
   *
   * @protected
   * @returns {(Promise<'validate' | 'authcode' | 'stop' | void>)}
   * @memberof Online
   */
  protected async _tokenError(): Promise<'validate' | 'authcode' | 'stop' | void> {
    tools.Log(this.nickname, 'Token已失效')
    // let login: loginResponse
    // if (this.authcodeURL !== '') login = await this.qrcodePoll()
    // else login = await this.login()
    const login = await this.login()
    switch (login.status) {
      case AppClient.status.success:
        clearTimeout(this._loopTimer)
        this.validateURL = ''
        // this.authcodeURL = ''
        this.jar = tools.setCookie(this.cookieString)
        Options.save()
        this._getUserStatusLoop()
        tools.Log(this.nickname, 'Token已更新')
        break
      case AppClient.status.validate:
        this._loopTimer = setTimeout(() => this.Stop(), 60 * 1000)
        tools.Log(this.nickname, '极验验证码错误')
        return 'validate'
      // case AppClient.status.authcode:
      //   const authcode = await this.getAuthcode()
      //   if (authcode.status === AppClient.status.success) {
      //     this.authcode = authcode.data.data.auth_code
      //     this.authcodeURL = authcode.data.data.url
      //   }
      //   this._loopTimer = setTimeout(() => this.Stop(), 60 * 1000)
      //   tools.Log(this.nickname, '二维码错误')
      //   return 'authcode'
      case AppClient.status.error:
        this.Stop()
        tools.Log(this.nickname, 'Token更新失败', login.data)
        return 'stop'
      default:
        tools.Log(this.nickname, 'Token更新失败')
        break
    }
  }
}
export default Online