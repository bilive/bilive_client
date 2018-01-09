import * as request from 'request'
import * as tools from './lib/tools'
import { AppClient } from './lib/app_client'
import { apiLiveOrigin, _options, liveOrigin } from './index'
/**
 * Creates an instance of Online.
 * 
 * @export
 * @class Online
 * @extends {AppClient}
 */
export class Online extends AppClient {
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
  public jar: request.CookieJar
  // 验证码
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
  protected _heartTimer: NodeJS.Timer
  /**
   * 当账号出现异常时, 会返回'captcha'或'stop'
   * 'captcha'为登录需要验证码, 若无法处理需Stop()
   * 
   * @returns {(Promise<'captcha' | 'stop' | void>)} 
   * @memberof Online
   */
  public async Start(): Promise<'captcha' | 'stop' | void> {
    clearTimeout(this._heartTimer)
    if (this.jar == null) {
      await this.init()
      this.jar = tools.setCookie(this.cookieString)
    }
    let test = await this.getOnlineInfo()
    if (typeof test === 'string') return test
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
    tools.Options(_options)
  }
  /**
   * 检查是否登录
   * 
   * @private
   * @returns {(Promise<'captcha' | 'stop' | void>)} 
   * @memberof Online
   */
  public async getOnlineInfo(roomID = _options.config.defaultRoomID): Promise<'captcha' | 'stop' | void> {
    let isLogin = await tools.XHR<{ code: number | string }>({
      uri: 'https://live.bilibili.com/user/getuserinfo',
      jar: this.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${roomID}` }
    }).catch(tools.Error)
    if (isLogin != null && isLogin.response.statusCode === 200 && isLogin.body.code === -101) return this._cookieError()
  }
  /**
   * 设置心跳循环
   * 
   * @protected
   * @memberof Online
   */
  protected async _heartLoop() {
    let heartTest = await this._onlineHeart().catch(tools.Error)
    if (typeof heartTest === 'string') {
      let test = await this._cookieError()
      if (test === 'captcha') this.Stop()
    }
    else {
      this._heartTimer = setTimeout(() => {
        this._heartLoop()
      }, 3e+5) // 5min
    }
  }
  /**
   * 发送在线心跳包
   * 
   * @protected
   * @returns {(Promise<'cookieError' | 'tokenError' | void>)} 
   * @memberof Online
   */
  protected async _onlineHeart(): Promise<'cookieError' | 'tokenError' | void> {
    let online: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/Online/userOnlineHeart`,
      jar: this.jar,
      json: true,
      headers: { 'Referer': `${liveOrigin}/${_options.config.defaultRoomID}` }
    }
      , heartPC = await tools.XHR<userOnlineHeart>(online)
    if (heartPC.response.statusCode === 200 && heartPC.body.code === 3) return 'cookieError'
    // 客户端
    let heartbeat: request.Options = {
      method: 'POST',
      uri: `${apiLiveOrigin}/mobile/userOnlineHeart?${AppClient.signQueryBase(this.tokenQuery)}`,
      body: `room_id=${_options.config.defaultRoomID}&scale=xxhdpi`,
      json: true,
      headers: this.headers
    }
      , heart = await tools.XHR<userOnlineHeart>(heartbeat, 'Android')
    if (heart.response.statusCode === 200 && heart.body.code === 3) return 'tokenError'
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
    let refresh = await this.refresh()
    if (refresh.status === AppClient.status.success) {
      this.jar = tools.setCookie(this.cookieString)
      await this.getOnlineInfo()
      await tools.Options(_options)
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
    let login = await this.login()
    if (login.status === AppClient.status.success) {
      clearTimeout(this._heartTimer)
      this.captchaJPEG = ''
      this.jar = tools.setCookie(this.cookieString)
      await this.getOnlineInfo()
      await tools.Options(_options)
      this._heartLoop()
      tools.Log(this.nickname, 'Token已更新')
    }
    else if (login.status === AppClient.status.captcha) {
      let captcha = await this.getCaptcha()
      if (captcha.status === AppClient.status.success) this.captchaJPEG = `data:image/jpeg;base64,${captcha.data.toString('base64')}`
      this._heartTimer = setTimeout(() => this.Stop(), 6e+4) // 60s
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