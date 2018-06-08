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
  eventRooms: number[]
  adminServerChan: string
  raffleDelay: number
  rafflePause: number[]
  droprate: number
  calcGiftTime: string
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
  eventRooms: configInfoData
  adminServerChan: configInfoData
  raffleDelay: configInfoData
  rafflePause: configInfoData
  droprate: configInfoData
  calcGiftTime: configInfoData
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
  cognate?: string
}
// 礼物统计相关
interface giftNameNum {
  name: string
  number: giftHas
}
interface userNickGift {
  nickname: string
  gift: userGiftID
}
interface giftHas {
  all: number
  twoDay: number
  oneDay: number
}
type giftList = Map<number, giftNameNum>
type userGiftList = Map<string, userNickGift>
type userGiftID = Map<number, giftHas>
// bilive_client
/**
 * 消息格式
 * 
 * @interface message
 */
interface message {
  cmd: 'smallTV' | 'raffle' | 'lottery'
  roomID: number
  id: number
  type: string
  title: string
  time: number
}
// listener
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
// raffle
/**
 * 抽奖设置
 * 
 * @interface raffleOptions
 */
interface raffleOptions extends message {
  raffleId: number
  user: any
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
  raffleId: number
  type: string
  gift_id: number
  gift_name: string
  gift_num: number
  gift_from: string
  gift_type: number
  gift_content: string
  status?: number
}
type raffleAward = raffleReward
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
 * 房间信息
 * 
 * @interface roomInit
 */
interface roomInit {
  code: number
  msg: string
  message: string
  data: roomInitDataData
}
interface roomInitDataData {
  room_id: number
  short_id: number
  uid: number
  need_p2p: number
  is_hidden: boolean
  is_locked: boolean
  is_portrait: boolean
  live_status: number
  hidden_till: number
  lock_till: number
  encrypted: boolean
  pwd_verified: boolean
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