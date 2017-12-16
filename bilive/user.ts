import * as request from 'request'
import * as tools from './lib/tools'
import { apiLiveOrigin } from './index'

export class User {
  constructor(userData: userData) {
    this.userData = userData
    this.jar = tools.setCookie(userData.cookie, [apiLiveOrigin])
  }
  public userData: userData
  public jar: request.CookieJar
}