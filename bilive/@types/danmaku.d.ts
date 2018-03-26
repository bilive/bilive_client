/**
 * 弹幕基本格式
 * 
 * @interface danmuJson
 */
interface danmuJson {
  /** 关键字 */
  cmd: string
  roomid?: number
  /** dm_client自动添加 */
  _roomid: number
}
/**
 * 弹幕消息
 * {"info":[[0,5,25,16738408,1517306023,1405289835,0,"c23b254e",0],"好想抱回家",[37089851,"Dark2笑",0,1,1,10000,1,"#7c1482"],[17,"言叶","枫言w",367,16752445,"union"],[35,0,10512625,">50000"],["title-140-2","title-140-2"],0,1,{"uname_color":"#7c1482"}],"cmd":"DANMU_MSG","_roomid":1175880}
 * 
 * @interface DANMU_MSG
 * @extends {danmuJson}
 */
interface DANMU_MSG extends danmuJson {
  info: DANMU_MSG_info
}
interface DANMU_MSG_info extends Array<number | string | DANMU_MSG_info_danmu | DANMU_MSG_info_user | DANMU_MSG_info_medal | DANMU_MSG_info_rank | DANMU_MSG_info_other> {
  /** 弹幕信息 */
  0: DANMU_MSG_info_danmu
  /** 弹幕内容 */
  1: string
  /** 用户信息 */
  2: DANMU_MSG_info_user
  /** 用户徽章 */
  3: DANMU_MSG_info_medal
  /** 用户排行 */
  4: DANMU_MSG_info_rank
  /** teamid */
  5: number
  /** 舰队等级 */
  6: number
  7: DANMU_MSG_info_other
}
interface DANMU_MSG_info_danmu extends Array<number | string> {
  0: number
  /** 模式 */
  1: number
  /** 字号 */
  2: number
  /** 颜色 */
  3: number
  /** 发送时间 */
  4: number
  /** rnd */
  5: number | string
  6: number
  /** uid crc32 */
  7: string
  8: number
}
interface DANMU_MSG_info_user extends Array<number | string> {
  /** 用户uid */
  0: number
  /** 用户名 */
  1: string
  /** 是否为管理员 */
  2: 0 | 1
  /** 是否为月费老爷 */
  3: 0 | 1
  /** 是否为年费老爷 */
  4: 0 | 1
  /** 直播间排行 */
  5: number
  6: number
  /** #32进制颜色代码 */
  7: string
}
interface DANMU_MSG_info_medal extends Array<number | string> {
  /** 徽章等级 */
  0: number
  /** 勋章名 */
  1: string
  /** 主播名 */
  2: string
  /** 直播间, 字符串的貌似是原始房间号 */
  3: number | string
  4: number,
  /** 特殊样式 */
  5: 'union' | string
}
interface DANMU_MSG_info_rank extends Array<number | string> {
  /** 用户等级 */
  0: number
  1: number
  2: number
  /** 等级排名, 具体值为number */
  3: number | string
}
interface DANMU_MSG_info_title extends Array<string> {
  /** 头衔标识 */
  0: string
  /** 头衔图片 */
  1: string
}
interface DANMU_MSG_info_other {
  /** #32进制颜色代码 */
  uname_color: string
}
/**
 * 礼物消息, 用户包裹和瓜子的数据直接在里面, 真是窒息
 * {"cmd":"SEND_GIFT","data":{"giftName":"B坷垃","num":1,"uname":"Vilitarain","rcost":28963232,"uid":2081485,"top_list":[{"uid":3091444,"uname":"丶你真难听","face":"http://i1.hdslb.com/bfs/face/b1e39bae99efc6277b95993cd2a0d7c176b52ce2.jpg","rank":1,"score":1657600,"guard_level":3,"isSelf":0},{"uid":135813741,"uname":"EricOuO","face":"http://i2.hdslb.com/bfs/face/db8cf9a9506d2e3fe6dcb3d8f2eee4da6c0e3e2d.jpg","rank":2,"score":1606200,"guard_level":2,"isSelf":0},{"uid":10084110,"uname":"平凡无奇迷某人","face":"http://i2.hdslb.com/bfs/face/df316f596d7dcd8625de7028172027aa399323af.jpg","rank":3,"score":1333100,"guard_level":3,"isSelf":0}],"timestamp":1517306026,"giftId":3,"giftType":0,"action":"赠送","super":1,"price":9900,"rnd":"1517301823","newMedal":1,"newTitle":0,"medal":{"medalId":"397","medalName":"七某人","level":1},"title":"","beatId":"0","biz_source":"live","metadata":"","remain":0,"gold":100,"silver":77904,"eventScore":0,"eventNum":0,"smalltv_msg":[],"specialGift":null,"notice_msg":[],"capsule":{"normal":{"coin":68,"change":1,"progress":{"now":1100,"max":10000}},"colorful":{"coin":0,"change":0,"progress":{"now":0,"max":5000}}},"addFollow":0,"effect_block":0},"_roomid":50583}
 * 
 * @interface SEND_GIFT
 * @extends {danmuJson}
 */
interface SEND_GIFT extends danmuJson {
  data: SEND_GIFT_data
}
interface SEND_GIFT_data {
  /** 道具文案 */
  giftName: string
  /** 数量 */
  num: number
  /** 用户名 */
  uname: string
  /** 主播积分 */
  rcost: number
  /** 用户uid */
  uid: number
  /** 更新排行 */
  top_list: SEND_GIFT_data_top_list[]
  /** 用户提供的rnd, 正常为10位 */
  timestamp: number
  /** 礼物id */
  giftId: number
  /** 礼物类型(普通, 弹幕, 活动) */
  giftType: number
  action: '喂食' | '赠送'
  /** 高能 */
  super: 0 | 1
  /** 价值 */
  price: number
  rnd: string
  /** 是否获取到新徽章 */
  newMedal: 0 | 1
  /** 是否获取到新头衔 */
  newTitle: 0 | 1
  /** 新徽章 */
  medal: SEND_GIFT_data_medal | any[]
  /** 新头衔 */
  title: string
  /** 节奏风暴内容id \d | u\d+ */
  beatId: 0 | '' | string
  biz_source: 'live'
  metadata: string
  /** 道具包裹剩余数量 */
  remain: number
  /** 剩余金瓜子 */
  gold: number
  /** 剩余银瓜子 */
  silver: number
  /** 主播活动积分, 普通道具为0 */
  eventScore: number
  eventNum: number
  /** 小电视 */
  smalltv_msg: SYS_MSG[] | any[]
  /** 特殊礼物 */
  specialGift: SPECIAL_GIFT_data | null
  /** SYS_GIFT */
  notice_msg: string[] | any[]
  /** 扭蛋 */
  capsule: SEND_GIFT_data_capsule
  /** 是否新关注 */
  addFollow: 0 | 1
  /** 估计只有辣条才能是1 */
  effect_block: 0 | 1
}
interface SEND_GIFT_data_top_list {
  /** 用户uid */
  uid: number
  /** 用户名 */
  uname: string
  /** 头像地址 */
  face: string
  /** 排行 */
  rank: number
  /** 投喂总数 */
  score: number
  /** 舰队等级 */
  guard_level: number
  /** 是否本人 */
  isSelf: 0 | 1
}
interface SEND_GIFT_data_medal {
  /** 徽章id */
  medalId: string
  /** 徽章名 */
  medalName: string
  /** 徽章等级 */
  level: 1
}
interface SEND_GIFT_data_capsule {
  /** 普通扭蛋 */
  normal: SEND_GIFT_data_capsule_data
  /** 梦幻扭蛋 */
  colorful: SEND_GIFT_data_capsule_data
}
interface SEND_GIFT_data_capsule_data {
  /** 数量 */
  coin: number
  /** 数量发生变化 */
  change: number
  progress: SEND_GIFT_data_capsule_data_progress
}
interface SEND_GIFT_data_capsule_data_progress {
  /** 当前送出道具价值 */
  now: number
  /** 需要的道具价值 */
  max: number
}
/**
 * 系统消息, 广播
 * {"cmd":"SYS_MSG","msg":"亚军主播【赤瞳不是翅桶是赤瞳】开播啦，一起去围观！","msg_text":"亚军主播【赤瞳不是翅桶是赤瞳】开播啦，一起去围观！","url":"http://live.bilibili.com/5198","_roomid":23058}
 * {"cmd":"SYS_MSG","msg":"【国民六妹】:?在直播间:?【896056】:?赠送 小电视一个，请前往抽奖","msg_text":"【国民六妹】:?在直播间:?【896056】:?赠送 小电视一个，请前往抽奖","rep":1,"styleType":2,"url":"http://live.bilibili.com/896056","roomid":896056,"real_roomid":896056,"rnd":1517304134,"tv_id":"36676","_roomid":1199214}
 * 
 * @interface SYS_MSG
 * @extends {danmuJson}
 */
interface SYS_MSG extends danmuJson {
  /** 消息内容 */
  msg: string
  /** 同msg */
  msg_text: string
  /** 点击跳转的地址 */
  url: string
}
interface SYS_MSG extends danmuJson {
  /** 消息内容 */
  msg: string
  /** 同msg */
  msg_text: string
  rep: 1
  /** 2为小电视通知 */
  styleType: 2
  /** 点击跳转的地址 */
  url: string
  /** 原始房间号 */
  real_roomid: number
  rnd: number
  /** 小电视编号 */
  tv_id: string
}
/**
 * 系统礼物消息, 广播
 * {"cmd":"SYS_GIFT","msg":"叫我大兵就对了:?  在贪玩游戏的:?直播间5254205:?内赠送:?109:?共225个","rnd":"930578893","uid":30623524,"msg_text":"叫我大兵就对了在贪玩游戏的直播间5254205内赠送红灯笼共225个","_roomid":23058}
 * {"cmd":"SYS_GIFT","msg":"亚瑟不懂我心在直播间26057开启了新春抽奖，红包大派送啦！一起来沾沾喜气吧！","msg_text":"亚瑟不懂我心在直播间26057开启了新春抽奖，红包大派送啦！一起来沾沾喜气吧！","tips":"亚瑟不懂我心在直播间26057开启了新春抽奖，红包大派送啦！一起来沾沾喜气吧！","url":"http://live.bilibili.com/26057","roomid":26057,"real_roomid":26057,"giftId":110,"msgTips":0,"_roomid":23058}
 * 
 * @interface SYS_GIFT
 * @extends {danmuJson}
 */
interface SYS_GIFT extends danmuJson {
  /** 消息内容 */
  msg: string
  rnd: number
  /** 赠送人uid */
  uid: number
  /** 同msg, 无标记符号 */
  msg_text: string
}
interface SYS_GIFT extends danmuJson {
  /** 消息内容 */
  msg: string
  /** 同msg */
  msg_text: string
  /** 同msg */
  tips: string
  /** 点击跳转的地址 */
  url: string
  /** 原始房间号 */
  real_roomid: number
  /** 礼物id */
  giftId: number
  msgTips: number
}
/**
 * 欢迎消息
 * {"cmd":"WELCOME","data":{"uid":42469177,"uname":"还是森然","isadmin":0,"vip":1},"roomid":10248,"_roomid":10248}
 * {"cmd":"WELCOME","data":{"uid":36157605,"uname":"北熠丶","is_admin":false,"vip":1},"_roomid":5096}
 * 
 * @interface WELCOME
 * @extends {danmuJson}
 */
interface WELCOME extends danmuJson {
  data: WELCOME_data
}
interface WELCOME_data_base {
  /** 用户uid */
  uid: number
  /** 用户名 */
  uname: string
}
interface WELCOME_data_base_admin extends WELCOME_data_base {
  /** 是否为管理员 */
  isadmin: 0 | 1
}
interface WELCOME_data_base_admin extends WELCOME_data_base {
  /** 是否为管理员 */
  is_admin: false
}
interface WELCOME_data extends WELCOME_data_base_admin {
  /** 是否为月费老爷 */
  vip: 0 | 1
}
interface WELCOME_data extends WELCOME_data_base_admin {
  /** 是否为年费老爷 */
  svip: 0 | 1
}
/**
 * 欢迎消息-舰队
 * {"cmd":"WELCOME_GUARD","data":{"uid":33401915,"username":"按时咬希尔","guard_level":3,"water_god":0},"roomid":1374115,"_roomid":1374115}
 * 
 * @interface WELCOME_GUARD
 * @extends {danmuJson}
 */
interface WELCOME_GUARD extends danmuJson {
  data: WELCOME_GUARD_data
}
interface WELCOME_GUARD_data {
  /** 用户uid */
  uid: number
  /** 用户名 */
  username: string
  /** 舰队等级 */
  guard_level: number
  water_god: number
}
/**
 * 欢迎消息-活动
 * {"cmd":"WELCOME_ACTIVITY","data":{"uid":38728279,"uname":"胖橘喵_只听歌不聊骚","type":"goodluck"},"_roomid":12722}
 * 
 * @interface WELCOME_ACTIVITY
 * @extends {danmuJson}
 */
interface WELCOME_ACTIVITY extends danmuJson {
  data: WELCOME_ACTIVITY_data
}
interface WELCOME_ACTIVITY_data {
  /** 用户uid */
  uid: number
  /** 用户名 */
  uname: string
  /** 文案 */
  type: string
}
/**
 * 舰队购买
 * {"cmd":"GUARD_BUY","data":{"uid":43510479,"username":"416の老木鱼","guard_level":3,"num":1},"roomid":"24308","_roomid":24308}
 * 
 * @interface GUARD_BUY
 * @extends {danmuJson}
 */
interface GUARD_BUY extends danmuJson {
  data: GUARD_BUY_data
}
interface GUARD_BUY_data {
  /** 用户uid */
  uid: number
  /** 用户名 */
  username: string
  /** 舰队等级 */
  guard_level: number
  /** 购买数量 */
  num: number
}
/**
 * 舰队消息
 * {"cmd":"GUARD_MSG","msg":"欢迎 :?总督 Tikiあいしてる:? 登船","roomid":237328,"_roomid":237328}
 * 
 * @interface GUARD_MSG
 * @extends {danmuJson}
 */
interface GUARD_MSG extends danmuJson {
  /** 消息内容 */
  msg: string
}
/**
 * 抽奖开始
 * {"cmd":"RAFFLE_START","roomid":11365,"data":{"raffleId":5082,"type":"newspring","from":"LexBurner","time":60},"_roomid":11365}
 * 
 * @interface RAFFLE_START
 * @extends {danmuJson}
 */
interface RAFFLE_START extends danmuJson {
  data: RAFFLE_START_data
}
interface RAFFLE_START_data {
  /** 抽奖编号 */
  raffleId: number
  /** 文案 */
  type: string
  /** 赠送人 */
  from: string
  /** 持续时间 */
  time: number
}
/**
 * 抽奖结束
 * {"cmd":"RAFFLE_END","roomid":2785651,"data":{"raffleId":5081,"type":"newspring","from":"秃物祝大家新年快乐","fromFace":"http://i1.hdslb.com/bfs/face/34de240643bc2e5078e9aff222ff1601e6c9d31d.jpg","win":{"uname":"明太太太太太太太太太","face":"http://i1.hdslb.com/bfs/face/34de240643bc2e5078e9aff222ff1601e6c9d31d.jpg","giftId":"stuff-1","giftName":"经验原石","giftNum":10}},"_roomid":2785651}
 * 
 * @interface RAFFLE_END
 * @extends {danmuJson}
 */
interface RAFFLE_END extends danmuJson {
  data: RAFFLE_END_data
}
interface RAFFLE_END_data {
  /** 编号 */
  raffleId: number
  /** 文案 */
  type: string
  /** 赠送人 */
  from: string
  /** 赠送人头像地址 */
  fromFace: string
  win: RAFFLE_END_data_win
}
interface RAFFLE_END_data_win {
  /** 获赠人 */
  uname: string
  /** 获赠人头像地址 */
  face: string
  /** 礼物名 '银瓜子' | '经验原石' */
  giftName: string
  /** 礼物类型 'silver' | 'stuff-1' */
  giftId: string
  /** 礼物数量 100000 | 10*/
  giftNum: number
}
/**
 * 小电视抽奖开始
 * {"cmd":"TV_START","data":{"id":"36682","dtime":180,"msg":{"cmd":"SYS_MSG","msg":"【红色海蜗牛】:?在直播间:?【510】:?赠送 小电视一个，请前往抽奖","msg_text":"【红色海蜗牛】:?在直播间:?【510】:?赠送 小电视一个，请前往抽奖","rep":1,"styleType":2,"url":"http://live.bilibili.com/510","roomid":510,"real_roomid":80397,"rnd":1517306497,"tv_id":"36682"},"raffleId":36682,"type":"small_tv","from":"红色海蜗牛","time":180},"_roomid":80397}
 * 
 * @interface TV_START
 * @extends {danmuJson}
 */
interface TV_START extends danmuJson {
  data: TV_START_data
}
interface TV_START_data extends RAFFLE_START_data {
  /** 小电视编号 */
  id: string
  /** 持续时间 */
  dtime: number
  msg: SYS_MSG
  type: 'small_tv'
}
/**
 * 小电视抽奖结束
 * {"cmd":"TV_END","data":{"id":"36682","uname":"梦醒二生梦","sname":"红色海蜗牛","giftName":"10W银瓜子","mobileTips":"恭喜 梦醒二生梦 获得10W银瓜子","raffleId":"36682","type":"small_tv","from":"红色海蜗牛","fromFace":"http://i2.hdslb.com/bfs/face/0125426600e2d414f925ed0ed0ac011e42b7c35a.gif","win":{"uname":"梦醒二生梦","face":"http://i0.hdslb.com/bfs/face/ff8d14a116dcc59b3de30f3ac821f683b85e7150.jpg","giftName":"银瓜子","giftId":"silver","giftNum":100000}},"_roomid":80397}
 * 
 * @interface TV_END
 * @extends {danmuJson}
 */
interface TV_END extends danmuJson {
  data: TV_END_data
}
interface TV_END_data extends RAFFLE_END_data {
  /** 小电视编号 */
  id: string
  /** 获赠人 */
  uname: string
  /** 赠送人 */
  sname: string
  /** '10W银瓜子' | '抱枕' */
  giftName: string
  /** 中奖消息 */
  mobileTips: string
}
/**
 * 活动相关
 * {"roomid":11365,"cmd":"EVENT_CMD","data":{"event_type":"newspring-5082","event_img":"http://s1.hdslb.com/bfs/static/blive/live-assets/mobile/activity/newspring_2018/raffle.png"},"_roomid":11365}
 * 
 * @interface EVENT_CMD
 * @extends {danmuJson}
 */
interface EVENT_CMD extends danmuJson {
  data: EVENT_CMD_data
}
interface EVENT_CMD_data {
  /** 文案-编号 */
  event_type: string
  /** 图地址片 */
  event_img: string
}
/**
 * 快速抽奖
 * 
 * @interface LIGHTEN_START
 * @extends {danmuJson}
 */
interface LIGHTEN_START extends danmuJson {
  data: LIGHTEN_START_Data
}
interface LIGHTEN_START_Data {
  type: string // 活动标识
  lightenId: number // 参与id
  time: number // 持续时间
}
/**
 * 快速抽奖结束
 * 
 * @interface LIGHTEN_END
 * @extends {danmuJson}
 */
interface LIGHTEN_END extends danmuJson {
  data: LIGHTEN_END_Data
}
interface LIGHTEN_END_Data {
  type: string // 活动标识
  lightenId: number // 参与id
}
/**
 * 特殊礼物消息
 * {"cmd":"SPECIAL_GIFT","data":{"39":{"id":169666,"time":90,"hadJoin":0,"num":1,"content":"啦噜啦噜","action":"start","storm_gif":"http://static.hdslb.com/live-static/live-room/images/gift-section/mobilegift/2/jiezou.gif?2017011901"}},"_roomid":5096}
 * {"cmd":"SPECIAL_GIFT","data":{"39":{"id":169666,"action":"end"}},"_roomid":5096}
 * 
 * @interface SPECIAL_GIFT
 * @extends {danmuJson}
 */
interface SPECIAL_GIFT extends danmuJson {
  data: SPECIAL_GIFT_data
}
interface SPECIAL_GIFT_data {
  /** 节奏风暴 */
  '39': SPECIAL_GIFT_data_beatStorm
}
type SPECIAL_GIFT_data_beatStorm = SPECIAL_GIFT_data_beatStorm_start | SPECIAL_GIFT_data_beatStorm_end
interface SPECIAL_GIFT_data_beatStorm_start {
  /** 节奏风暴id */
  id: number
  /** 节奏持续时间 */
  time: number
  /** 是否已经参与 */
  hadJoin: 0 | 1
  /** 节奏数量 */
  num: number
  /** 节奏内容 */
  content: string
  /** 节奏开始 */
  action: 'start'
  /** 节奏风暴图标地址 */
  storm_gif: string
}
interface SPECIAL_GIFT_data_beatStorm_end {
  /** 节奏风暴id */
  id: number
  /** 结束 */
  action: 'end'
}
/**
 * 准备直播
 * {"cmd":"PREPARING","round":1,"roomid":"66287","_roomid":66287}
 * 
 * @interface PREPARING
 * @extends {danmuJson}
 */
interface PREPARING extends danmuJson {
  round?: 1
}
/**
 * 开始直播
 * {"cmd":"LIVE","roomid":66688,"_roomid":66688}
 * 
 * @interface LIVE
 * @extends {danmuJson}
 */
interface LIVE extends danmuJson { }
/**
 * 开始手机直播
 * 
 * @interface MOBILE_LIVE
 * @extends {danmuJson}
 */
interface MOBILE_LIVE extends danmuJson {
  type: 1
}
/**
 * 房间开启禁言
 * {"cmd":"ROOM_SILENT_ON","data":{"type":"level","level":1,"second":1517318804},"roomid":544893,"_roomid":544893}
 * 
 * @interface ROOM_SILENT_ON
 * @extends {danmuJson}
 */
interface ROOM_SILENT_ON extends danmuJson {
  data: ROOM_SILENT_ON_data
}
interface ROOM_SILENT_ON_data {
  /** 等级 | 勋章 | 全员 */
  type: 'level' | 'medal' | 'member'
  /** 禁言等级 */
  level: number
  /** 禁言时间, -1为本次 */
  second: number
}
/**
 * 房间禁言结束
 * {"cmd":"ROOM_SILENT_OFF","data":[],"roomid":"101526","_roomid":101526}
 * 
 * @interface ROOM_SILENT_OFF
 * @extends {danmuJson}
 */
interface ROOM_SILENT_OFF extends danmuJson {
  data: any[]
}
/**
 * 房间屏蔽
 * {"cmd":"ROOM_SHIELD","type":0,"user":"","keyword":"","roomid":939654,"_roomid":939654}
 * 
 * @interface ROOM_SHIELD
 * @extends {danmuJson}
 */
interface ROOM_SHIELD extends danmuJson {
  type: number
  user: string
  keyword: string
}
/**
 * 房间封禁消息
 * {"cmd":"ROOM_BLOCK_MSG","uid":"12482716","uname":"筱小公主","roomid":5501645,"_roomid":5501645}
 * 
 * @interface ROOM_BLOCK_MSG
 * @extends {danmuJson}
 */
interface ROOM_BLOCK_MSG extends danmuJson {
  /** 用户uid */
  uid: number
  /** 用户名 */
  uname: string
}
/**
 * 管理员变更
 * {"cmd":"ROOM_ADMINS","uids":[37690892,22741742,21861760,35306422,40186466,27138800],"roomid":5667325,"_roomid":5667325}
 * 
 * @interface ROOM_ADMINS
 * @extends {danmuJson}
 */
interface ROOM_ADMINS extends danmuJson {
  /** 管理员列表 */
  uids: number[]
}
/**
 * 房间设置变更
 * {"cmd":"CHANGE_ROOM_INFO","background":"http://i0.hdslb.com/bfs/live/6411059a373a594e648b26d9714d7eab4ee556ed.jpg","_roomid":24308}
 * 
 * @interface CHANGE_ROOM_INFO
 * @extends {danmuJson}
 */
interface CHANGE_ROOM_INFO extends danmuJson {
  /** 背景图片地址 */
  background: string
}
/**
 * 许愿瓶
 * {"cmd":"WISH_BOTTLE","data":{"action":"update","id":6301,"wish":{"id":6301,"uid":610390,"type":1,"type_id":109,"wish_limit":99999,"wish_progress":39370,"status":1,"content":"灯笼挂着好看","ctime":"2018-01-21 13:20:12","count_map":[1,20,225]}},"_roomid":14893}
 * 
 * @interface WISH_BOTTLE
 * @extends {danmuJson}
 */
interface WISH_BOTTLE extends danmuJson {
  data: WISH_BOTTLE_data
}
interface WISH_BOTTLE_data {
  action: 'update' | 'delete' | 'full' | 'create' | 'finish'
  /** 许愿瓶id */
  id: number
  wish: WISH_BOTTLE_data_wish
}
interface WISH_BOTTLE_data_wish {
  /** 许愿瓶id */
  id: number
  /** 主播uid */
  uid: number
  type: number
  /** 礼物id */
  type_id: number
  /** 礼物上限 */
  wish_limit: number
  /** 当前礼物数量 */
  wish_progress: number
  /** 
   * 'delete': -1 
   * 'update' | 'create': 1 
   * 'full': 2 
   * 'finish': 3
   */
  status: number
  /** 礼物说明 */
  content: string
  /** 开始时间 yyyy-MM-dd HH:mm:ss 格式 */
  ctime: string
  /** 礼物选择数量 */
  count_map: number[]
}
/**
 * 活动
 * {"cmd":"ACTIVITY_EVENT","data":{"keyword":"newspring_2018","type":"cracker","limit":300000,"progress":41818},"_roomid":14893}
 * 
 * @interface ACTIVITY_EVENT
 * @extends {danmuJson}
 */
interface ACTIVITY_EVENT extends danmuJson {
  data: ACTIVITY_EVENT_data
}
interface ACTIVITY_EVENT_data {
  /** 活动标识 */
  keyword: string
  /** 文案 */
  type: string
  /** 积分上限 */
  limit: number
  /** 当前积分 */
  progress: number
}
/**
 * 直播强制切断
 * {"cmd":"CUT_OFF","msg":"违反直播规范","roomid":945626,"_roomid":945626}
 * 
 * @interface CUT_OFF
 * @extends {danmuJson}
 */
interface CUT_OFF extends danmuJson {
  /** 切断原因 */
  msg: string
}
/**
 * 直播封禁
 * 
 * @interface ROOM_LOCK
 * @extends {danmuJson}
 */
interface ROOM_LOCK extends danmuJson {
  expire: string // 封禁时间 yyyy-MM-dd HH:mm:ss
}
/**
 * 总督抽奖
 * {"cmd":"LOTTERY_START","data":{"id":216101,"roomid":5712065,"message":"290974992 在【5712065】购买了总督，请前往抽奖","type":"guard","link":"https://live.bilibili.com/5712065","lottery":{"id":216101,"sender":{"uid":290974992,"uname":"","face":""},"keyword":"guard","time":86400,"status":1,"mobile_display_mode":2,"mobile_static_asset":"","mobile_animation_asset":""}},"_roomid":5712065}
 * 
 * @interface LOTTERY_START
 * @extends {danmuJson}
 */
interface LOTTERY_START extends danmuJson {
  data: LOTTERY_START_data
}
interface LOTTERY_START_data {
  /* 编号 */
  id: number
  /* 房间号 */
  roomid: number
  /* 消息 */
  message: string
  /* 抽奖类型 */
  type: string
  /* 房间链接 */
  link: string
  /* 抽奖信息 */
  lottery: LOTTERY_START_data_lottery
}
interface LOTTERY_START_data_lottery {
  /* 编号 */
  id: number
  /* 抽奖发起人信息 */
  sender: LOTTERY_START_data_lottery_sender
  /* 关键字, 目前和type一致 */
  keyword: string
  time: number
  status: number
  mobile_display_mode: number
  mobile_static_asset: string
  mobile_animation_asset: string
}
interface LOTTERY_START_data_lottery_sender {
  /* 发起人uid */
  uid: number
  /* 发起人昵称 */
  uname: string
  /* 头像地址 */
  face: string
}
/**
 * 画板活动
 * 
 * @interface DRAW_UPDATE
 * @extends {danmuJson}
 */
interface DRAW_UPDATE extends danmuJson {
  /** 
   * 个人用户一像素 x_min === x_max y_min === y_max
   * 管理员可用笔刷
   */
  data: DRAW_UPDATE_data
}
interface DRAW_UPDATE_data {
  /** x起点坐标 */
  x_min: number
  /** x终点坐标 */
  x_max: number
  /** y起点坐标 */
  y_min: number
  /** y终点坐标 */
  y_max: number
  /** 颜色代码[0-9A-V] */
  color: string
}
