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
   * 验证码 DataURL
   *
   * @memberof Online
   */
  public captchaJPEG = ''
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
  protected _heartTimer!: NodeJS.Timer
  /**
   * 当账号出现异常时, 会返回'captcha'或'stop'
   * 'captcha'为登录需要验证码, 若无法处理需Stop()
   *
   * @returns {(Promise<'captcha' | 'validate' | 'authcode' | 'stop' | void>)}
   * @memberof Online
   */
  public async Start(): Promise<'captcha' | 'validate' | 'authcode' | 'stop' | void> {
    clearTimeout(this._heartTimer)
    if (!Options.user.has(this.uid)) Options.user.set(this.uid, this)
    if (this.jar === undefined) this.jar = tools.setCookie(this.cookieString)
    const test = await this.getOnlineInfo()
    if (test !== undefined) return test
    this._heartLoop()
  }
  /**
   * 停止挂机
   *
   * @memberof Online
   */
  public Stop() {
    clearTimeout(this._heartTimer)
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
   * 检查是否登录
   *
   * @private
   * @returns {(Promise<'captcha' | 'validate' | 'authcode' | 'stop' | void>)}
   * @memberof Online
   */
  public async getOnlineInfo(roomID = 3): Promise<'captcha' | 'validate' | 'authcode' | 'stop' | void> {
    const isLogin = await tools.XHR<{ code: number }>({
      uri: `${apiLiveOrigin}/xlive/web-ucenter/user/get_user_info`,
      jar: this.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${Options.getShortRoomID(roomID)}` }
    })
    if (isLogin !== undefined && isLogin.response.statusCode === 200 && isLogin.body.code === -101)
      return await this._cookieError()
  }
  /**
   * 设置心跳循环
   *
   * @protected
   * @memberof Online
   */
  protected async _heartLoop() {
    const heartTest = await this._onlineHeart()
    if (heartTest !== undefined) {
      const test = await this._cookieError()
      if (test !== undefined) this.Stop()
    }
    else this._heartTimer = setTimeout(() => this._heartLoop(), 5 * 60 * 1000)
  }
  /**
   * 发送在线心跳包
   * B站改版以后纯粹用来检查登录凭证是否失效
   *
   * @protected
   * @returns {(Promise<'cookieError' | 'tokenError' | void>)}
   * @memberof Online
   */
  protected async _onlineHeart(): Promise<'cookieError' | 'tokenError' | void> {
    const roomID = 3
    const online: XHRoptions = {
      method: 'POST',
      uri: `${apiLiveOrigin}/User/userOnlineHeart`,
      body: `csrf_token=${tools.getCookie(this.jar, 'bili_jct')}&csrf=${tools.getCookie(this.jar, 'bili_jct')}&visit_id=`,
      jar: this.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${Options.getShortRoomID(roomID)}` }
    }
    const heartPC = await tools.XHR<userOnlineHeart>(online)
    if (heartPC !== undefined && heartPC.response.statusCode === 200 && heartPC.body.code === -101) return 'cookieError'
    // 客户端
    const heartbeat: XHRoptions = {
      method: 'POST',
      uri: `${apiLiveOrigin}/heartbeat/v1/OnLine/mobileOnline?${AppClient.signQueryBase(this.tokenQuery)}`,
      body: `room_id=${Options.getLongRoomID(roomID)}&scale=xxhdpi`,
      json: true,
      headers: this.headers
    }
    const heart = await tools.XHR<userOnlineHeart>(heartbeat, 'Android')
    if (heart !== undefined && heart.response.statusCode === 200 && heart.body.code === -101) return 'tokenError'
  }
  /**
   * cookie失效
   *
   * @protected
   * @returns {(Promise<'captcha' | 'validate' | 'authcode' | 'stop' | void>)}
   * @memberof Online
   */
  protected async _cookieError(): Promise<'captcha' | 'validate' | 'authcode' | 'stop' | void> {
    tools.Log(this.nickname, 'Cookie已失效')
    const refresh = await this.refresh()
    if (refresh.status === AppClient.status.success) {
      this.jar = tools.setCookie(this.cookieString)
      await this.getOnlineInfo()
      Options.save()
      this._heartLoop()
      tools.Log(this.nickname, 'Cookie已更新')
    }
    else return await this._tokenError()
  }
  /**
   * token失效
   *
   * @protected
   * @returns {(Promise<'captcha' | 'validate' | 'authcode' | 'stop' | void>)}
   * @memberof Online
   */
  protected async _tokenError(): Promise<'captcha' | 'validate' | 'authcode' | 'stop' | void> {
    tools.Log(this.nickname, 'Token已失效')
    let login: loginResponse
    // if (this.authcodeURL !== '') login = await this.qrcodePoll()
    /** else */ login = await this.login()
    switch (login.status) {
      case AppClient.status.success:
        clearTimeout(this._heartTimer)
        this.captchaJPEG = ''
        this.validateURL = ''
        // this.authcodeURL = ''
        this.jar = tools.setCookie(this.cookieString)
        await this.getOnlineInfo()
        Options.save()
        this._heartLoop()
        tools.Log(this.nickname, 'Token已更新')
        break
      case AppClient.status.captcha:
        const captcha = await this.getCaptcha()
        if (captcha.status === AppClient.status.success)
          this.captchaJPEG = `data:image/jpeg;base64,${captcha.data.toString('base64')}`
        this._heartTimer = setTimeout(() => this.Stop(), 60 * 1000)
        tools.Log(this.nickname, '验证码错误')
        return 'captcha'
      case AppClient.status.validate:
        this._heartTimer = setTimeout(() => this.Stop(), 60 * 1000)
        tools.Log(this.nickname, '极验验证码错误')
        return 'validate'
      // case AppClient.status.authcode:
      //   const authcode = await this.getAuthcode()
      //   if (authcode.status === AppClient.status.success) {
      //     this.authcode = authcode.data.data.auth_code
      //     this.authcodeURL = authcode.data.data.url
      //   }
      //   this._heartTimer = setTimeout(() => this.Stop(), 60 * 1000)
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