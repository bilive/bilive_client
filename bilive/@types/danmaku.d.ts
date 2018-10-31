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
  /** 用户名颜色, #32进制颜色代码 */
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
 * 礼物连击, 我十分怀疑之前的COMBO_END是打错了
 * {"cmd":"COMBO_SEND","data":{"uid":12767334,"uname":"Edoのsomo愛豆子","combo_num":2,"gift_name":"？？？","gift_id":20007,"action":"赠送"},"_roomid":1274658}
 *
 * @interface COMBO_SEND
 * @extends {danmuJson}
 */
interface COMBO_SEND extends danmuJson {
  /** 礼物连击 */
  data: COMBO_SEND_data
}
interface COMBO_SEND_data {
  /** 送礼人UID */
  uid: number
  /** 送礼人 */
  uname: string
  /** 连击次数 */
  combo_num: number
  /** 礼物数量 */
  gift_name: string
  /** 礼物名 */
  gift_id: number
  /** 赠送, 投喂 */
  action: string
}
/**
 * 礼物连击结束
 * {"cmd":"COMBO_END","data":{"uname":"虫章虫良阝恶霸","r_uname":"坂本叔","combo_num":99,"price":100,"gift_name":"凉了","gift_id":20010,"start_time":1527510537,"end_time":1527510610},"_roomid":5067}
 * 
 * @interface COMBO_END
 * @extends {danmuJson}
 */
interface COMBO_END extends danmuJson {
  /** 礼物连击结束 */
  data: COMBO_END_data
}
interface COMBO_END_data {
  /** 送礼人 */
  uname: string
  /** 主播 */
  r_uname: string
  /** 连击次数 */
  combo_num: number
  /** 礼物价值 */
  price: number
  /** 礼物名 */
  gift_name: string
  /** 礼物ID */
  gift_id: number
  /** 开始时间 */
  start_time: number
  /** 结束时间 */
  end_time: number
}
/**
 * 系统消息, 广播
 * {"cmd":"SYS_MSG","msg":"亚军主播【赤瞳不是翅桶是赤瞳】开播啦，一起去围观！","msg_text":"亚军主播【赤瞳不是翅桶是赤瞳】开播啦，一起去围观！","url":"http://live.bilibili.com/5198","_roomid":23058}
 * {"cmd":"SYS_MSG","msg":"【国民六妹】:?在直播间:?【896056】:?赠送 小电视一个，请前往抽奖","msg_text":"【国民六妹】:?在直播间:?【896056】:?赠送 小电视一个，请前往抽奖","rep":1,"styleType":2,"url":"http://live.bilibili.com/896056","roomid":896056,"real_roomid":896056,"rnd":1517304134,"tv_id":"36676","_roomid":1199214}
 * {"cmd":"SYS_MSG","msg":"忧伤小草:?送给:?龙崎77-:?一个摩天大楼，点击前往TA的房间去抽奖吧","msg_text":"忧伤小草:?送给:?龙崎77-:?一个摩天大楼，点击前往TA的房间去抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/307","roomid":307,"real_roomid":371020,"rnd":1382374449,"tv_id":0,"_roomid":23058}
 * {"cmd":"SYS_MSG","msg":"丨奕玉丨:?送给:?大吉叽叽叽:?一个小电视飞船，点击前往TA的房间去抽奖吧","msg_text":"丨奕玉丨:?送给:?大吉叽叽叽:?一个小电视飞船，点击前往TA的房间去抽奖吧","msg_common":"全区广播：<%丨奕玉丨%>送给<%大吉叽叽叽%>一个小电视飞船，点击前往TA的房间去抽奖吧","msg_self":"全区广播：<%丨奕玉丨%>送给<%大吉叽叽叽%>一个小电视飞船，快来抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/286","roomid":286,"real_roomid":170908,"rnd":2113258721,"broadcast_type":1,"_roomid":23058}
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
  /** 广播: 消息内容 */
  msg_common: string
  /** 广播: 消息内容 */
  msg_self: string
  rep: 1
  /** 2为小电视通知 */
  styleType: 2
  /** 点击跳转的地址 */
  url: string
  /** 原始房间号 */
  real_roomid: number
  rnd: number
  /** 广播类型 */
  broadcast_type: number
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
 * 活动入场特效
 * {"cmd":"ENTRY_EFFECT","data":{"id":3,"uid":210983254,"target_id":20848957,"show_avatar":1,"copy_writing":"欢迎 <%失去_理智%> 进入房间","highlight_color":"#FFF100","basemap_url":"http://i0.hdslb.com/bfs/live/d208b9654b93a70b4177e1aa7e2f0343f8a5ff1a.png","effective_time":1,"priority":50,"privilege_type":2,"face":"http://i0.hdslb.com/bfs/face/3d47da79e92d9b7c676abca94730f744d296e8cd.jpg"},"_roomid":66688}
 *
 * @interface ENTRY_EFFECT
 * @extends {danmuJson}
 */
interface ENTRY_EFFECT extends danmuJson {
  data: ENTRY_EFFECT_data
}
interface ENTRY_EFFECT_data {
  id: number
  uid: number
  target_id: number
  show_avatar: number
  copy_writing: string
  highlight_color: string
  basemap_url: string
  effective_time: number
  priority: number
  privilege_type: number
  face: string
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
 * {"cmd":"GUARD_MSG","msg":"用户 :?EricOuO:? 在主播 七七见奈波丶 的直播间开通了总督","buy_type":1,"_roomid":23058}
 * 
 * @interface GUARD_MSG
 * @extends {danmuJson}
 */
interface GUARD_MSG extends danmuJson {
  /** 消息内容 */
  msg: string
  buy_type?: number
}
/**
 * 抽奖开始
 * {"cmd":"RAFFLE_START","roomid":11365,"data":{"raffleId":5082,"type":"newspring","from":"LexBurner","time":60},"_roomid":11365}
 * {"cmd":"RAFFLE_START","data":{"id":"54588","dtime":180,"msg":{"cmd":"SYS_MSG","msg":"一圆滚滚:?送给:?-牛奶喵:?一个摩天大楼，点击前往TA的房间去抽奖吧","msg_text":"一圆滚滚:?送给:?-牛奶喵:?一个摩天大楼，点击前往TA的房间去抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/344839","roomid":344839,"real_roomid":344839,"rnd":1003073948,"tv_id":0},"raffleId":54588,"title":"摩天大楼抽奖","type":"GIFT_20003","from":"一圆滚滚","from_user":{"uname":"一圆滚滚","face":"http://static.hdslb.com/images/member/noface.gif"},"time":180,"max_time":180,"time_wait":120,"asset_animation_pic":"http://i0.hdslb.com/bfs/live/7e47e9cfb744acd0319a4480e681258ce3a611fe.gif","asset_tips_pic":"http://s1.hdslb.com/bfs/live/380bcd708da496d75737c68930965dd67b82879d.png"},"_roomid":344839}
 * 
 * @interface RAFFLE_START
 * @extends {danmuJson}
 */
interface RAFFLE_START extends danmuJson {
  data: RAFFLE_START_data
}
interface RAFFLE_START_data {
  /** 抽奖编号 */
  id: string
  /** 持续时间 */
  dtime: number
  /** 系统广播 */
  msg: SYS_MSG
  /** 抽奖编号 */
  raffleId: number
  /** 文案 */
  title: string
  /** 文案 */
  type: string
  /** 赠送人 */
  from: string
  /** 持续时间 */
  time: number
  /** 持续时间 */
  max_time: number
  /** 等待时间 */
  time_wait: number
  /** 动画图片 */
  asset_animation_pic: string
  /** 静态图片 */
  asset_tips_pic: string
}
/**
 * 抽奖结束
 * {"cmd":"RAFFLE_END","data":{"id":"56496","uname":"等着豆子发芽","sname":"外星人","giftName":"2.3333w银瓜子","mobileTips":"恭喜 等着豆子发芽 获得2.3333w银瓜子","raffleId":"56496","type":"GIFT_20003","from":"外星人","fromFace":"http://i2.hdslb.com/bfs/face/60c1d92c378f3ec9769ee8d46300d6829d14869d.jpg","fromGiftId":20003,"win":{"uname":"等着豆子发芽","face":"http://i1.hdslb.com/bfs/face/11e57d535980dfab77682427433efee9bca0bc3e.jpg","giftName":"银瓜子","giftId":"silver","giftNum":23333,"msg":"恭喜<%等着豆子发芽%>获得大奖<%2.3333w银瓜子%>, 感谢<%外星人%>的赠送"}},"_roomid":5619438}
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
  /** 中奖消息 */
  msg: string
}
/**
 * 中奖通知
 * {"cmd":"NOTICE_MSG","full":{"head_icon":"","is_anim":1,"tail_icon":"","background":"#33ffffff","color":"#33ffffff","highlight":"#33ffffff","border":"#33ffffff","time":10},"half":{"head_icon":"","is_anim":0,"tail_icon":"","background":"#33ffffff","color":"#33ffffff","highlight":"#33ffffff","border":"#33ffffff","time":8},"roomid":"360972","real_roomid":"493","msg_common":"恭喜<%千里一醉醉醉醉醉醉%>获得大奖<%100x普通扭蛋币%>, 感谢<%丨四四丨%>的赠送","msg_self":"恭喜<%千里一醉醉醉醉醉醉%>获得大奖<%100x普通扭蛋币%>, 感谢<%丨四四丨%>的赠送","link_url":"http://live.bilibili.com/493","msg_type":4,"_roomid":360972}
 *
 * @interface NOTICE_MSG
 * @extends {danmuJson}
 */
interface NOTICE_MSG extends danmuJson {
  full: NOTICE_MSG_style
  half: NOTICE_MSG_style
  real_roomid: string
  msg_common: string
  msg_self: string
  link_url: string
  msg_type: number
}
interface NOTICE_MSG_style {
  head_icon: string
  is_anim: number
  tail_icon: string
  background: string
  color: string
  highlight: string
  border: string
  time: number
}
/**
 * 小电视抽奖开始
 * {"cmd":"TV_START","data":{"id":"56473","dtime":180,"msg":{"cmd":"SYS_MSG","msg":"GDinBoston:?送给:?宝贤酱:?一个小电视飞船，点击前往TA的房间去抽奖吧","msg_text":"GDinBoston:?送给:?宝贤酱:?一个小电视飞船，点击前往TA的房间去抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/5520","roomid":5520,"real_roomid":4069122,"rnd":1527998406,"tv_id":0},"raffleId":56473,"title":"小电视飞船抽奖","type":"small_tv","from":"GDinBoston","from_user":{"uname":"GDinBoston","face":"http://i2.hdslb.com/bfs/face/6f42b610b2b3846bf054f78c348051c21ff223f1.jpg"},"time":180,"max_time":180,"time_wait":120,"asset_animation_pic":"http://i0.hdslb.com/bfs/live/746a8db0702740ec63106581825667ae525bb11a.gif","asset_tips_pic":"http://s1.hdslb.com/bfs/live/1a3acb48c59eb10010ad53b59623e14dc1339968.png"},"_roomid":4069122}
 * 
 * @interface TV_START
 * @extends {danmuJson}
 */
interface TV_START extends danmuJson {
  data: TV_START_data
}
interface TV_START_data extends RAFFLE_START_data {
  type: 'small_tv'
  /** 赠送人信息 */
  from_user: TV_START_data_from
  time_wait: number
}
interface TV_START_data_from {
  /** 赠送人 */
  uname: string
  /** 赠送人头像地址 */
  face: string
}
/**
 * 小电视抽奖结束
 * {"cmd":"TV_END","data":{"id":"56503","uname":"-清柠_","sname":"君子应如兰","giftName":"小电视抱枕","mobileTips":"恭喜 -清柠_ 获得小电视抱枕","raffleId":"56503","type":"small_tv","from":"君子应如兰","fromFace":"http://i1.hdslb.com/bfs/face/dfde2619c96280fa5f3f309d20207c8426a3722b.jpg","fromGiftId":25,"win":{"uname":"-清柠_","face":"http://i2.hdslb.com/bfs/face/e37a453b392be0342de2bae3caa18533273ad043.jpg","giftName":"小电视抱枕","giftId":"small_tv","giftNum":1,"msg":"恭喜<%-清柠_%>获得大奖<%小电视抱枕%>, 感谢<%君子应如兰%>的赠送"}},"_roomid":40270}
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
  /** 图片地址 */
  event_img: string
}
/**
 * 抽奖LOTTERY
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
 * 舰队抽奖
 * {"cmd":"GUARD_LOTTERY_START","data":{"id":382934,"roomid":5096,"message":"千尘の可爱笋 在【5096】购买了舰长，请前往抽奖","type":"guard","privilege_type":3,"link":"https://live.bilibili.com/5096","lottery":{"id":382934,"sender":{"uid":281218616,"uname":"千尘の可爱笋","face":"http://i0.hdslb.com/bfs/face/939ea830a4ea3f3db6daba8fa900818e213ccc00.jpg"},"keyword":"guard","time":1200,"status":1,"mobile_display_mode":2,"mobile_static_asset":"","mobile_animation_asset":""}},"_roomid":5096}
 *
 * @interface GUARD_LOTTERY_START
 */
interface GUARD_LOTTERY_START extends LOTTERY_START { }
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
 * 准备直播, 下播
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
 * 实物抽奖结束
 * 
 * @interface WIN_ACTIVITY
 * @extends {danmuJson}
 */
interface WIN_ACTIVITY extends danmuJson {
  /** 第n轮抽奖 */
  number: number
}
/**
 * 直播警告
 * {"cmd":"WARNING","msg":"违反直播着装规范，请立即调整","roomid":883802,"_roomid":883802}
 * 
 * @interface WARNING
 */
interface WARNING {
  msg: string
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
 * 房间排行榜
 * {"cmd":"ROOM_RANK","data":{"roomid":1327236,"rank_desc":"元气榜 4","color":"#B15BFF","h5_url":"https://live.bilibili.com/p/eden/rank-h5?nav=hour&uid=33594828","timestamp":1525871406},"_roomid":1327236}
 * {"cmd":"ROOM_RANK","data":{"roomid":6154037,"rank_desc":"今日榜 49","color":"#00BB00","h5_url":"https://live.bilibili.com/pages/lpl2018/lol2018msi.html&uid=194484313","timestamp":1525871406},"_roomid":6154037}
 * 
 * @interface ROOM_RANK
 * @extends {danmuJson}
 */
interface ROOM_RANK extends danmuJson {
  /** 房间排行榜 */
  data: ROOM_RANK_Data
}
interface ROOM_RANK_Data {
  /** 房间号 */
  roomid: number
  /** 排行榜文案 */
  rank_desc: string
  /** 排行榜颜色 */
  color: string
  /** 排行榜页面 */
  h5_url: string
  timestamp: number
}
/**
 * 连麦PK
 *
 * @interface PK_MIC_Base
 * @extends {danmuJson}
 */
interface PK_MIC_Base extends danmuJson {
  /** PK编号 */
  pk_id: number
  /** PK状态 */
  pk_status: number
}
/**
 * PK邀请
 * {"cmd":"PK_INVITE_INIT","pk_invite_status":200,"invite_id":514,"face":"http://i2.hdslb.com/bfs/face/b50c99b0c989eb303e308b0574d509acab7b8012.jpg","uname":"不会编程的飞飞","area_name":"视频聊天","user_level":22,"master_level":16,"roomid":11420618,"_roomid":11420618}
 *
 * @interface PK_INVITE_INIT
 * @extends {danmuJson}
 */
interface PK_INVITE_INIT extends danmuJson {
  pk_invite_status: number
  invite_id: number
  face: string
  uname: string
  area_name: string
  user_level: number
  master_level: number
}
/**
 * 拒绝PK邀请
 * {"cmd":"PK_INVITE_REFUSE","pk_invite_status":1100,"invite_id":698,"roomid":"11741803","_roomid":11741803}
 *
 * @interface PK_INVITE_REFUSE
 * @extends {danmuJson}
 */
interface PK_INVITE_REFUSE extends danmuJson {
  pk_invite_status: number
  invite_id: number
}
/**
 * 取消PK邀请
 * {"cmd":"PK_INVITE_CANCEL","pk_invite_status":1200,"invite_id":1023,"face":"http://i2.hdslb.com/bfs/face/e68d36b37038428fd1e32f894f8c2eee6388412d.jpg","uname":"纯情的黄老师","area_name":"视频聊天","user_level":10,"master_level":19,"roomid":"5375","_roomid":5375}
 *
 * @interface PK_INVITE_CANCEL
 * @extends {danmuJson}
 */
interface PK_INVITE_CANCEL extends danmuJson {
  pk_invite_status: number
  invite_id: number
  face: string
  uname: string
  area_name: string
  user_level: number
  master_level: number
}
/**
 * PK邀请相关(不明)
 * {"cmd":"PK_INVITE_SWITCH_CLOSE","roomid":60050,"_roomid":60050}
 *
 * @interface RootObject
 * @extends {danmuJson}
 */
interface RootObject extends danmuJson { }
/**
 * PK邀请失败
 * {"cmd":"PK_INVITE_FAIL","pk_invite_status":1100,"invite_id":7529,"roomid":"10817769","_roomid":10817769}
 *
 * @interface PK_INVITE_FAIL
 * @extends {danmuJson}
 */
interface PK_INVITE_FAIL extends danmuJson {
  pk_invite_status: number
  invite_id: number
}
/**
 * PK匹配
 * {"cmd":"PK_MATCH","pk_status":100,"pk_id":3291,"data":{"init_id":273022,"match_id":52320,"escape_time":5,"is_portrait":false,"uname":"栗子蛋糕酱","face":"http://i0.hdslb.com/bfs/face/6fb781f75b9c30d2d8b384793fcd02ad3238b1bd.jpg","uid":922127},"roomid":273022,"_roomid":273022}
 * 
 * @interface PK_MATCH
 * @extends {PK_MIC_Base}
 */
interface PK_MATCH extends PK_MIC_Base {
  /** PK匹配 */
  data: PK_MATCH_Data
}
interface PK_MATCH_Data {
  /** 发起人房间号 */
  init_id: number
  /** 匹配人房间号 */
  match_id: number
  /** 逃跑时间 */
  escape_time: number
  is_portrait: boolean
  /** 匹配人昵称 */
  uname: string
  /** 匹配人头像 */
  face: string
  /** 匹配人UID */
  uid: number
}
/**
 * PK准备
 * {"cmd":"PK_PRE","pk_id":3291,"pk_status":200,"data":{"init_id":273022,"match_id":52320,"count_down":5,"pk_topic":"跳一支舞  ","pk_pre_time":1528442545,"pk_start_time":1528442550,"pk_end_time":1528442610,"end_time":1528442670},"_roomid":273022}
 *
 * @interface PK_PRE
 * @extends {PK_MIC_Base}
 */
interface PK_PRE extends PK_MIC_Base {
  /** PK准备 */
  data: PK_PRE_Data
}
interface PK_PRE_Data {
  /** 发起人房间号 */
  init_id: number
  /** 匹配人房间号 */
  match_id: number
  /** 倒计时 */
  count_down: number
  /** PK项目 */
  pk_topic: string
  /** PK匹配时间 */
  pk_pre_time: number
  /** PK开始时间 */
  pk_start_time: number
  /** PK结束时间 */
  pk_end_time: number
  /** 结束时间 */
  end_time: number
}
/**
 * PK开始
 * {"cmd":"PK_START","pk_id":3291,"pk_status":300,"data":{"init_id":273022,"match_id":52320,"pk_topic":"跳一支舞  "},"_roomid":273022}
 *
 * @interface PK_START
 * @extends {PK_MIC_Base}
 */
interface PK_START extends PK_MIC_Base {
  /** PK开始 */
  data: PK_START_Data
}
interface PK_START_Data {
  /** 发起人房间号 */
  init_id: number
  /** 匹配人房间号 */
  match_id: number
  /** PK项目 */
  pk_topic: string
}
/**
 * PK进行
 * {"cmd":"PK_PROCESS","pk_id":3291,"pk_status":300,"data":{"uid":220870717,"init_votes":0,"match_votes":1,"user_votes":1},"_roomid":273022}
 *
 * @interface PK_PROCESS
 * @extends {PK_MIC_Base}
 */
interface PK_PROCESS extends PK_MIC_Base {
  /** PK进行 */
  data: PK_PROCESS_Data
}
interface PK_PROCESS_Data {
  /** 投票人UID */
  uid: number
  /** 发起人票数 */
  init_votes: number
  /** 匹配人票数 */
  match_votes: number
  /** 投票人投票数 */
  user_votes: number
}
/**
 * PK结束
 * {"cmd":"PK_END","pk_id":3291,"pk_status":400,"data":{"init_id":273022,"match_id":52320,"punish_topic":"惩罚：唱《九妹》"},"_roomid":273022}
 *
 * @interface PK_END
 * @extends {PK_MIC_Base}
 */
interface PK_END extends PK_MIC_Base {
  /** PK结束 */
  data: PK_END_Data
}
interface PK_END_Data {
  /** 发起人房间号 */
  init_id: number
  /** 匹配人房间号 */
  match_id: number
  /** 惩罚 */
  punish_topic: string
}
/**
 * PK结束数据
 * {"cmd":"PK_SETTLE","pk_id":3291,"pk_status":400,"data":{"pk_id":3291,"init_info":{"uid":28008980,"init_id":273022,"uname":"崛起而零距离的目标和梦想和理想之","face":"http://i0.hdslb.com/bfs/face/2c3a364cf409a85b4c651a6afbf6ffe22208c654.jpg","votes":0,"is_winner":false},"match_info":{"uid":922127,"match_id":52320,"uname":"栗子蛋糕酱","face":"http://i0.hdslb.com/bfs/face/6fb781f75b9c30d2d8b384793fcd02ad3238b1bd.jpg","votes":1,"is_winner":true,"vip_type":2,"exp":{"color":5805790,"user_level":35,"master_level":{"level":7,"color":6406234}},"vip":{"vip":0,"svip":0},"face_frame":"","badge":{"url":"http://i0.hdslb.com/bfs/live/b5e9ebd5ddb979a482421ca4ea2f8c1cc593370b.png","desc":"","position":3}},"best_user":{"uid":220870717,"uname":"陶渊明呼呼","face":"http://i1.hdslb.com/bfs/face/dfa72087e929665d3542778144bad0b7f0406998.jpg","vip_type":2,"exp":{"color":6406234,"user_level":14,"master_level":{"level":1,"color":6406234}},"vip":{"vip":1,"svip":0},"privilege_type":0,"face_frame":"","badge":{"url":"http://i0.hdslb.com/bfs/live/b5e9ebd5ddb979a482421ca4ea2f8c1cc593370b.png","desc":"","position":3}},"punish_topic":"惩罚：唱《九妹》"},"_roomid":273022}
 *
 * @interface PK_SETTLE
 * @extends {PK_MIC_Base}
 */
interface PK_SETTLE extends PK_MIC_Base {
  /** PK结束数据 */
  data: PK_SETTLE_Data
}
interface PK_SETTLE_Data {
  /** PK编号 */
  pk_id: number
  /** 发起人信息 */
  init_info: PK_SETTLE_Data_InitInfo
  /** 匹配人信息 */
  match_info: PK_SETTLE_Data_MatchInfo
  /** 最佳助攻 */
  best_user: PK_SETTLE_Data_BestUser
  /** 惩罚 */
  punish_topic: string
}
interface PK_SETTLE_Data_UserInfoBase {
  /** 用户UID */
  uid: number
  /** 用户昵称 */
  uname: string
  /** 用户头像 */
  face: string
}
interface PK_SETTLE_Data_UserInfo extends PK_SETTLE_Data_UserInfoBase {
  /** 得票数 */
  votes: number
  /** 是否胜利 */
  is_winner: boolean
}
interface PK_SETTLE_Data_UserInfoEx {
  /** VIP类型 */
  vip_type: number
  /** 用户经验 */
  exp: PK_SETTLE_Data_UserInfoEx_Exp
  /** 用户VIP */
  vip: PK_SETTLE_Data_UserInfoEx_Vip
  /** 头像边框地址 */
  face_frame: string
  /** 徽章 */
  badge: PK_SETTLE_Data_UserInfoEx_Badge
}
interface PK_SETTLE_Data_UserInfoEx_Badge {
  /** 徽章图片地址 */
  url: string
  /** 描述 */
  desc: string
  /** 位置 */
  position: number
}
interface PK_SETTLE_Data_UserInfoEx_Vip {
  /** 普通VIP */
  vip: number
  /** 超级VIP */
  svip: number
}
interface PK_SETTLE_Data_UserInfoEx_Exp {
  /** 等级颜色 */
  color: number
  /** 用户等级 */
  user_level: number
  /** 直播等级 */
  master_level: PK_SETTLE_Data_UserInfoEx_Exp_Master
}
interface PK_SETTLE_Data_UserInfoEx_Exp_Master {
  /** 直播等级 */
  level: number
  /** 直播等级颜色 */
  color: number
}
interface PK_SETTLE_Data_InitInfo extends PK_SETTLE_Data_UserInfo {
  /** 发起人房间号 */
  init_id: number
}
interface PK_SETTLE_Data_MatchInfo extends PK_SETTLE_Data_UserInfo, PK_SETTLE_Data_UserInfoEx {
  /** 匹配人房间号 */
  match_id: number
}
interface PK_SETTLE_Data_BestUser extends PK_SETTLE_Data_UserInfoBase, PK_SETTLE_Data_UserInfoEx { }
/**
 * 再次PK
 * {"pk_status":400,"pk_id":8110,"cmd":"PK_CLICK_AGAIN","roomid":882855,"_roomid":882855}
 *
 * @interface PK_CLICK_AGAIN
 * @extends {PK_MIC_Base}
 */
interface PK_CLICK_AGAIN extends PK_MIC_Base { }
/**
 * 再次PK匹配
 * {"cmd":"PK_AGAIN","pk_id":8159,"pk_status":400,"data":{"new_pk_id":8179,"init_id":13566,"match_id":7326390,"escape_time":5,"is_portrait":true,"uname":"宇天学长","face":"http://i2.hdslb.com/bfs/face/488dda4a85251f9d0fd9ad82a733f874b5cec585.jpg","uid":261738266},"roomid":13566,"_roomid":13566}
 *
 * @interface PK_AGAIN
 * @extends {PK_MIC_Base}
 */
interface PK_AGAIN extends PK_MIC_Base {
  data: PK_AGAIN_Data
}
interface PK_AGAIN_Data extends PK_MATCH_Data {
  /** 新PK编号 */
  new_pk_id: number
}
/**
 * 连麦PK结束
 * {"cmd":"PK_MIC_END","pk_id":3291,"pk_status":1000,"data":{"type":0},"_roomid":273022}
 * {"cmd":"PK_MIC_END","pk_id":7803,"pk_status":1100,"data":{"type":0,"exception_id":1585470},"_roomid":11303074}
 * {"cmd":"PK_MIC_END","pk_id":7810,"pk_status":1200,"data":{"type":0,"exception_id":353549},"_roomid":353549}
 *
 * @interface PK_MIC_END
 * @extends {PK_MIC_Base}
 */
interface PK_MIC_END extends PK_MIC_Base {
  /** 连麦PK结束 */
  data: PK_MIC_END_Data
}
interface PK_MIC_END_Data {
  /** 结束类型 */
  type: number
  /** 异常?编号 */
  exception_id?: number
}
/**
 * 用户头衔(存疑)
 * {"cmd":"USER_TITLE_GET","data":{"title_id":"may-pillow","source":"2016 五月病","name":"被窝","description":"赠送 25 个被窝","colorful":0,"create_time":"2018-10-31 20:17:15","expire_time":"永久","url":"/may","mobile_pic_url":"http://s1.hdslb.com/bfs/static/blive/live-assets/mobile/titles/title/3/may-pillow.png?20180726173300","web_pic_url":"http://s1.hdslb.com/bfs/static/blive/live-assets/mobile/titles/title/3/may-pillow.png?20180726173300","num":1,"score":0,"level":1},"uid":301606770,"_roomid":9950825}
 * {"cmd":"USER_TITLE_GET","data":{"title_id":"title-174-1","source":"2018 BLS年终盛典 ","name":"幻影","description":"通过普通扭蛋机有几率获得 ","colorful":0,"create_time":"2018-10-31 20:19:26","expire_time":"永久","url":"http://live.bilibili.com/blackboard/bls-2018-web.html","mobile_pic_url":"http://s1.hdslb.com/bfs/vc/a61f2913f8a86b03ef432a286fd5e9e3e22e17bd.png?20180726173300","web_pic_url":"http://s1.hdslb.com/bfs/vc/a61f2913f8a86b03ef432a286fd5e9e3e22e17bd.png?20180726173300","num":1,"score":0,"level":1},"uid":66822870,"_roomid":2776645}
 *
 * @interface USER_TITLE_GET
 * @extends {danmuJson}
 */
interface USER_TITLE_GET extends danmuJson {
  data: USER_TITLE_GET_Data
  uid: number
}
interface USER_TITLE_GET_Data {
  title_id: string
  source: string
  name: string
  description: string
  colorful: number
  create_time: string
  expire_time: string
  url: string
  mobile_pic_url: string
  web_pic_url: string
  num: number
  score: number
  level: number
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
