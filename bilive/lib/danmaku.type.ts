/**
 * 弹幕基本格式
 * 
 * @export
 * @interface danmuJson
 */
export interface danmuJson {
  cmd: string
  roomid: number
  _roomid: number
}
/**
 * 弹幕消息
 * 
 * @export
 * @interface DANMU_MSG
 * @extends {danmuJson}
 */
export interface DANMU_MSG extends danmuJson {
  info:
  [
    [
      number,
      number, // 模式
      number, // 字号
      number, // 颜色
      number, // 发送时间
      number | string, // rnd
      number,
      string,
      number
    ],
    string, // 弹幕
    [
      number, // 用户uid
      string, // 用户名
      number, // 管理员
      number, // 月费老爷
      number, // 年费老爷
      number, // rank
      number
    ],
    [
      number, // 徽章等级
      string, // 勋章名
      string, // 主播名
      number | string, // 直播间, 字符串的貌似是原始房间号
      number,
      string // 特殊样式
    ],
    [
      number, // 用户等级
      number,
      number,
      number | string// 等级排名, 具体值为number
    ],
    [
      string, // 头衔标识
      string // 头衔图片
    ],
    number, // teamid
    number // 舰队等级
  ]
}
/**
 * 礼物消息, 用户包裹和瓜子的数据直接在里面, 真是窒息
 * 
 * @export
 * @interface SEND_GIFT
 * @extends {danmuJson}
 */
export interface SEND_GIFT extends danmuJson {
  data: SEND_GIFT_Data
}
interface SEND_GIFT_Data_Base {
  giftName: string // 道具文案
  num: number // 数量
  uname: string // 用户名
  rcost: number // 主播积分
  uid: number // 用户uid
  top_list: SEND_GIFT_Data_top_list[] | false, // 更新排行
  timestamp: number // 用户提供的rnd, 正常为10位
  giftId: number // 礼物id
  giftType: number // 礼物类型(活动)
  action: '喂食' | '赠送'
  super: number // 连击
  price: number // 价值
  rnd: number | string
  newMedal: 0 | 1 // 是否获取到新徽章
  newTitle: number // 是否获取到新头衔
  medal: SEND_GIFT_Data_medal | 0 // 新徽章
  title: string // 新头衔
  beatId: 0 | ''
  biz_source: 'live'
  metadata: string
  remain: number // 道具包裹剩余数量
  eventScore: number // 主播活动积分, 普通道具为0
  eventNum: number // 道具包裹剩余数量
  notice_msg: string[] // SYS_GIFT msg
  capsule: SEND_GIFT_Data_capsule // 扭蛋
}
export interface SEND_GIFT_Data extends SEND_GIFT_Data_Base {
  smalltv_msg?: SYS_MSG[]  // 小电视
  specialGift?: SPECIAL_GIFT_Data | boolean // 特殊礼物
}
export interface SEND_GIFT_Data extends SEND_GIFT_Data_Base {
  gold: number | string // 金瓜子, number表示消耗此物品
  silver: number | string // 银瓜子, number表示消耗此物品
}
export interface SEND_GIFT_Data extends SEND_GIFT_Data_Base {
  newMedal: 1
  medal: SEND_GIFT_Data_medal
  newMedalName: string // 新徽章名
  addFollow?: number // 新关注
}
export interface SEND_GIFT_Data_top_list {
  uid: number // 用户uid
  uname: string // 用户名
  coin: number // 投喂总数
  face: string // 头像地址
  guard_level: string | 0 // 舰队等级
}
export interface SEND_GIFT_Data_medal {
  medalId: number | string // 徽章id
  medalName: string // 徽章名
  level: number // 徽章等级
}
export interface SEND_GIFT_Data_capsule {
  normal: SEND_GIFT_Data_capsule_Data // 普通扭蛋
  colorful: SEND_GIFT_Data_capsule_Data // 梦幻扭蛋
}
export interface SEND_GIFT_Data_capsule_Data {
  coin: number // 数量
  change: number // 数量发生变化
  progress: {
    now: number // 当前送出道具价值
    max: number // 需要的道具价值
  }
}
/**
 * 欢迎消息
 * 
 * @export
 * @interface WELCOME
 * @extends {danmuJson}
 */
export interface WELCOME extends danmuJson {
  data: WELCOME_Data
}
interface WELCOME_Data_Base {
  uid: number // 用户uid
  uname: string // 用户名
  isadmin: number // 管理员
}
export interface WELCOME_Data extends WELCOME_Data_Base {
  vip: number // 月费老爷
}
export interface WELCOME_Data extends WELCOME_Data_Base {
  svip: number // 年费老爷
}
/**
 * 欢迎消息-舰队
 * 
 * @export
 * @interface WELCOME_GUARD
 * @extends {danmuJson}
 */
export interface WELCOME_GUARD extends danmuJson {
  data: WELCOME_GUARD_Data
}
export interface WELCOME_GUARD_Data {
  uid: number // 用户uid
  username: string // 用户名
  guard_level: number // 舰队等级
  water_god: number
}
/**
 * 欢迎消息-活动
 * 
 * @export
 * @interface WELCOME_ACTIVITY
 * @extends {danmuJson}
 */
export interface WELCOME_ACTIVITY extends danmuJson {
  data: WELCOME_ACTIVITY_Data
}
export interface WELCOME_ACTIVITY_Data {
  uid: number // 用户uid
  uname: string // 用户名
  type: string // 活动标识
}
/**
 * 舰队购买
 * 
 * @export
 * @interface GUARD_BUY
 * @extends {danmuJson}
 */
export interface GUARD_BUY extends danmuJson {
  data: GUARD_BUY_Data
}
export interface GUARD_BUY_Data {
  uid: number // 用户uid
  username: string // 用户名
  guard_level: number // 舰队等级
  num: number // 购买数量
}
/**
 * 舰队消息
 * 
 * @export
 * @interface GUARD_MSG
 * @extends {danmuJson}
 */
export interface GUARD_MSG extends danmuJson {
  msg: string // 消息内容
}
/**
 * 系统消息, 广播
 * 
 * @export
 * @interface SYS_MSG
 * @extends {danmuJson}
 */
export interface SYS_MSG extends danmuJson {
  msg: string // 消息内容
  rep: number
  url: string // 点击跳转的地址
}
export interface SYS_MSG extends danmuJson {
  msg: string // 消息内容
  msg_text: string // 同msg
  rep: number
  styleType: number // 2为小电视通知
  url: string // 点击跳转的地址
  roomid: number // 房间号
  real_roomid: number // 原始房间号
  rnd: number
  tv_id: string // 小电视编号
}
/**
 * 系统礼物消息, 广播
 * 
 * @export
 * @interface SYS_GIFT
 * @extends {danmuJson}
 */
export interface SYS_GIFT extends danmuJson {
  msg: string // 消息内容
  rnd: number
  uid: number
  msg_text: string // 同msg, 无标记符号
}
export interface SYS_GIFT extends danmuJson {
  msg: string // 消息内容
  msg_text: string // 同msg
  tips: string // 同msg
  url: string // 点击跳转的地址
  roomid: number // 短房间号
  real_roomid: number // 原始房间号
  giftId: number // 礼物id
  msgTips: number
}
/**
 * 活动相关
 * 
 * @export
 * @interface EVENT_CMD
 * @extends {danmuJson}
 */
export interface EVENT_CMD extends danmuJson {
  data: EVENT_CMD_Data
}
export interface EVENT_CMD_Data extends danmuJson {
  event_type: string // 活动标识
  event_img: string // 显示图片
}
/**
 * 快速抽奖
 * 
 * @export
 * @interface LIGHTEN_START
 * @extends {danmuJson}
 */
export interface LIGHTEN_START extends danmuJson {
  data: LIGHTEN_START_Data
}
export interface LIGHTEN_START_Data extends danmuJson {
  type: string // 活动标识
  lightenId: number // 参与id
  time: number // 持续时间
}
/**
 * 活动快捷参与结束
 * 
 * @export
 * @interface LIGHTEN_END
 * @extends {danmuJson}
 */
export interface LIGHTEN_END extends danmuJson {
  data: LIGHTEN_END_Data
}
export interface LIGHTEN_END_Data extends danmuJson {
  type: string // 活动标识
  lightenId: number // 参与id
}
/**
 * 特殊礼物消息
 * 
 * @export
 * @interface SPECIAL_GIFT
 * @extends {danmuJson}
 */
export interface SPECIAL_GIFT extends danmuJson {
  data: SPECIAL_GIFT_Data
}
export interface SPECIAL_GIFT_Data {
  '39': SPECIAL_GIFT_Data_BeatStorm // 节奏风暴
}
interface SPECIAL_GIFT_Data_BeatStorm_Base {
  action: 'start' | 'end'
}
export interface SPECIAL_GIFT_Data_BeatStorm extends SPECIAL_GIFT_Data_BeatStorm_Base {
  id: string // 参与id
  num: number // 节奏数量
  time: number // 节奏持续时间
  content: string // 节奏内容
  hadJoin: number // 是否已经参与
  action: 'start'
}
export interface SPECIAL_GIFT_Data_BeatStorm { }
/**
 * 房间封禁消息
 * 
 * @export
 * @interface ROOM_BLOCK_MSG
 * @extends {danmuJson}
 */
export interface ROOM_BLOCK_MSG extends danmuJson {
  uid: number // 用户uid
  uname: string // 用户名
}
/**
 * 房间开启禁言
 * 
 * @export
 * @interface ROOM_SILENT_ON
 * @extends {danmuJson}
 */
export interface ROOM_SILENT_ON extends danmuJson {
  type: 'level' | 'medal' | 'member' // 等级 | 勋章 | 全员
  level: number // 禁言等级
  second: number // 禁言时间, -1为本次
}
/**
 * 房间禁言结束
 * 
 * @export
 * @interface ROOM_SILENT_OFF
 * @extends {danmuJson}
 */
export interface ROOM_SILENT_OFF extends danmuJson {
  data: any[]
}
/**
 * 准备直播
 * 
 * @export
 * @interface PREPARING
 * @extends {danmuJson}
 */
export interface PREPARING extends danmuJson {
  round?: 1
}
/**
 * 开始直播
 * 
 * @export
 * @interface LIVE
 * @extends {danmuJson}
 */
export interface LIVE extends danmuJson { }
/**
 * 开始手机直播
 * 
 * @export
 * @interface MOBILE_LIVE
 * @extends {danmuJson}
 */
export interface MOBILE_LIVE extends danmuJson {
  type: 1
}
/**
 * 直播强制切断
 * 
 * @export
 * @interface CUT_OFF
 * @extends {danmuJson}
 */
export interface CUT_OFF extends danmuJson {
  msg: string // 切断原因
}
/**
 * 直播封禁
 * 
 * @export
 * @interface ROOM_LOCK
 * @extends {danmuJson}
 */
export interface ROOM_LOCK extends danmuJson {
  expire: string // 封禁时间 yyyy-MM-dd HH:mm:ss
}
/**
 * 小电视抽奖开始
 * 
 * @export
 * @interface TV_START
 * @extends {danmuJson}
 */
export interface TV_START extends danmuJson {
  data: TV_START_Data
}
export interface TV_START_Data extends danmuJson {
  id: string // 小电视编号
  dtime: number // 持续时间
  msg: SYS_MSG
}
/**
 * 小电视抽奖结束
 * 
 * @export
 * @interface TV_END
 * @extends {danmuJson}
 */
export interface TV_END extends danmuJson {
  data: TV_END_Data
}
export interface TV_END_Data extends danmuJson {
  id: number // 小电视编号
  uname: string // 中奖者
  sname: string // 赠送者
  giftName: string // 10W银瓜子 | 抱枕
  mobileTips: string // 中奖消息
}
/**
 * 抽奖开始
 * 
 * @export
 * @interface RAFFLE_START
 * @extends {danmuJson}
 */
export interface RAFFLE_START extends danmuJson {
  data: RAFFLE_START_Data
}
export interface RAFFLE_START_Data extends danmuJson {
  raffleId: number // 编号
  raffleType: string // 文案
  time: number // 持续时间
}
/**
 * 抽奖结束
 * 
 * @export
 * @interface RAFFLE_END
 * @extends {danmuJson}
 */
export interface RAFFLE_END extends danmuJson {
  data: RAFFLE_END_Data
}
export interface RAFFLE_END_Data extends danmuJson {
  raffleId: number // 编号
  raffleType: string // 文案
}
/**
 * 管理员变更
 * 
 * @export
 * @interface ROOM_ADMINS
 * @extends {danmuJson}
 */
export interface ROOM_ADMINS extends danmuJson {
  uids: number[] // 管理员列表
}
/**
 * 房间设置变更
 * 
 * @export
 * @interface CHANGE_ROOM_INFO
 * @extends {danmuJson}
 */
export interface CHANGE_ROOM_INFO extends danmuJson {
  background: string // 背景图片
}
export interface DRAW_UPDATE extends danmuJson {
  data: DRAW_UPDATE_data
}
export interface DRAW_UPDATE_data extends danmuJson {
  x_min: number
  x_max: number
  y_min: number
  y_max: number
  color: string
}