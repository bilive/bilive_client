// index
/**
 * 应用设置
 *
 * @interface options
 */
interface _options {
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
  [index: string]: number | string | number[]
  defaultUserID: number
  defaultRoomID: number
  eventRooms: number[]
  adminServerChan: string
  raffleDelay: number
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
  refreshToken: string
  cookie: string
  status: boolean
  doSign: boolean
  treasureBox: boolean
  eventRoom: boolean
  silver2coin: boolean
  raffle: boolean
  sendGift: boolean
  sendGiftRoom: number
  signGroup: boolean
}
interface optionsInfo {
  [index: string]: configInfoData
  defaultUserID: configInfoData
  defaultRoomID: configInfoData
  eventRooms: configInfoData
  adminServerChan: configInfoData
  raffleDelay: configInfoData
  rafflePause: configInfoData
  nickname: configInfoData
  userName: configInfoData
  passWord: configInfoData
  biliUID: configInfoData
  accessToken: configInfoData
  refreshToken: configInfoData
  cookie: configInfoData
  status: configInfoData
  doSign: configInfoData
  treasureBox: configInfoData
  eventRoom: configInfoData
  silver2coin: configInfoData
  raffle: configInfoData
  sendGift: configInfoData
  sendGiftRoom: configInfoData
  signGroup: configInfoData
}
interface configInfoData {
  description: string
  tip: string
  type: string
}
// bilive_client
/**
 * 消息格式
 *
 * @interface message
 */
interface message {
  cmd: 'smallTV' | 'raffle' | 'lottery' | 'appLighten'
  roomID: number
  id: number
}
/**
 * 抽奖raffle信息
=======
 * 抽奖信息
>>>>>>> master
 *
 * @interface raffleMSG
 * @extends {message}
 */
interface raffleMSG extends message {
  cmd: 'smallTV' | 'raffle'
  time: number
}
/**
 * 抽奖lottery信息
 *
 * @interface lotteryMSG
=======
 * app快速抽奖信息
 *
 * @interface appLightenMSG
>>>>>>> master
 * @extends {message}
 */
interface lotteryMSG extends message {
  cmd: 'appLighten' | 'lottery'
  type: string
}
// listener
/**
 * 搜索总督房间
 *
 * @interface searchID
 */
interface searchID {
  code: number
  msg: string
  result: searchIDres
}
interface searchIDres {
  live_user: User_res[]
}
interface User_res {
  roomid: number
  uid: number
}
/**
 * 抽奖raffle检查
=======
 * 抽奖检查
>>>>>>> master
 *
 * @interface raffleCheck
 */
interface raffleCheck {
  code: number
  msg: string
  message: string
  data: raffleCheckList
}
interface raffleCheckList {
  from: string
  list: raffleCheckData[]
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
 * 抽奖lottery检查
 *
 * @interface lotteryCheck
=======
 * 快速抽奖检查
 *
 * @interface lightenCheck
>>>>>>> master
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
// raffle
/**
 * 抽奖设置
 *
 * @interface raffleOptions
 */
interface raffleOptions {
  type?: string
  time?: number
  raffleId: number
  roomID: number
  user: any
}
/**
 * 模拟进入房间，规避封禁
 *
 * @interface entryCheck0
 */
interface entryCheck0 {
  code: number
  msg: string
  message: string
  data: entrydata0
}
interface entrydata0 {
  encrypted: boolean
  hidden_till: number
  is_hidden: boolean
  is_locked: boolean
  is_portrait: boolean
  live_status: number
  lock_till: number
  need_p2p: number
  pwd_verified: boolean
  room_id: number
  short_id: number
  uid: number
}
/**
 * 模拟进入房间，规避封禁
 *
 * @interface entryCheck1
 */
interface entryCheck1 {
  code: number
  msg: string
  message: string
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
=======
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
>>>>>>> master
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
/**
 * 抽奖lottery
 *
 * @interface lotteryReward
 */
interface lotteryReward {
  code: number
  msg: string
  message: string
  data: lotteryRewardData
}
interface lotteryRewardData {
  id: number
  type: string
  award_type: number
  time: number
  message: string
  from: string
  award_list: lotteryRewardDataAwardlist[]
}
interface lotteryRewardDataAwardlist {
  name: string
  img: string
  type: number
  content: string
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
 * 房间信息app
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
 * 房间信息
 *
 * @interface roomInit
 */
interface roomInit {
  code: number
  msg: string
  message: string
  data: roomInitData
}
interface roomInitData {
  encrypted: boolean
  hidden_till: number
  is_hidden: boolean
  is_locked: boolean
  lock_till: number
  need_p2p: number
  pwd_verified: boolean
  room_id: number
  short_id: number
  uid: number
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
 * 包裹信息WEB
 *
 * @interface bagInfoW
 */
interface bagInfoW {
  code: number
  msg: string
  message: string
  data: bagInfoWData
}
interface bagInfoWData {
  list: bagWlist[]
  time: number
}
interface bagWlist {
  bag_id: number
  expire_at: number
  gift_id: number
  gift_name: string
  gift_num: number
  gift_type: number
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
 * 佩戴勋章信息
 *
 * @interface MInfo
 */
interface MInfo {
  code: number
  msg: string
  message: string
  data: MData
}
interface MData {
  day_limit: number
  roominfo: Mroominfo
  today_feed: string
  uid: number
}
interface Mroominfo {
  room_id: number
  uid: number
}
/**
 * 赠送包裹礼物WEB
 *
 * @interface sendBagW
 */
interface sendBagW {
  code: number
  msg: string
  message: string
  data: sendBagWData
}
interface sendBagWData {
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
/**
 * 银瓜子兑换硬币返回
 *
 * @interface silver2coin
 */
interface silver2coin {
  code: number
  msg: string
  message: string
  data: silver2coinData;
}
interface silver2coinData {
  silver: string
  gold: string
  tid: string
  coin: number
}
/**
 * 硬币兑换银瓜子返回
 *
 * @interface coin2silver
 */
interface coin_status {
  code: number
  msg: string
  message: string
  data: coin_statusData;
}
interface coin_statusData {
  coin_2_silver_left: number
  vip: number
}
interface coin2silver {
  code: number
  msg: string
  message: string
  data: coin2silverData;
}
interface coin2silverData {
  silver: number
}
/**
 * 每日任务
 *
 * @interface taskInfo
 */
interface taskInfo {
  code: number
  msg: string
  data: taskInfoData
}
interface taskInfoData {
  [index: string]: taskInfoDoublewatchinfo
}
interface taskInfoDoublewatchinfo {
  task_id: string | undefined
}
/**
 * 兑换扭蛋币
 *
 * @interface capsule
 */
interface capsule {
  code: number
  msg: string
  data: capsuleData | any[]
}
interface capsuleData {
  capsule: SEND_GIFT_data_capsule
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
/**
 * 个人信息
 *
 * @interface UserInfo
 */
 interface UserInfo {
   code: number
   msg: string
   data: UserInfoData
 }
 interface UserInfoData {
   uname: string
   silver: number
   gold: number
   user_level: number
   user_intimacy: number
   user_next_intimacy: number
   user_level_rank: number
   billCoin: number
 }
 /**
  * 勋章信息
  *
  * @interface MedalInfo
  */
  interface MedalInfo {
    code: number
    msg: string
    data: MedalInfoData
  }
  interface MedalInfoData {
    medalCount: number
    count: number
    fansMedalList: MedalInfoDataInfo[]
  }
  interface MedalInfoDataInfo {
    status: number
    level: number
    intimacy: number
    next_intimacy: number
    medal_name: string
    rank: number
    target_id: number
    uid: number
  }
