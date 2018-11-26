/*******************
 ****** index ******
 *******************/
/**
 * 应用设置
 *
 * @interface options
 */
interface options {
  server: server
  config: config
  user: userCollection
  newUserData: userData
  info: optionsInfo
  apiIPs: string[]
  roomList: [number, number][]
}
interface server {
  path: string
  hostname: string
  port: number
  protocol: string
}
interface config {
  [index: string]: string | boolean | number | number[]
  defaultUserID: number
  serverURL: string
  eventRooms: number[]
  adminServerChan: string
}
interface userCollection {
  [index: string]: userData
}
interface userData {
  [index: string]: string | boolean | number | number[]
  nickname: string
  userName: string
  passWord: string
  biliUID: number
  accessToken: string
  refreshToken: string
  cookie: string
  status: boolean
}
interface optionsInfo {
  [index: string]: configInfoData
  defaultUserID: configInfoData
  serverURL: configInfoData
  eventRooms: configInfoData
  adminServerChan: configInfoData
  nickname: configInfoData
  userName: configInfoData
  passWord: configInfoData
  biliUID: configInfoData
  accessToken: configInfoData
  refreshToken: configInfoData
  cookie: configInfoData
  status: configInfoData
}
interface configInfoData {
  description: string
  tip: string
  type: string
  cognate?: string
}
/*******************
 ****** User ******
 *******************/
interface requestHeaders {
  [index: string]: string
}
declare class AppClient {
  static actionKey: string
  static platform: string
  static appKey: string
  static build: string
  static device: string
  static mobiApp: string
  static TS: number
  static RND: number
  static DeviceID: string
  static baseQuery: string
  static signQuery(params: string, ts?: boolean): string
  static signQueryBase(params?: string): string
  static status: typeof status
  captcha: string
  userName: string
  passWord: string
  biliUID: number
  accessToken: string
  refreshToken: string
  cookieString: string
  headers: requestHeaders
  init(): Promise<void>
  getCaptcha(): Promise<captchaResponse>
  login(): Promise<loginResponse>
  logout(): Promise<logoutResponse>
  refresh(): Promise<loginResponse>
}
declare class Online extends AppClient {
  uid: string
  userData: userData
  readonly nickname: string
  jar: any
  captchaJPEG: string
  readonly tokenQuery: string
  Start(): Promise<'captcha' | 'stop' | void>
  Stop(): void
  getOnlineInfo(roomID?: number): Promise<'captcha' | 'stop' | void>
}
type User = Online
/*******************
 **** dm_client ****
 *******************/
declare enum dmErrorStatus {
  'client' = 0,
  'danmaku' = 1,
  'timeout' = 2
}
interface DMclientOptions {
  roomID?: number
  userID?: number
  protocol?: DMclientProtocol
}
type DMclientProtocol = 'socket' | 'flash' | 'ws' | 'wss'
type DMerror = DMclientError | DMdanmakuError
interface DMclientError {
  status: dmErrorStatus.client | dmErrorStatus.timeout
  error: Error
}
interface DMdanmakuError {
  status: dmErrorStatus.danmaku
  error: TypeError
  data: Buffer
}
/*******************
 *** app_client ****
 *******************/
declare enum appStatus {
  'success' = 0,
  'captcha' = 1,
  'error' = 2,
  'httpError' = 3
}
/**
 * 公钥返回
 *
 * @interface getKeyResponse
 */
interface getKeyResponse {
  ts: number
  code: number
  data: getKeyResponseData
}
interface getKeyResponseData {
  hash: string
  key: string
}
/**
 * 验证返回
 *
 * @interface authResponse
 */
interface authResponse {
  ts: number
  code: number
  data: authResponseData
}
interface authResponseData {
  status: number
  token_info: authResponseTokeninfo
  cookie_info: authResponseCookieinfo
  sso: string[]
}
interface authResponseCookieinfo {
  cookies: authResponseCookieinfoCooky[]
  domains: string[]
}
interface authResponseCookieinfoCooky {
  name: string
  value: string
  http_only: number
  expires: number
}
interface authResponseTokeninfo {
  mid: number
  access_token: string
  refresh_token: string
  expires_in: number
}
/**
 * 注销返回
 *
 * @interface revokeResponse
 */
interface revokeResponse {
  message: string
  ts: number
  code: number
}
/**
 * 登录返回信息
 */
type loginResponse = loginResponseSuccess | loginResponseCaptcha | loginResponseError | loginResponseHttp
interface loginResponseSuccess {
  status: appStatus.success
  data: authResponse
}
interface loginResponseCaptcha {
  status: appStatus.captcha
  data: authResponse
}
interface loginResponseError {
  status: appStatus.error
  data: authResponse
}
interface loginResponseHttp {
  status: appStatus.httpError
  data: XHRresponse<getKeyResponse> | XHRresponse<authResponse> | undefined
}
/**
 * 登出返回信息
 */
type logoutResponse = revokeResponseSuccess | revokeResponseError | revokeResponseHttp
interface revokeResponseSuccess {
  status: appStatus.success
  data: revokeResponse
}
interface revokeResponseError {
  status: appStatus.error
  data: revokeResponse
}
interface revokeResponseHttp {
  status: appStatus.httpError
  data: XHRresponse<revokeResponse> | undefined
}
/**
 * 验证码返回信息
 */
type captchaResponse = captchaResponseSuccess | captchaResponseError
interface captchaResponseSuccess {
  status: appStatus.success
  data: Buffer
}
interface captchaResponseError {
  status: appStatus.error
  data: XHRresponse<Buffer> | undefined
}
/*******************
 ****** tools ******
 *******************/
/**
 * XHR返回
 *
 * @interface response
 * @template T
 */
interface XHRresponse<T> {
  response: {
    statusCode: number
  }
  body: T
}
/**
 * Server酱
 *
 * @interface serverChan
 */
interface serverChan {
  errno: number
  errmsg: string
  dataset: string
}
/*******************
 ** bilive_client **
 *******************/
/**
 * 消息格式
 *
 * @interface raffleMessage
 */
interface raffleMessage {
  cmd: 'smallTV' | 'raffle'
  roomID: number
  id: number
  type: string
  title: string
  time: number
  max_time: number
  time_wait: number
}
/**
 * 消息格式
 *
 * @interface lotteryMessage
 */
interface lotteryMessage {
  cmd: 'lottery'
  roomID: number
  id: number
  type: string
  title: string
  time: number
}
/**
 * 消息格式
 *
 * @interface beatStormMessage
 */
interface beatStormMessage {
  cmd: 'beatStorm'
  roomID: number
  id: number
  type: string
  title: string
  time: number
}
/**
 * 消息格式
 *
 * @interface systemMessage
 */
interface systemMessage {
  cmd: 'sysmsg'
  msg: string
}
type message = raffleMessage | lotteryMessage | beatStormMessage | systemMessage
/*******************
 **** listener *****
 *******************/
/**
 * 抽奖raffle检查
 *
 * @interface raffleCheck
 */
interface raffleCheck {
  code: number
  msg: string
  message: string
  data: raffleCheckData
}
interface raffleCheckData {
  last_raffle_id: number
  last_raffle_type: string
  asset_animation_pic: string
  asset_tips_pic: string
  list: raffleCheckDataList[]
}
interface raffleCheckDataList {
  raffleId: number
  title: string
  type: string
  from: string
  from_user: raffleCheckDataListFromuser
  time_wait: number
  time: number
  max_time: number
  status: number
  asset_animation_pic: string
  asset_tips_pic: string
}
interface raffleCheckDataListFromuser {
  uname: string
  face: string
}
/**
 * 抽奖lottery检查
 *
 * @interface lotteryCheck
 */
interface lotteryCheck {
  code: number
  msg: string
  message: string
  data: lotteryCheckData
}
interface lotteryCheckData {
  guard: lotteryCheckDataGuard[]
  storm: lotteryCheckDataStorm[]
}
interface lotteryCheckDataGuard {
  id: number
  sender: lotteryCheckDataSender
  keyword: string
  time: number
  status: number
  mobile_display_mode: number
  mobile_static_asset: string
  mobile_animation_asset: string
}
interface lotteryCheckDataStorm {
  id: number
  sender: lotteryCheckDataSender
  keyword: string
  time: number
  status: number
  mobile_display_mode: number
  mobile_static_asset: string
  mobile_animation_asset: string
  extra: lotteryCheckDataStormExtra
}
interface lotteryCheckDataStormExtra {
  num: number
  content: string
}
interface lotteryCheckDataSender {
  uid: number
  uname: string
  face: string
}
/**
 * 获取直播列表
 *
 * @interface getAllList
 */
interface getAllList {
  code: number
  msg: string
  message: string
  data: getAllListData
}
interface getAllListData {
  interval: number
  module_list: getAllListDataList[]
}
type getAllListDataList = getAllListDataModules | getAllListDataRooms
interface getAllListDataModules {
  module_info: getAllListDataModuleInfo
  list: getAllListDataModuleList[]
}
interface getAllListDataRooms {
  module_info: getAllListDataRoomInfo
  list: getAllListDataRoomList[]
}
interface getAllListDataBaseInfo {
  id: number
  type: number
  pic: string
  title: string
  link: string
}
interface getAllListDataModuleInfo extends getAllListDataBaseInfo {
  count?: number
}
interface getAllListDataRoomInfo extends getAllListDataBaseInfo {
  type: 6 | 9
}
interface getAllListDataModuleList {
  id: number
  pic: string
  link: string
  title: string
}
interface getAllListDataRoomList {
  roomid: number
  title: string
  uname: string
  online: number
  cover: string
  link: string
  face: string
  area_v2_parent_id: number
  area_v2_parent_name: string
  area_v2_id: number
  area_v2_name: string
  play_url: string
  current_quality: number
  accept_quality: number[]
  broadcast_type: number
  pendent_ld: string
  pendent_ru: string
  rec_type: number
  pk_id: number
}
/*******************
 ***** online ******
 *******************/
/**
 * 在线心跳返回
 *
 * @interface userOnlineHeart
 */
interface userOnlineHeart {
  code: number
  msg: string
}
/*******************
 ***** options *****
 *******************/
interface Options {
  _: options
  user: Map<string, User>
  whiteList: Set<string>
  shortRoomID: Map<number, number>
  longRoomID: Map<number, number>
  init(): void
  save(): Promise<options>
}
/*******************
 ****** plugin *****
 *******************/
interface IPlugin {
  name: string
  description: string
  version: string
  author: string
  loaded: boolean
  load?({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }): Promise<void>
  start?({ options, users }: { options: options, users: Map<string, User> }): Promise<void>
  loop?({ cst, cstMin, cstHour, cstString, options, users }: { cst: Date, cstMin: number, cstHour: number, cstString: string, options: options, users: Map<string, User> }): Promise<void>
  msg?({ message, options, users }: { message: raffleMessage | lotteryMessage | beatStormMessage, options: options, users: Map<string, User> }): Promise<void>
}