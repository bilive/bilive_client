import request from 'request'
import tools from './lib/tools'
import AppClient from './lib/app_client'
import Options,{ apiLiveOrigin, liveOrigin } from './options'
/**
 * Creates an instance of Online.
 * 
 * @class Online
 * @extends {AppClient}
 */
class Online extends AppClient {
  /**
   * Creates an instance of Online.
   * @param {userData} userData 
   * @memberof Online
   */
  constructor(userData: userData) {
    super()
    this.userData = userData
  }
  // 存储用户信息
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
  public jar!: request.CookieJar
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
   * @returns {(Promise<'captcha' | 'stop' | void>)} 
   * @memberof Online
   */
  public async Start(): Promise<'captcha' | 'stop' | void> {
    clearTimeout(this._heartTimer)
    if (this.jar === undefined) {
      await this.init()
      this.jar = tools.setCookie(this.cookieString)
    }
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
    this.userData.status = false
    Options.save()
    tools.sendSCMSG(`${this.nickname} 已停止挂机`)
  }
  /**
   * 检查是否登录
   * 
   * @private
   * @returns {(Promise<'captcha' | 'stop' | void>)} 
   * @memberof Online
   */
  public async getOnlineInfo(roomID = Options._.config.eventRooms[0]): Promise<'captcha' | 'stop' | void> {
    const isLogin = await tools.XHR<{ code: number }>({
      uri: `${liveOrigin}/user/getuserinfo`,
      jar: this.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
    })
    if (isLogin !== undefined && isLogin.response.statusCode === 200 && isLogin.body.code === -500)
      return this._cookieError()
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
    const roomID = Options._.config.eventRooms[0]
    const online: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/User/userOnlineHeart`,
      jar: this.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${tools.getShortRoomID(roomID)}` }
    }
    const heartPC = await tools.XHR<userOnlineHeart>(online)
    if (heartPC !== undefined && heartPC.response.statusCode === 200 && heartPC.body.code === 3) return 'cookieError'
    // 客户端
    const heartbeat: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/mobile/userOnlineHeart?${AppClient.signQueryBase(this.tokenQuery)}`,
      body: `room_id=${tools.getLongRoomID(roomID)}&scale=xxhdpi`,
      json: true,
      headers: this.headers
    }
    const heart = await tools.XHR<userOnlineHeart>(heartbeat, 'Android')
    if (heart !== undefined && heart.response.statusCode === 200 && heart.body.code === 3) return 'tokenError'
  }
  /**
   * cookie失效
   * 
   * @protected
   * @returns {(Promise<'captcha' | 'stop' | void>)} 
   * @memberof Online
   */
  protected async _cookieError(): Promise<'captcha' | 'stop' | void> {
    tools.Log(this.nickname, 'Cookie已失效')
    const refresh = await this.refresh()
    if (refresh.status === AppClient.status.success) {
      this.jar = tools.setCookie(this.cookieString)
      await this.getOnlineInfo()
      Options.save()
      this._heartLoop()
      tools.Log(this.nickname, 'Cookie已更新')
    }
    else return this._tokenError()
  }
  /**
   * token失效
   * 
   * @protected
   * @returns {(Promise<'captcha' | 'stop' | void>)} 
   * @memberof Online
   */
  protected async _tokenError(): Promise<'captcha' | 'stop' | void> {
    tools.Log(this.nickname, 'Token已失效')
    const login = await this.login()
    if (login.status === AppClient.status.success) {
      clearTimeout(this._heartTimer)
      this.captchaJPEG = ''
      this.jar = tools.setCookie(this.cookieString)
      await this.getOnlineInfo()
      Options.save()
      this._heartLoop()
      tools.Log(this.nickname, 'Token已更新')
    }
    else if (login.status === AppClient.status.captcha) {
      const captcha = await this.getCaptcha()
      if (captcha.status === AppClient.status.success)
        this.captchaJPEG = `data:image/jpeg;base64,${captcha.data.toString('base64')}`
      this._heartTimer = setTimeout(() => this.Stop(), 60 * 1000)
      tools.Log(this.nickname, '验证码错误')
      return 'captcha'
    }
    else if (login.status === AppClient.status.error) {
      this.Stop()
      tools.Log(this.nickname, 'Token更新失败', login.data)
      return 'stop'
    }
    else tools.Log(this.nickname, 'Token更新失败')
  }
}
export default Online