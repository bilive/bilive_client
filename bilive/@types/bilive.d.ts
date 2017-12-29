// index
/**
 * 应用设置
 * 
 * @interface options
 */
interface _options {
  server: server
  apiIPs: string[]
  config: config
  user: userCollection
  newUserData: userData
  info: optionsInfo
}
interface server {
  path: string
  hostname: string
  port: number
  protocol: string
}
interface config {
  [index: string]: number | string | number[]
  defaultUserID: number
  defaultRoomID: number
  eventRooms: number[]
}
interface userCollection {
  [index: string]: userData
}
interface userData {
  [index: string]: string | boolean | number
  nickname: string
  userName: string
  passWord: string
  biliUID: number
  accessToken: string
  cookie: string
  status: boolean
  doSign: boolean
  treasureBox: boolean
  eventRoom: boolean
  smallTV: boolean
  raffle: boolean
  sendGift: boolean
  sendGiftRoom: number
  signGroup: boolean
}
interface optionsInfo {
  defaultUserID: configInfoData
  defaultRoomID: configInfoData
  apiOrigin: configInfoData
  apiKey: configInfoData
  eventRooms: configInfoData
  nickname: configInfoData
  userName: configInfoData
  passWord: configInfoData
  biliUID: configInfoData
  accessToken: configInfoData
  cookie: configInfoData
  status: configInfoData
  doSign: configInfoData
  treasureBox: configInfoData
  eventRoom: configInfoData
  smallTV: configInfoData
  raffle: configInfoData
  sendGift: configInfoData,
  sendGiftRoom: configInfoData,
  signGroup: configInfoData
}
interface configInfoData {
  description: string
  tip: string
  type: string
}
// app_client
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
 * 登录返回
 * 
 * @interface loginResponse
 */
interface loginResponse {
  ts: number
  code: number
  data: loginResponseData
}
interface loginResponseData {
  mid: number
  access_token: string
  refresh_token: string
  expires_in: number
}
/**
 * 用户名, 密码
 * 
 * @interface userLogin
 */
interface userLogin {
  userName: string
  passWord: string
}
// bilive_client
/**
 * 消息格式
 * 
 * @interface message
 */
interface message {
  cmd: 'smallTV' | 'raffle' | 'lighten' | 'appLighten'
  roomID: number
  id: number
}
/**
 * 抽奖信息
 * 
 * @interface raffleMSG
 * @extends {message}
 */
interface raffleMSG extends message {
  cmd: 'smallTV' | 'raffle' | 'lighten'
}
/**
 * app快速抽奖信息
 * 
 * @interface appLightenMSG
 * @extends {message}
 */
interface appLightenMSG extends message {
  cmd: 'appLighten'
  type: string
}
// listener

/**
 * 抽奖检查
 * 
 * @interface raffleCheck
 */
interface raffleCheck {
  code: number
  msg: string
  message: string
  data: raffleCheckData[]
}
interface raffleCheckData {
  raffleId: number
  type: 'small_tv' | string
  form: string
  from_user: {
    uname: string
    face: string
  }
  time: number
  status: number
}
/**
 * 快速抽奖检查
 * 
 * @interface lightenCheck
 */
interface lightenCheck {
  code: number
  msg: string
  message: string
  data: lightenCheckData[]
}
interface lightenCheckData {
  type: string
  lightenId: number
  time: number
  status: boolean
}
// raffle
/**
 * 抽奖设置
 * 
 * @interface raffleOptions
 */
interface raffleOptions {
  type?: string
  raffleId: number
  roomID: number
  User: any
}
/**
 * 参与抽奖信息
 * 
 * @interface raffleJoin
 */
interface raffleJoin {
  code: number
  msg: string
  message: string
  data: raffleJoinData
}
interface raffleJoinData {
  face?: string
  from: string
  type: 'small_tv' | string
  roomid?: string
  raffleId: number | string
  time: number
  status: number
}
/**
 * 抽奖结果信息
 * 
 * @interface raffleReward
 */
interface raffleReward {
  code: number
  msg: string
  message: string
  data: raffleRewardData
}
interface raffleRewardData {
  gift_id: number
  gift_name: string
  gift_num: number
  gift_from: string
  gift_type: number
  gift_content: string
  status?: number
}
/**
 * 快速抽奖结果信息
 * 
 * @interface lightenReward
 */
interface lightenReward {
  code: number
  msg: string
  message: string
  data: [number]
}
/**
 * App快速抽奖结果信息
 * 
 * @interface appLightenReward
 */
interface appLightenReward {
  code: number
  msg: string
  message: string
  data: appLightenRewardData
}
interface appLightenRewardData {
  gift_img: string
  gift_desc: string
}
// online
/**
 * 签到信息
 * 
 * @interface signInfo
 */
interface signInfo {
  code: number
  msg: string
  data: signInfoData
}
interface signInfoData {
  text: string
  status: number
  allDays: string
  curMonth: string
  newTask: number
  hadSignDays: number
  remindDays: number
}
/**
 * 在线心跳返回
 * 
 * @interface userOnlineHeart
 */
interface userOnlineHeart {
  code: number
  msg: string
}
/**
 * 在线领瓜子宝箱
 * 
 * @interface currentTask
 */
interface currentTask {
  code: number
  msg: string
  data: currentTaskData
}
interface currentTaskData {
  minute: number
  silver: number
  time_start: number
  time_end: number
}
/**
 * 领瓜子答案提交返回
 * 
 * @interface award
 */
interface award {
  code: number
  msg: string
  data: awardData
}
interface awardData {
  silver: number
  awardSilver: number
  isEnd: number
}
/**
 * 房间信息
 * 
 * @interface roomInfo
 */
interface roomInfo {
  code: number
  data: roomInfoData
}
interface roomInfoData {
  room_id: number
  mid: number
  event_corner: roomInfoDataEvent[]
}
interface roomInfoDataEvent {
  event_type: string
  event_img: string
}
/**
 * 分享房间返回
 * 
 * @interface shareCallback
 */
interface shareCallback {
  code: number
  msg: string
  message: string
}
/**
 * 每日包裹
 * 
 * @interface getBagGift
 */
interface getBagGift {
  code: number
}
/**
 * 包裹信息
 * 
 * @interface bagInfo
 */
interface bagInfo {
  code: number
  msg: string
  message: string
  data: bagInfoData[]
}
interface bagInfoData {
  id: number
  uid: number
  gift_id: number
  gift_num: number
  expireat: number
  gift_type: number
  gift_name: string
  gift_price: string
  img: string
  count_set: string
  combo_num: number
  super_num: number
}
/**
 * 赠送包裹礼物
 * 
 * @interface sendBag
 */
interface sendBag {
  code: number
  msg: string
  message: string
  data: sendBagData
}
interface sendBagData {
  tid: string
  uid: number
  uname: string
  ruid: number
  rcost: number
  gift_id: number
  gift_type: number
  gift_name: string
  gift_num: number
  gift_action: string
  gift_price: number
  coin_type: string
  total_coin: number
  metadata: string
  rnd: string
}
/**
 * 应援团
 * 
 * @interface linkGroup
 */
interface linkGroup {
  code: number
  msg: string
  message: string
  data: linkGroupData
}
interface linkGroupData {
  list: linkGroupInfo[]
}
interface linkGroupInfo {
  group_id: number
  owner_uid: number
  owner_name: string
  group_type: number
  group_level: number
  group_cover: string
  group_name: string
  group_notice: string
  group_status: number
}
/**
 * 应援团签到返回
 * 
 * @interface signGroup
 */
interface signGroup {
  code: number
  msg: string
  message: string
  data: signGroupData
}
interface signGroupData {
  add_num: number
  status: number
}