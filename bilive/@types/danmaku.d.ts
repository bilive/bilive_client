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
 * ACTIVITY_BANNER_CLOSE
 * {"cmd":"ACTIVITY_BANNER_CLOSE","data":{"id":297,"banner_type":2},"_roomid":3802489}
 *
 * @interface ACTIVITY_BANNER_CLOSE
 * @extends {danmuJson}
 */
interface ACTIVITY_BANNER_CLOSE extends danmuJson {
  data: ACTIVITY_BANNER_CLOSE_Data
}
interface ACTIVITY_BANNER_CLOSE_Data {
  id: number
  banner_type: number
}
/**
 * ACTIVITY_BANNER_RED_NOTICE
 * {"cmd":"ACTIVITY_BANNER_RED_NOTICE","data":{"id":297,"type":"revenue_banner","icon":"http://i0.hdslb.com/bfs/live/0e2d597a243774241bf7b0a57ce096aa7a1f1bb1.png"},"_roomid":6154037}
 *
 * @interface ACTIVITY_BANNER_RED_NOTICE
 * @extends {danmuJson}
 */
interface ACTIVITY_BANNER_RED_NOTICE extends danmuJson {
  data: ACTIVITY_BANNER_RED_NOTICE_Data
}
interface ACTIVITY_BANNER_RED_NOTICE_Data {
  id: number
  type: string
  icon: string
}
/**
 * ACTIVITY_BANNER_RED_NOTICE_CLOSE
 * {"cmd":"ACTIVITY_BANNER_RED_NOTICE_CLOSE","data":{"id":297,"type":"revenue_banner"},"_roomid":21184521}
 *
 * @interface ACTIVITY_BANNER_RED_NOTICE_CLOSE
 * @extends {danmuJson}
 */
interface ACTIVITY_BANNER_RED_NOTICE_CLOSE extends danmuJson {
  data: ACTIVITY_BANNER_RED_NOTICE_CLOSE_Data
}
interface ACTIVITY_BANNER_RED_NOTICE_CLOSE_Data {
  id: number
  type: string
}
/**
 * ACTIVITY_BANNER_UPDATE
 * {"cmd":"ACTIVITY_BANNER_UPDATE","data":{"id":299,"title":"高阶夜精灵x1星","cover":"http://i0.hdslb.com/bfs/live/bc12d340d490d470d31292fb76fdccb5810256d0.png","background":"http://i0.hdslb.com/bfs/live/4807ff55e5b93980b4811ed6c0da69d8fc757a0c.png","jump_url":"https://live.bilibili.com/p/html/live-app-battle/u-anchor.html?is_live_half_webview=1&hybrid_biz=live-app-battle-u-anchor&hybrid_half_ui=1,5,272,320,0,0,30,0,8;2,5,272,320,0,0,30,0,8;3,5,272,320,0,0,30,0,8;4,5,272,320,0,0,30,0,8;5,5,272,320,0,0,30,0,8;6,5,272,320,0,0,30,0,8;7,5,272,320,0,0,30,0,8;8,5,272,320,0,0,30,0,8&battleAnchorId=361920358","title_color":"#ffffff","closeable":0,"banner_type":1,"weight":10,"web_text":"","web_cover":""},"_roomid":13620378}
 *
 * @interface ACTIVITY_BANNER_UPDATE
 * @extends {danmuJson}
 */
interface ACTIVITY_BANNER_UPDATE extends danmuJson {
  data: ACTIVITY_BANNER_UPDATE_Data
}
interface ACTIVITY_BANNER_UPDATE_Data {
  id: number
  title: string
  cover: string
  background: string
  jump_url: string
  title_color: string
  closeable: number
  banner_type: number
  weight: number
  web_text: string
  web_cover: string
}
/**
 * ACTIVITY_MATCH_GIFT
 * {"cmd":"ACTIVITY_MATCH_GIFT","data":{"action":"match_ing","status":1,"detail":{"match_id":1230,"home":{"team_name":"V5","url":"http://i0.hdslb.com/bfs/vc/a7f1f0d2cf38ce3cc65d8378555eb3c4967da239.png","ratio":"0","score":0,"gift_info":[{"gift_id":30095,"gift_name":"V5加油"}]},"visit":{"team_name":"OMG","url":"http://i0.hdslb.com/bfs/vc/559b0b567dc506f4e440d735d4ee926666036a5a.png","ratio":"0","score":0,"gift_info":[{"gift_id":30097,"gift_name":"OMG加油"}]}}},"_roomid":7734200}
 *
 * @interface ACTIVITY_MATCH_GIFT
 * @extends {danmuJson}
 */
interface ACTIVITY_MATCH_GIFT extends danmuJson {
  data: ACTIVITY_MATCH_GIFT_Data
}
interface ACTIVITY_MATCH_GIFT_Data {
  action: string
  status: number
  detail: ACTIVITY_MATCH_GIFT_Data_Detail
}
interface ACTIVITY_MATCH_GIFT_Data_Detail {
  match_id: number
  home: ACTIVITY_MATCH_GIFT_Data_Detail_Home
  visit: ACTIVITY_MATCH_GIFT_Data_Detail_Home
}
interface ACTIVITY_MATCH_GIFT_Data_Detail_Home {
  team_name: string
  url: string
  ratio: string
  score: number
  gift_info: ACTIVITY_MATCH_GIFT_Data_Detail_Home_GiftInfo[]
}
interface ACTIVITY_MATCH_GIFT_Data_Detail_Home_GiftInfo {
  gift_id: number
  gift_name: string
}
/**
 * ANIMATION
 * {"cmd":"ANIMATION","data":{"animation":"https://i0.hdslb.com/bfs/live/6826d0dfa20cccedfbe6a70d6acaabaa816774a3.svga","type":"BOSS","weights":100,"uid":2352558},"_roomid":5441}
 *
 * @interface ANIMATION
 * @extends {danmuJson}
 */
interface ANIMATION extends danmuJson {
  data: ANIMATION_Data
}
interface ANIMATION_Data {
  animation: string
  type: string
  weights: number
  uid: number
}
/**
 * BOSS_BATTLE
 * {"cmd":"BOSS_BATTLE","data":{"uname":"撸爆君","gift_id":30250,"number":1,"injury":521,"uid":383943229,"room_id":5441,"integral":105},"_roomid":5441}
 *
 * @interface BOSS_BATTLE
 * @extends {danmuJson}
 */
interface BOSS_BATTLE extends danmuJson {
  data: BOSS_BATTLE_Data;
}
interface BOSS_BATTLE_Data {
  uname: string
  gift_id: number
  number: number
  injury: number
  uid: number
  room_id: number
  integral: number
}
/**
 * BOSS_ENERGY
 * {"cmd":"BOSS_ENERGY","data":{"level":1,"valve":100000,"current":1400},"_roomid":2398184}
 *
 * @interface BOSS_ENERGY
 * @extends {danmuJson}
 */
interface BOSS_ENERGY extends danmuJson {
  data: BOSS_ENERGY_Data
}
interface BOSS_ENERGY_Data {
  level: number
  valve: number
  current: number
}
/**
 * BOSS_INFO
 * {"cmd":"BOSS_INFO","data":{"boss_status":1,"time":60,"energy_level":2,"base_level":1,"boss_id":1,"boss_type":"low_level","uid":2352558,"play_status":1,"energy_charging":{"level":0,"valve":0,"current":0,"energy_level":2},"battle":{"total_blood_volume":30000,"residual_blood_volume":30000,"energy_value":2,"boss_id":1,"boss_status":1,"ts":60,"boss_name":"混沌机甲 μSv型 "}},"_roomid":5441}
 *
 * @interface BOSS_INFO
 * @extends {danmuJson}
 */
interface BOSS_INFO extends danmuJson {
  data: BOSS_INFO_Data
}
interface BOSS_INFO_Data {
  boss_status: number
  time: number
  energy_level: number
  base_level: number
  boss_id: number
  boss_type: string
  uid: number
  play_status: number
  energy_charging: BOSS_INFO_Data_EnergyCharging
  battle: BOSS_INFO_Data_Battle
}
interface BOSS_INFO_Data_EnergyCharging {
  level: number
  valve: number
  current: number
  energy_level: number
}
interface BOSS_INFO_Data_Battle {
  total_blood_volume: number
  residual_blood_volume: number
  energy_value: number
  boss_id: number
  boss_status: number
  ts: number
  boss_name: string
}
/**
 * BOSS_INJURY
 * {"cmd":"BOSS_INJURY","data":{"total_blood_volume":30000,"residual_blood_volume":30000,"energy_value":260000,"boss_id":6709096266220967000,"is_query":0},"_roomid":5441}
 *
 * @interface BOSS_INJURY
 * @extends {danmuJson}
 */
interface BOSS_INJURY extends danmuJson {
  data: BOSS_INJURY_Data
}
interface BOSS_INJURY_Data {
  total_blood_volume: number
  residual_blood_volume: number
  energy_value: number
  boss_id: number
  is_query: number
}
/**
 * BOX_ACTIVITY_START
 * {"cmd":"BOX_ACTIVITY_START","aid":381,"_roomid":5440}
 *
 * @interface BOX_ACTIVITY_START
 * @extends {danmuJson}
 */
interface BOX_ACTIVITY_START extends danmuJson {
  aid: number
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
 * 礼物连击结束
 * {"cmd":"COMBO_END","data":{"uname":"即使雨过也无法掩盖","r_uname":"Milky_Vtuber","combo_num":99,"price":100,"gift_name":"铃铛","gift_id":30135,"start_time":1561207566,"end_time":1561207614,"guard_level":3,"send_master":null},"_roomid":21399689}
 *
 * @interface COMBO_END
 * @extends {danmuJson}
 */
interface COMBO_END extends danmuJson {
  /** 礼物连击结束 */
  data: COMBO_END_Data
}
interface COMBO_END_Data {
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
  /** 舰队等级 */
  guard_level?: number
  send_master: null
}
/**
 * 礼物连击
 * {"cmd":"COMBO_SEND","data":{"uid":20768080,"uname":"禾酉蕗萱","combo_num":5,"gift_name":"铃铛","gift_id":30135,"action":"赠送","combo_id":"gift:combo_id:20768080:218187245:30135:1561220902.2409","send_master":null},"_roomid":8712071}
 *
 * @interface COMBO_SEND
 * @extends {danmuJson}
 */
interface COMBO_SEND extends danmuJson {
  data: COMBO_SEND_Data
}
interface COMBO_SEND_Data {
  /** 送礼人UID */
  uid: number
  /** 送礼人 */
  uname: string
  /** 连击次数 */
  combo_num: number
  /** 礼物名 */
  gift_name: string
  /** 礼物ID */
  gift_id: number
  /** 赠送, 投喂 */
  action: string
  /** 连击ID, 不清楚用途 */
  combo_id: string
  send_master: null
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
 * DAILY_QUEST_NEWDAY
 * {"cmd":"DAILY_QUEST_NEWDAY","data":{},"_roomid":21356789}
 *
 * @interface DAILY_QUEST_NEWDAY
 * @extends {danmuJson}
 */
interface DAILY_QUEST_NEWDAY extends danmuJson {
  data: DAILY_QUEST_NEWDAY_Data
}
interface DAILY_QUEST_NEWDAY_Data { }
/**
 * DAILY_QUEST_REWARD
 * {"cmd":"DAILY_QUEST_REWARD","data":{"aid":214,"room_id":0},"_roomid":6154037}
 *
 * @interface DAILY_QUEST_REWARD
 * @extends {danmuJson}
 */
interface DAILY_QUEST_REWARD extends danmuJson {
  data: DAILY_QUEST_REWARD_Data
}
interface DAILY_QUEST_REWARD_Data {
  aid: number
  room_id: number
}
/**
 * 弹幕消息
 * {"cmd":"DANMU_MSG","info":[[0,1,25,16777215,1561207623,759452963,0,"f8027857",0,0,0],"今天放飞自我了吗",[10852054,"Sileafa",0,0,0,10000,1,""],[6,"湊阿夸","湊-阿库娅Official",14917277,5805790,""],[16,0,6406234,">50000"],["title-217-1","title-217-1"],0,0,null,{"ts":1561207623,"ct":"7F1CD824"}],"_roomid":21399689}
 *
 * @interface DANMU_MSG
 * @extends {danmuJson}
 */
interface DANMU_MSG extends danmuJson {
  info: DANMU_MSG_Info
}
interface DANMU_MSG_Info extends Array<number | string | null | DANMU_MSG_Info_Danmu | DANMU_MSG_Info_User | DANMU_MSG_Info_Medal | DANMU_MSG_Info_Rank | DANMU_MSG_Info_Other> {
  /** 弹幕信息 */
  0: DANMU_MSG_Info_Danmu
  /** 弹幕内容 */
  1: string
  /** 用户信息 */
  2: DANMU_MSG_Info_User
  /** 用户徽章 */
  3: DANMU_MSG_Info_Medal
  /** 用户排行 */
  4: DANMU_MSG_Info_Rank
  /** teamid */
  5: number
  /** 舰队等级 */
  6: number
  7: number
  8: null
  9: DANMU_MSG_Info_Other
}
interface DANMU_MSG_Info_Danmu extends Array<number | string> {
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
  9: number
  10: number
}
interface DANMU_MSG_Info_User extends Array<number | string> {
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
interface DANMU_MSG_Info_Medal extends Array<number | string> {
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
interface DANMU_MSG_Info_Rank extends Array<number | string> {
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
interface DANMU_MSG_Info_Other {
  ts: number
  ct: string
}
/**
 * 活动入场特效
 * {"cmd":"ENTRY_EFFECT","data":{"id":3,"uid":210983254,"target_id":20848957,"show_avatar":1,"copy_writing":"欢迎 <%失去_理智%> 进入房间","highlight_color":"#FFF100","basemap_url":"http://i0.hdslb.com/bfs/live/d208b9654b93a70b4177e1aa7e2f0343f8a5ff1a.png","effective_time":1,"priority":50,"privilege_type":2,"face":"http://i0.hdslb.com/bfs/face/3d47da79e92d9b7c676abca94730f744d296e8cd.jpg"},"_roomid":66688}
 * {"cmd":"ENTRY_EFFECT","data":{"id":4,"uid":18753702,"target_id":642922,"mock_effect":0,"face":"https://i0.hdslb.com/bfs/face/91ff8ce32941049cce41ec5c635c29d9ee353ee2.jpg","privilege_type":3,"copy_writing":"欢迎舰长 <%青山又依旧%> 进入直播间","copy_color":"","highlight_color":"#E6FF00","priority":70,"basemap_url":"https://i0.hdslb.com/bfs/live/1fa3cc06258e16c0ac4c209e2645fda3c2791894.png","show_avatar":1,"effective_time":2,"web_basemap_url":"","web_effective_time":0,"web_effect_close":0,"web_close_time":0},"_roomid":146088}
 *
 * @interface ENTRY_EFFECT
 * @extends {danmuJson}
 */
interface ENTRY_EFFECT extends danmuJson {
  data: ENTRY_EFFECT_Data
}
interface ENTRY_EFFECT_Data {
  id: number
  uid: number
  target_id: number
  mock_effect: number
  face: string
  privilege_type: number
  copy_writing: string
  copy_color: string
  highlight_color: string
  priority: number
  basemap_url: string
  show_avatar: number
  effective_time: number
  web_basemap_url: string
  web_effective_time: number
  web_effect_close: number
  web_close_time: number
}
/**
 * FREE_GIFT_BUBBLE
 * {"cmd":"FREE_GIFT_BUBBLE","data":{"text":"你已观看<%10分钟，收到道具奖励铃音×1。(今日1/3)   查看活动%>","color":"#FFFFFFFF","highlight":"#FDFF2FFF","url":"https://live.bilibili.com/blackboard/sound-guardian-2019-full.html?is_live_full_webview=1&hybrid_set_header=2#/","is_detail":1},"_roomid":1972520}
 *
 * @interface FREE_GIFT_BUBBLE
 * @extends {danmuJson}
 */
interface FREE_GIFT_BUBBLE extends danmuJson {
  data: FREE_GIFT_BUBBLE_Data
}
interface FREE_GIFT_BUBBLE_Data {
  text: string
  color: string
  highlight: string
  url: string
  is_detail: number
}
/**
 * 舰队购买
 * {"cmd":"GUARD_BUY","data":{"uid":101961799,"username":"cxr0819","guard_level":3,"num":1,"price":198000,"gift_id":10003,"gift_name":"舰长","start_time":1561220913,"end_time":1561220913},"_roomid":102002}
 *
 * @interface GUARD_BUY
 * @extends {danmuJson}
 */
interface GUARD_BUY extends danmuJson {
  data: GUARD_BUY_Data
}
interface GUARD_BUY_Data {
  /** 用户uid */
  uid: number
  /** 用户名 */
  username: string
  /** 舰队等级 */
  guard_level: number
  /** 购买数量 */
  num: number
  price: number
  gift_id: number
  gift_name: string
  start_time: number
  end_time: number
}
/**
 * 舰队抽奖
 * {"cmd":"GUARD_LOTTERY_START","data":{"id":1208107,"roomid":33989,"message":"吐槽的鸡蛋 在【33989】购买了舰长，请前往抽奖","type":"guard","privilege_type":3,"link":"https://live.bilibili.com/33989","payflow_id":"gds_062f15aaef74f20c63_201906","lottery":{"id":1208107,"sender":{"uid":7123682,"uname":"吐槽的鸡蛋","face":"http://i2.hdslb.com/bfs/face/1c732b7c8c90c6fddcab905a309015385bbdff02.jpg"},"keyword":"guard","privilege_type":3,"time":1200,"status":1,"mobile_display_mode":2,"mobile_static_asset":"","mobile_animation_asset":""}},"_roomid":33989}
 *
 * @interface GUARD_LOTTERY_START
 * @extends {LOTTERY_START}
 */
interface GUARD_LOTTERY_START extends LOTTERY_START { }
/**
 * 舰队消息
 * {"cmd":"GUARD_MSG","msg":"用户 :?EricOuO:? 在主播 七七见奈波丶 的直播间开通了总督","buy_type":1,"_roomid":23058}
 * {"cmd":"GUARD_MSG","msg":":?cxr0819:? 在本房间开通了舰长","buy_type":3,"_roomid":102002}
 *
 * @interface GUARD_MSG
 * @extends {danmuJson}
 */
interface GUARD_MSG extends danmuJson {
  /** 消息内容 */
  msg: string
  /** 舰队等级 */
  buy_type: number
}
/**
 * 小时榜
 * {"action":"anchor_reward","cmd":"HOUR_RANK_AWARDS","data":{"award_desc":"你已获得奖励干杯十周年头像框 可前往【主播奖励】中查看使用","award_url":"https://i0.hdslb.com/bfs/vc/a7a3ef8d26f56745ee2afd05bf56dedea36293f0.png","award_warn":"","button_content":"我知道啦！","jump_content":"立即查看","jump_url":"https://live.bilibili.com/p/html/live-app-award/index.html?is_live_webview=1","rank_content":"2019-06-23 ~ 2019-06-27","roomid":21320551,"ruid":406805563,"title":"恭喜获得干杯十周年头像框","web_jump_url":"http://link.bilibili.com/p/center/index#/my-room/anchor-awards/my-awards"},"_roomid":21320551}
 *
 * @interface HOUR_RANK_AWARDS
 * @extends {danmuJson}
 */
interface HOUR_RANK_AWARDS extends danmuJson {
  action: string
  data: HOUR_RANK_AWARDS_Data
}
interface HOUR_RANK_AWARDS_Data {
  roomid: number
  ruid: number
  uname: string
  face: string
  rank_desc: string
  content: string
  life_cycle: number
}
interface HOUR_RANK_AWARDS_Data {
  award_desc: string
  award_url: string
  award_warn: string
  button_content: string
  jump_content: string
  jump_url: string
  rank_content: string
  roomid: number
  ruid: number
  title: string
  web_jump_url: string
}
/**
 * 勋章亲密度上限
 * {"cmd":"LITTLE_TIPS","data":{"msg":"你的粉丝勋章【鸭腿饭】已达今日亲密度上限"},"_roomid":8181609}
 *
 * @interface LITTLE_TIPS
 * @extends {danmuJson}
 */
interface LITTLE_TIPS extends danmuJson {
  data: LITTLE_TIPS_Data
}
interface LITTLE_TIPS_Data {
  msg: string
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
 *
 * {"cmd":"LOL_ACTIVITY","data":{"action":"vote_begin","match_id":4919,"timestamp":1561280945,"guess_info":null},"_roomid":7734200}
 *
 * @interface LOL_ACTIVITY
 * @extends {danmuJson}
 */
interface LOL_ACTIVITY extends danmuJson {
  data: LOL_ACTIVITY_Data
}
interface LOL_ACTIVITY_Data {
  action: string
  match_id: number
  timestamp: number
  guess_info: null
}
/**
 * 抽奖LOTTERY
 * {"cmd":"LOTTERY_START","data":{"id":1208160,"roomid":21348734,"message":"1960718-自闭 在【21348734】购买了总督，请前往抽奖","type":"guard","privilege_type":1,"link":"https://live.bilibili.com/21348734","payflow_id":"gds_5f4fe3a3e3a9fdfa79_201906","lottery":{"id":1208160,"sender":{"uid":399569898,"uname":"1960718-自闭","face":"http://i2.hdslb.com/bfs/face/6a65573bd51323ca5bf1d5ae8ab223136ae30376.jpg"},"keyword":"guard","privilege_type":1,"time":86400,"status":1,"mobile_display_mode":2,"mobile_static_asset":"","mobile_animation_asset":""}},"_roomid":21348734}
 *
 * @interface LOTTERY_START
 * @extends {danmuJson}
 */
interface LOTTERY_START extends danmuJson {
  data: LOTTERY_START_Data
}
interface LOTTERY_START_Data {
  /* 编号 */
  id: number
  /* 房间号 */
  roomid: number
  /* 消息 */
  message: string
  /* 抽奖类型 */
  type: string
  privilege_type: number
  /* 房间链接 */
  link: string
  payflow_id: string
  /* 抽奖信息 */
  lottery: LOTTERY_START_Data_Lottery
}
interface LOTTERY_START_Data_Lottery {
  /* 编号 */
  id: number
  /* 抽奖发起人信息 */
  sender: LOTTERY_START_Data_Lottery_Sender
  /* 关键字, 目前和type一致 */
  keyword: string
  privilege_type: number
  time: number
  status: number
  mobile_display_mode: number
  mobile_static_asset: string
  mobile_animation_asset: string
}
interface LOTTERY_START_Data_Lottery_Sender {
  /* 发起人uid */
  uid: number
  /* 发起人昵称 */
  uname: string
  /* 头像地址 */
  face: string
}
/**
 * LUCK_GIFT_AWARD_MASTER
 * {"cmd":"LUCK_GIFT_AWARD_MASTER","data":{"uid":111977978,"gift_name":"铃铛","coin":"4.2万","gift_icon":"http://i0.hdslb.com/bfs/live/mlive/8fafc27e5ecc8a6c3cd314a86333a6a93b695f5c.png","start_time":"22:00","end_time":"00:00","user_uname":"芋圆奶茶妹儿"},"_roomid":10633444}
 *
 * @interface LUCK_GIFT_AWARD_MASTER
 * @extends {danmuJson}
 */
interface LUCK_GIFT_AWARD_MASTER extends danmuJson {
  data: LUCK_GIFT_AWARD_MASTER_Data
}
interface LUCK_GIFT_AWARD_MASTER_Data {
  uid: number
  gift_name: string
  coin: string
  gift_icon: string
  start_time: string
  end_time: string
  user_uname: string
}
/**
 * LUCK_GIFT_AWARD_USER
 * {"cmd":"LUCK_GIFT_AWARD_USER","data":{"type":1,"uid":40780684,"gift_name":"铃铛","coin":"100","gift_icon":"http://s1.hdslb.com/bfs/live/ee04980f412a49137648eac0c9c3285cadf117ad.png","rate":1,"start_time":"","end_time":""},"_roomid":2710582}
 *
 * @interface LUCK_GIFT_AWARD_USER
 * @extends {danmuJson}
 */
interface LUCK_GIFT_AWARD_USER extends danmuJson {
  data: LUCK_GIFT_AWARD_USER_Data
}
interface LUCK_GIFT_AWARD_USER_Data {
  type: number
  uid: number
  gift_name: string
  coin: string
  gift_icon: string
  rate: number
  start_time: string
  end_time: string
}
/**
 * MESSAGEBOX_USER_GAIN_MEDAL
 * {"cmd":"MESSAGEBOX_USER_GAIN_MEDAL","data":{"type":1,"uid":15316606,"up_uid":4425196,"medal_id":178360,"medal_name":"千本莺","medal_level":3,"medal_color":6406234,"msg_title":"都已经上了<%黑子莺%>的船，怎么能没有TA的粉丝勋章呢？送你一个吧~","msg_content":"获得750点亲密度\n你的粉丝勋章达到3级","normal_color":7697781,"highlight_color":16478873,"intimacy":0,"next_intimacy":0,"today_feed":0,"day_limit":0},"_roomid":6040401}
 *
 * @interface MESSAGEBOX_USER_GAIN_MEDAL
 * @extends {danmuJson}
 */
interface MESSAGEBOX_USER_GAIN_MEDAL extends danmuJson {
  data: MESSAGEBOX_USER_GAIN_MEDAL_Data
}
interface MESSAGEBOX_USER_GAIN_MEDAL_Data {
  type: number
  uid: number
  up_uid: number
  medal_id: number
  medal_name: string
  medal_level: number
  medal_color: number
  msg_title: string
  msg_content: string
  normal_color: number
  highlight_color: number
  intimacy: number
  next_intimacy: number
  today_feed: number
  day_limit: number
}
/**
 * new_anchor_reward
 * {"cmd":"new_anchor_reward","reward_id":1,"roomid":1700021,"uid":52772953,"_roomid":1700021}
 *
 * @interface new_anchor_reward
 * @extends {danmuJson}
 */
interface new_anchor_reward extends danmuJson {
  reward_id: number
  uid: number
}
/**
 * 房间通知
 * {"cmd":"NOTICE_MSG","full":{"head_icon":"","is_anim":1,"tail_icon":"","background":"#33ffffff","color":"#33ffffff","highlight":"#33ffffff","border":"#33ffffff","time":10},"half":{"head_icon":"","is_anim":0,"tail_icon":"","background":"#33ffffff","color":"#33ffffff","highlight":"#33ffffff","border":"#33ffffff","time":8},"roomid":"360972","real_roomid":"493","msg_common":"恭喜<%千里一醉醉醉醉醉醉%>获得大奖<%100x普通扭蛋币%>, 感谢<%丨四四丨%>的赠送","msg_self":"恭喜<%千里一醉醉醉醉醉醉%>获得大奖<%100x普通扭蛋币%>, 感谢<%丨四四丨%>的赠送","link_url":"http://live.bilibili.com/493","msg_type":4,"_roomid":360972}
 * {"cmd":"NOTICE_MSG","full":{"head_icon":"http://i0.hdslb.com/bfs/live/72337e86020b8d0874d817f15c48a610894b94ff.png","tail_icon":"http://i0.hdslb.com/bfs/live/822da481fdaba986d738db5d8fd469ffa95a8fa1.webp","head_icon_fa":"http://i0.hdslb.com/bfs/live/72337e86020b8d0874d817f15c48a610894b94ff.png","tail_icon_fa":"http://i0.hdslb.com/bfs/live/38cb2a9f1209b16c0f15162b0b553e3b28d9f16f.png","head_icon_fan":1,"tail_icon_fan":4,"background":"#FFB03CFF","color":"#FFFFFFFF","highlight":"#B25AC1FF","time":10},"half":{"head_icon":"","tail_icon":"","background":"","color":"","highlight":"","time":8},"side":{"head_icon":"http://i0.hdslb.com/bfs/live/31566d8cd5d468c30de8c148c5d06b3b345d8333.png","background":"#FFE9C8FF","color":"#EF903AFF","highlight":"#D54900FF","border":"#FFCFA4FF"},"roomid":102002,"real_roomid":102002,"msg_common":"<%cxr0819%>在本房间开通了舰长","msg_self":"<%cxr0819%>在本房间开通了舰长","link_url":"https://live.bilibili.com/102002?live_lottery_type=2&broadcast_type=0&from=28003&extra_jump_from=28003","msg_type":3,"shield_uid":-1,"_roomid":102002}
 *
 * @interface NOTICE_MSG
 * @extends {danmuJson}
 */
interface NOTICE_MSG extends danmuJson {
  full: NOTICE_MSG_Full
  half: NOTICE_MSG_Half
  side: NOTICE_MSG_Side
  roomid: number
  real_roomid: number
  msg_common: string
  msg_self: string
  link_url: string
  msg_type: number
  shield_uid: number
}
interface NOTICE_MSG_Full {
  head_icon: string
  tail_icon: string
  head_icon_fa: string
  tail_icon_fa: string
  head_icon_fan: number
  tail_icon_fan: number
  background: string
  color: string
  highlight: string
  time: number
}
interface NOTICE_MSG_Half {
  head_icon: string
  tail_icon: string
  background: string
  color: string
  highlight: string
  time: number
}
interface NOTICE_MSG_Side {
  head_icon: string
  background: string
  color: string
  highlight: string
  border: string
}
/**
 * 房间通知
 * {"cmd":"NOTICE_MSG_H5","data":{"msg":"<%s>降临在<%s>的直播间，参战获大奖！","value":["混沌机甲 mSv型","老骚豆腐"],"special_index":[2],"room_id":763679,"ts":1562655097},"_roomid":21203168}
 *
 * @interface NOTICE_MSG_H5
 * @extends {danmuJson}
 */
interface NOTICE_MSG_H5 extends danmuJson {
  data: NOTICE_MSG_H5_Data
}
interface NOTICE_MSG_H5_Data {
  msg: string
  value: string[]
  special_index: number[]
  room_id: number
  ts: number
}

/**
 * 连麦PK
 *
 * @interface PK_MIC_Base
 * @extends {danmuJson}
 */
interface PK_MIC_Base extends danmuJson {
  /** PK编号 */
  pk_id: number | string
  /** PK状态 */
  pk_status: number
}
/**
 * PK抽奖
 *
 * @interface PK_BATTLE_Base
 * @extends {danmuJson}
 */
interface PK_BATTLE_Base extends danmuJson {
  /** PK编号 */
  pk_id: number | string
  /** PK状态 */
  pk_status: number
  timestamp: number
}
/**
 * 再次PK匹配
 * {"cmd":"PK_AGAIN","pk_id":8159,"pk_status":400,"data":{"new_pk_id":8179,"init_id":13566,"match_id":7326390,"escape_time":5,"is_portrait":true,"uname":"宇天学长","face":"http://i2.hdslb.com/bfs/face/488dda4a85251f9d0fd9ad82a733f874b5cec585.jpg","uid":261738266},"roomid":13566,"_roomid":13566}
 * {"cmd":"PK_AGAIN","pk_id":355519,"pk_status":400,"data":{"new_pk_id":355576,"init_id":21447960,"match_id":21435682,"escape_all_time":10,"escape_time":10,"is_portrait":true,"uname":"我回来的晚","face":"http://i1.hdslb.com/bfs/face/526dc5171e40ad29ae07e1157df1e34a6bbbc51c.jpg","uid":60261316},"_roomid":21447960}
 * 
 * @interface PK_AGAIN
 * @extends {PK_MIC_Base}
 */
interface PK_AGAIN extends PK_MIC_Base {
  data: PK_AGAIN_Data
}
interface PK_AGAIN_Data {
  /** 新PK ID */
  new_pk_id: number
  init_id: number
  match_id: number
  escape_all_time: number
  escape_time: number
  is_portrait: boolean
  uname: string
  face: string
  uid: number
}
/**
 * PK_BATTLE_END
 * {"cmd":"PK_BATTLE_END","pk_id":"355216","pk_status":501,"timestamp":1561207642,"data":{"timer":10,"init_info":{"room_id":1081018,"votes":11550,"winner_type":3,"best_uname":"我要是不是这么差劲"},"match_info":{"room_id":82649,"votes":241,"winner_type":-1,"best_uname":"没有昵称_嗯_就这样"}},"_roomid":1081018}
 *
 * @interface PK_BATTLE_END
 * @extends {PK_BATTLE_Base}
 */
interface PK_BATTLE_END extends PK_BATTLE_Base {
  data: PK_BATTLE_END_Data
}
interface PK_BATTLE_END_Data {
  timer: number
  init_info: PK_BATTLE_END_Data_Info
  match_info: PK_BATTLE_END_Data_Info
}
interface PK_BATTLE_END_Data_Info {
  room_id: number
  votes: number
  winner_type: number
  best_uname: string
}
/**
 * PK_BATTLE_ENTRANCE
 * {"cmd":"PK_BATTLE_ENTRANCE","timestamp":1561305600,"data":{"is_open":false},"_roomid":10401}
 *
 * @interface PK_BATTLE_ENTRANCE
 * @extends {danmuJson}
 */
interface PK_BATTLE_ENTRANCE extends danmuJson {
  timestamp: number
  data: PK_BATTLE_ENTRANCE_Data
}
interface PK_BATTLE_ENTRANCE_Data {
  is_open: boolean
}
/**
 * PK_BATTLE_GIFT
 * {"cmd":"PK_BATTLE_GIFT","timestamp":1561207906,"pk_id":355254,"pk_status":201,"data":{"room_id":2783769,"gift_id":30240,"gift_msg":"楼楼OuO赠送了一个时光沙漏"},"_roomid":350350}
 *
 * @interface PK_BATTLE_GIFT
 * @extends {PK_BATTLE_Base}
 */
interface PK_BATTLE_GIFT extends PK_BATTLE_Base {
  data: PK_BATTLE_GIFT_Data
}
interface PK_BATTLE_GIFT_Data {
  room_id: number
  gift_id: number
  gift_msg: string
}
/**
 * PK_BATTLE_PREP
 * {"cmd":"PK_BATTLE_PRE","pk_status":101,"pk_id":355225,"timestamp":1561207638,"data":{"uname":"佛系疯子","face":"http://i1.hdslb.com/bfs/face/606bcb666c83eea0008e14dd29d9dcaebd671f0e.jpg","uid":97081256,"room_id":11783010,"pre_timer":10,"pk_votes_name":"魔法值"},"_roomid":8049781}
 *
 * @interface PK_BATTLE_PREP
 * @extends {PK_BATTLE_Base}
 */
interface PK_BATTLE_PREP extends PK_BATTLE_Base {
  data: PK_BATTLE_PRE_Data
}
interface PK_BATTLE_PRE_Data {
  uname: string
  face: string
  uid: number
  room_id: number
  pre_timer: number
  pk_votes_name: string
}
/**
 * PK_BATTLE_PRO_TYPE
 * {"cmd":"PK_BATTLE_PRO_TYPE","pk_id":355219,"pk_status":301,"timestamp":1561207641,"data":{"timer":60,"final_hit_room_id":2783769,"be_final_hit_room_id":8152225},"_roomid":2783769}
 *
 * @interface PK_BATTLE_PRO_TYPE
 * @extends {PK_BATTLE_Base}
 */
interface PK_BATTLE_PRO_TYPE extends PK_BATTLE_Base {
  data: PK_BATTLE_PRO_TYPE_Data
}
interface PK_BATTLE_PRO_TYPE_Data {
  timer: number
  final_hit_room_id: number
  be_final_hit_room_id: number
}
/**
 * PK_BATTLE_PROCESS
 * {"cmd":"PK_BATTLE_PROCESS","pk_id":355187,"pk_status":301,"timestamp":1561207625,"data":{"init_info":{"room_id":21396513,"votes":138136,"best_uname":"小阿兔呀"},"match_info":{"room_id":50821,"votes":78764,"best_uname":"东望尽夜"}},"_roomid":21396513}
 *
 * @interface PK_BATTLE_PROCESS
 * @extends {PK_BATTLE_Base}
 */
interface PK_BATTLE_PROCESS extends PK_BATTLE_Base {
  data: PK_BATTLE_PROCESS_Data
}
interface PK_BATTLE_PROCESS_Data {
  init_info: PK_BATTLE_PROCESS_Data_Info
  match_info: PK_BATTLE_PROCESS_Data_Info
}
interface PK_BATTLE_PROCESS_Data_Info {
  room_id: number
  votes: number
  best_uname: string
}
/**
 * PK_BATTLE_RANK_CHANGE
 * {"cmd":"PK_BATTLE_RANK_CHANGE","timestamp":1561207681,"data":{"first_rank_img_url":"http://i0.hdslb.com/bfs/live/bc12d340d490d470d31292fb76fdccb5810256d0.png","rank_name":"高阶夜精灵x1星"},"_roomid":12482083}
 *
 * @interface PK_BATTLE_RANK_CHANGE
 * @extends {danmuJson}
 */
interface PK_BATTLE_RANK_CHANGE extends danmuJson {
  timestamp: number
  data: PK_BATTLE_RANK_CHANGE_Data
}
interface PK_BATTLE_RANK_CHANGE_Data {
  first_rank_img_url: string
  rank_name: string
}
/**
 * PK_BATTLE_SETTLE_USER
 * {"cmd":"PK_BATTLE_SETTLE_USER","pk_id":355216,"pk_status":501,"settle_status":1,"timestamp":1561207642,"data":{"settle_status":1,"result_type":3,"winner":{"uid":5995772,"uname":"白天才不是憨憨穆子","face":"http://i0.hdslb.com/bfs/face/03f59ce1eff6b22ba863dcb110a259fb0ab0cff7.jpg","face_frame":"https://i0.hdslb.com/bfs/vc/a7a3ef8d26f56745ee2afd05bf56dedea36293f0.png","exp":{"color":16746162,"user_level":47,"master_level":{"color":10512625,"level":25}},"best_user":{"uid":432037150,"uname":"我要是不是这么差劲","face":"http://i0.hdslb.com/bfs/face/449faf6225c6cd25675135f6dbb6f1862cb24cdf.jpg","pk_votes":11550,"pk_votes_name":"魔法值","exp":{"color":6406234,"level":1},"face_frame":"http://i0.hdslb.com/bfs/live/78e8a800e97403f1137c0c1b5029648c390be390.png","badge":"","award_info":null}}},"_roomid":1081018}
 *
 * @interface PK_BATTLE_SETTLE_USER
 * @extends {PK_BATTLE_Base}
 */
interface PK_BATTLE_SETTLE_USER extends PK_BATTLE_Base {
  settle_status: number
  data: PK_BATTLE_SETTLE_USER_Data
}
interface PK_BATTLE_SETTLE_USER_Data {
  settle_status: number
  result_type: number
  winner: PK_BATTLE_SETTLE_USER_Data_Winner
}
interface PK_BATTLE_SETTLE_USER_Data_Winner {
  uid: number
  uname: string
  face: string
  face_frame: string
  exp: PK_SETTLE_Data_UserInfoEx_Exp
  best_user: PK_BATTLE_SETTLE_USER_Data_Winner_BestUser
}
interface PK_BATTLE_SETTLE_USER_Data_Winner_BestUser {
  uid: number
  uname: string
  face: string
  pk_votes: number
  pk_votes_name: string
  exp: PK_SETTLE_Data_UserInfoEx_Exp_MasterLevel
  face_frame: string
  badge: string
  award_info: null
}
/**
 * PK_BATTLE_SETTLE
 * {"cmd":"PK_BATTLE_SETTLE","pk_id":355216,"pk_status":501,"settle_status":1,"timestamp":1561207642,"data":{"result_type":3},"_roomid":1081018}
 *
 * @interface PK_BATTLE_SETTLE
 * @extends {PK_BATTLE_Base}
 */
interface PK_BATTLE_SETTLE extends PK_BATTLE_Base {
  settle_status: number
  data: PK_BATTLE_SETTLE_Data
}
interface PK_BATTLE_SETTLE_Data {
  result_type: number
}
/**
 * PK_BATTLE_START
 * {"cmd":"PK_BATTLE_START","pk_id":355225,"pk_status":201,"timestamp":1561207648,"data":{"final_hit_votes":10000,"pk_start_time":1561207648,"pk_frozen_time":1561208128,"pk_end_time":1561208138,"pk_votes_type":1,"pk_votes_add":0.05,"pk_votes_name":"魔法值"},"_roomid":8049781}
 *
 * @interface PK_BATTLE_START
 * @extends {PK_BATTLE_Base}
 */
interface PK_BATTLE_START extends PK_BATTLE_Base {
  data: PK_BATTLE_START_Data
}
interface PK_BATTLE_START_Data {
  final_hit_votes: number
  pk_start_time: number
  pk_frozen_time: number
  pk_end_time: number
  pk_votes_type: number
  pk_votes_add: number
  pk_votes_name: string
}
/**
 * PK_BATTLE_VOTES_ADD
 * {"cmd":"PK_BATTLE_VOTES_ADD","timestamp":1561291201,"data":{"type":1,"pk_votes_add":0.05,"pk_votes_name":"魔法值"},"_roomid":5648515}
 *
 * @interface PK_BATTLE_VOTES_ADD
 * @extends {danmuJson}
 */
interface PK_BATTLE_VOTES_ADD extends danmuJson {
  timestamp: number
  data: PK_BATTLE_VOTES_ADD_Data
}
interface PK_BATTLE_VOTES_ADD_Data {
  type: number
  pk_votes_add: number
  pk_votes_name: string
}
/**
 * 再次PK
 * {"cmd":"PK_CLICK_AGAIN","pk_status":400,"pk_id":355267,"_roomid":21447960}
 *
 * @interface PK_CLICK_AGAIN
 * @extends {PK_MIC_Base}
 */
interface PK_CLICK_AGAIN extends PK_MIC_Base { }
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
 * 取消PK邀请
 * {"cmd":"PK_INVITE_CANCEL","pk_invite_status":1200,"invite_id":28675,"face":"http://i1.hdslb.com/bfs/face/83047a7942e31b07e60315387f1eda3e2942af3a.jpg","uname":"奶斌233","area_name":"视频唱见","user_level":5,"master_level":13,"_roomid":12036773}
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
 * PK邀请失败
 * {"cmd":"PK_INVITE_FAIL","pk_invite_status":1100,"invite_id":28651,"_roomid":8531717} 
 *
 * @interface PK_INVITE_FAIL
 * @extends {danmuJson}
 */
interface PK_INVITE_FAIL extends danmuJson {
  pk_invite_status: number
  invite_id: number
}
/**
 * PK邀请
 * {"cmd":"PK_INVITE_INIT","pk_invite_status":200,"invite_id":28649,"face":"http://i1.hdslb.com/bfs/face/cdc543c074181d2add96add37f270e4e2e3df596.jpg","uname":"林丫丫吖","area_name":"视频聊天","user_level":24,"master_level":25,"_roomid":21213163}
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
 * 禁用PK邀请
 * {"cmd":"PK_INVITE_SWITCH_CLOSE","_roomid":10522286}
 *
 * @interface PK_INVITE_SWITCH_CLOSE
 * @extends {danmuJson}
 */
interface PK_INVITE_SWITCH_CLOSE extends danmuJson { }
/**
 * 启用PK邀请
 * {"cmd":"PK_INVITE_SWITCH_OPEN","_roomid":10522286}
 *
 * @interface PK_INVITE_SWITCH_OPEN
 * @extends {danmuJson}
 */
interface PK_INVITE_SWITCH_OPEN extends danmuJson { }
/**
 * PK_LOTTERY_START
 * {"cmd":"PK_LOTTERY_START","data":{"asset_animation_pic":"https://i0.hdslb.com/bfs/live/e1ab9f88b4af63fbf15197acea2dbb60bfc4434b.gif","asset_icon":"https://i0.hdslb.com/bfs/vc/44c367b09a8271afa22853785849e65797e085a1.png","id":355216,"max_time":120,"pk_id":355216,"room_id":1081018,"time":120,"title":"恭喜主播大乱斗胜利"},"_roomid":1081018}
 *
 * @interface PK_LOTTERY_START
 * @extends {danmuJson}
 */
interface PK_LOTTERY_START extends danmuJson {
  data: PK_LOTTERY_START_Data
}
interface PK_LOTTERY_START_Data {
  asset_animation_pic: string
  asset_icon: string
  id: number
  max_time: number
  pk_id: number
  room_id: number
  time: number
  title: string
}
/**
 * PK匹配
 * {"cmd":"PK_MATCH","pk_status":100,"pk_id":355267,"data":{"init_id":21447960,"match_id":14669408,"escape_all_time":10,"escape_time":10,"is_portrait":false,"uname":"周彤飞","face":"http://static.hdslb.com/images/member/noface.gif","uid":30909335},"_roomid":21447960}
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
  escape_all_time: number
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
 * 连麦PK结束
 * {"cmd":"PK_MIC_END","pk_id":355246,"pk_status":1200,"data":{"type":0,"exception_id":4166756},"_roomid":4166756}
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
  exception_id: number
}
/**
 * PK准备
 * {"cmd":"PK_PRE","pk_id":355267,"pk_status":200,"data":{"init_id":21447960,"match_id":14669408,"count_down":5,"pk_topic":"用方言唱歌","pk_pre_time":1561207978,"pk_start_time":1561207983,"pk_end_time":1561208283,"end_time":1561208403},"_roomid":21447960}
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
 * PK进行
 * {"cmd":"PK_PROCESS","pk_id":355398,"pk_status":300,"data":{"uid":237804145,"init_votes":0,"match_votes":1,"user_votes":1},"_roomid":4166756}
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
 * PK结束数据
 * {"cmd":"PK_SETTLE","pk_id":355193,"pk_status":400,"data":{"pk_id":355193,"init_info":{"uid":29187134,"init_id":12021409,"uname":"抗压第一人","face":"http://i1.hdslb.com/bfs/face/a2ef8e2513cbe4a54321b837a5ee2a0adaf2db11.jpg","votes":0,"is_winner":false},"match_info":{"uid":1969625,"match_id":4166756,"uname":"敏敏萌芽","face":"http://i1.hdslb.com/bfs/face/c294cebc6dcd5f6478b7c0cc71576321f2491601.jpg","votes":1,"is_winner":true,"vip_type":0,"exp":{"color":6406234,"user_level":11,"master_level":{"level":18,"color":5805790}},"vip":{"vip":0,"svip":0},"face_frame":"","badge":{"url":"","desc":"","position":0}},"best_user":{"uid":22971990,"uname":"沉溺恋爱的味道","face":"http://i1.hdslb.com/bfs/face/7fd08e51dd8e0efc06bd70ea4c6cc79b8dbc6905.jpg","vip_type":2,"exp":{"color":9868950,"user_level":10,"master_level":{"level":1,"color":6406234}},"vip":{"vip":0,"svip":0},"privilege_type":0,"face_frame":"","badge":{"url":"http://i0.hdslb.com/bfs/live/b5e9ebd5ddb979a482421ca4ea2f8c1cc593370b.png","desc":"","position":3}},"punish_topic":"惩罚：模仿小拳拳捶你胸口"},"_roomid":4166756}
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
  master_level: PK_SETTLE_Data_UserInfoEx_Exp_MasterLevel
}
interface PK_SETTLE_Data_UserInfoEx_Exp_MasterLevel {
  /** 直播等级 */
  level: number
  /** 直播等级颜色 */
  color: number
}
interface PK_SETTLE_Data_UserInfoEx_Badge {
  /** 徽章图片地址 */
  url: string
  /** 描述 */
  desc: string
  /** 位置 */
  position: number
}
interface PK_SETTLE_Data_InitInfo extends PK_SETTLE_Data_UserInfo {
  /** 发起人房间号 */
  init_id: number
}
interface PK_SETTLE_Data_MatchInfo extends PK_SETTLE_Data_UserInfo, PK_SETTLE_Data_UserInfoEx {
  /** 匹配人房间号 */
  match_id: number
}
interface PK_SETTLE_Data_BestUser extends PK_SETTLE_Data_UserInfoBase, PK_SETTLE_Data_UserInfoEx {
  privilege_type: number
}
/**
 * PK开始
 * {"cmd":"PK_START","pk_id":355267,"pk_status":300,"data":{"init_id":21447960,"match_id":14669408,"pk_topic":"用方言唱歌"},"_roomid":21447960}
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
 * 准备直播, 下播
 * {"cmd":"PREPARING","round":1,"roomid":"66287","_roomid":66287}
 * {"cmd":"PREPARING","roomid":"16290","_roomid":16290}
 *
 * @interface PREPARING
 * @extends {danmuJson}
 */
interface PREPARING extends danmuJson {
  round?: number
}
/**
 * 抽奖结束
 * {"cmd":"RAFFLE_END","data":{"id":"335548","uname":"逗流流","sname":"奥利姐姐","giftName":"50x铃音","mobileTips":"恭喜 逗流流 获得50x铃音","raffleId":"335548","type":"GIFT_30207","from":"奥利姐姐","fromFace":"http://i2.hdslb.com/bfs/face/48d2ae09c264e6ba54fe9ff2a08b169bfa638933.jpg","fromGiftId":30207,"win":{"uname":"逗流流","face":"http://i1.hdslb.com/bfs/face/91c4f94f5df2bf8da53b5afb4c36d18ab7b64397.jpg","giftName":"铃音","giftId":"30208","giftNum":50,"giftImage":"http://i0.hdslb.com/bfs/vc/dbdb7650aaed224f88115566d38991bd0b21f06d.png","msg":"恭喜<%逗流流%>获得大奖<%50x铃音%>, 感谢<%奥利姐姐%>的赠送"}},"_roomid":635644}
 *
 * @interface RAFFLE_END
 * @extends {danmuJson}
 */
interface RAFFLE_END extends danmuJson {
  data: RAFFLE_END_Data
}
interface RAFFLE_END_Data {
  /** 抽奖编号 */
  id: string
  /** 获赠人 */
  uname: string
  /** 赠送人 */
  sname: string
  /** '10W银瓜子' | '抱枕' */
  giftName: string
  /** 中奖消息 */
  mobileTips: string
  /** 编号 */
  raffleId: number
  /** 文案 */
  type: string
  /** 赠送人 */
  from: string
  /** 赠送人头像地址 */
  fromFace: string
  fromGiftId: number
  win: RAFFLE_END_Data_Win
}
interface RAFFLE_END_Data_Win {
  /** 获赠人 */
  uname: string
  /** 获赠人头像地址 */
  face: string
  /** 礼物名 '银瓜子' | '经验原石' */
  giftName: string
  /** 礼物类型 'silver' | 'stuff-1' */
  giftId: string
  /** 礼物数量 100000 | 10 */
  giftNum: number
  /** 礼物图片 */
  giftImage: string
  /** 中奖消息 */
  msg: string
}
/**
 * 抽奖开始
 * {"cmd":"RAFFLE_START","data":{"id":"335557","dtime":120,"msg":{"cmd":"SYS_MSG","msg":"sumikakaka:?送给:?仅仅穿堂风啊:?1个摩天大楼，点击前往TA的房间去抽奖吧","msg_text":"sumikakaka:?送给:?仅仅穿堂风啊:?1个摩天大楼，点击前往TA的房间去抽奖吧","msg_common":"网游区广播: <%sumikakaka%>送给<%仅仅穿堂风啊%>1个摩天大楼，点击前往TA的房间去抽奖吧","msg_self":"网游区广播: <%sumikakaka%>送给<%仅仅穿堂风啊%>1个摩天大楼，快来抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/7533559","roomid":7533559,"real_roomid":7533559,"rnd":7,"broadcast_type":0},"raffleId":335557,"payflow_id":"1561207662131700001","title":"摩天大楼抽奖","type":"GIFT_20003","from":"sumikakaka","from_user":{"uname":"sumikakaka","face":"http://i0.hdslb.com/bfs/face/801ad658933ea4a6f55f465089ff31749544c794.jpg"},"time":120,"max_time":120,"time_wait":60,"asset_animation_pic":"http://i0.hdslb.com/bfs/live/7e47e9cfb744acd0319a4480e681258ce3a611fe.gif","asset_tips_pic":"http://s1.hdslb.com/bfs/live/380bcd708da496d75737c68930965dd67b82879d.png","sender_type":0},"_roomid":7533559}
 *
 * @interface RAFFLE_START
 * @extends {danmuJson}
 */
interface RAFFLE_START extends danmuJson {
  data: RAFFLE_START_Data
}
interface RAFFLE_START_Data {
  /** 抽奖编号 */
  id: string
  /** 持续时间 */
  dtime: number
  /** 系统广播 */
  msg: SYS_MSG
  /** 抽奖编号 */
  raffleId: number
  payflow_id: string
  /** 文案 */
  title: string
  /** 文案 */
  type: string
  /** 赠送人 */
  from: string
  /** 赠送人信息 */
  from_user: RAFFLE_START_Data_FromUser
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
  sender_type: number
}
interface RAFFLE_START_Data_FromUser {
  uname: string
  face: string
}
/**
 * room_admin_entrance
 * {"cmd":"room_admin_entrance","msg":"系统提示：你已被主播设为房管","uid":613749,"_roomid":3182251}
 *
 * @interface Room_Admin_Entrance
 * @extends {danmuJson}
 */
interface Room_Admin_Entrance extends danmuJson {
  msg: string
  uid: number
}
/**
 * 管理员变更
 * {"cmd":"ROOM_ADMINS","uids":[21799502,324617099,37495809,280437450,25437575,61067789,20936602,28222739,901731,242150444,198506415,241374315,186912549,225688909,267471636,343632753,356529683,366057316,343623777,355195058,43578442,32429631,305349928,16722360,18037673,227478182,11258321,281388699,19033182,26062349,12820449,67176805,8535022,10122445,23488236,13453890,25815637,253966728,15689661,102630099,93423185,1560068,59151689,7153655,313867946,285087000,39529986,89557885,385052272,382836708,319250781,247950077,287219935,349628613,613749],"_roomid":3182251}
 * 
 * @interface ROOM_ADMINS
 * @extends {danmuJson}
 */
interface ROOM_ADMINS extends danmuJson {
  /** 管理员列表 */
  uids: number[]
}
/**
 * 房间封禁消息
 * {"cmd":"ROOM_BLOCK_MSG","uid":"351676892","uname":"渣蹄子永远喜欢璃老婆","data":{"uid":"351676892","uname":"渣蹄子永远喜欢璃老婆","operator":1},"roomid":6727453,"_roomid":6727453}
 *
 * @interface ROOM_BLOCK_MSG
 * @extends {danmuJson}
 */
interface ROOM_BLOCK_MSG extends danmuJson {
  /** 用户uid */
  uid: number
  /** 用户名 */
  uname: string
  data: ROOM_BLOCK_MSG_Data
}
interface ROOM_BLOCK_MSG_Data {
  uid: string
  uname: string
  operator: number
}
/**
 * ROOM_BOX_Base
 *
 * @interface ROOM_BOX_Base
 * @extends {danmuJson}
 */
interface ROOM_BOX_Base extends danmuJson {
  data: ROOM_BOX_Base_Data
}
interface ROOM_BOX_Base_Data {
  type: number
  h5_url: string
  data: ROOM_BOX_Base_Data_Data
}
interface ROOM_BOX_Base_Data_Data {
  uid: number
  gift_name: string
  coin: string
  gift_icon: string
  start_time: string
  end_time: string
}
/**
 * ROOM_BOX_BOOS_AWARD
 * {"cmd":"ROOM_BOX_BOOS_AWARD","data":{"type":1,"h5_url":"https://live.bilibili.com/p/html/live-app-mecha/index.html?frame=awards&no=1&boss_id=2&is_live_half_webview=1&hybrid_half_ui=1,5,100p,100p,0,0,30,0,0;2,5,250,100p,0,0,30,0,0;4,5,320,100p,0,0,30,0,0;6,5,50p,50p,0,0,30,0,0;5,5,55p,70p,0,0,30,0,0;3,5,85p,70p,0,0,30,0,0;7,5,65p,60p,0,0,30,0,0;","web_url":"https://live.bilibili.com/p/html/live-app-mecha/index.html?frame=awards&no=1&boss_id=2","data":{"roomid":83264}},"_roomid":165920}
 *
 * @interface ROOM_BOX_BOOS_AWARD
 * @extends {danmuJson}
 */
interface ROOM_BOX_BOOS_AWARD extends danmuJson {
  data: ROOM_BOX_BOOS_AWARD_Data
}
interface ROOM_BOX_BOOS_AWARD_Data {
  type: number
  h5_url: string
  web_url: string
  data: ROOM_BOX_BOOS_AWARD_Data_Data
}
interface ROOM_BOX_BOOS_AWARD_Data_Data {
  roomid: number
}
/**
 * ROOM_BOX_MASTER
 * {"cmd":"ROOM_BOX_MASTER","data":{"type":3,"h5_url":"https://live.bilibili.com/p/html/live-app-luckygift/alert.html?is_live_half_webview=1&round_id=1028&hybrid_rotate_d=1&mode=master&hybrid_half_ui=1,5,260,280,bc3428,0,30,100,4;2,5,260,280,bc3428,0,30,100,4;3,5,260,280,bc3428,0,30,100,4;4,5,260,280,bc3428,0,30,100,4;5,5,260,280,bc3428,0,30,100,4;6,5,260,280,bc3428,0,30,100,4;7,5,260,280,bc3428,0,30,100,4&pc_ui=260,280,bc3428,0","data":{"pc_status":1,"uid":111977978,"gift_name":"铃铛","coin":"4.2万","gift_icon":"http://i0.hdslb.com/bfs/live/mlive/8fafc27e5ecc8a6c3cd314a86333a6a93b695f5c.png","start_time":"22:00","end_time":"00:00","user_uname":"芋圆奶茶妹儿"}},"_roomid":10633444}
 *
 * @interface ROOM_BOX_MASTER
 * @extends {ROOM_BOX_Base}
 */
interface ROOM_BOX_MASTER extends ROOM_BOX_Base {
  data: ROOM_BOX_MASTER_Data
}
interface ROOM_BOX_MASTER_Data extends ROOM_BOX_Base_Data {
  data: ROOM_BOX_MASTER_Data_Data
}
interface ROOM_BOX_MASTER_Data_Data extends ROOM_BOX_Base_Data_Data {
  pc_status: number
  user_uname: string
}
/**
 * ROOM_BOX_USER
 * {"cmd":"ROOM_BOX_USER","data":{"type":1,"h5_url":"https://live.bilibili.com/p/html/live-app-luckygift/alert.html?is_live_half_webview=1&award_id=1044407&hybrid_rotate_d=1&mode=user_general&hybrid_half_ui=1,5,260,280,bc3428,0,30,100,4;2,5,260,280,bc3428,0,30,100,4;3,5,260,280,bc3428,0,30,100,4;4,5,260,280,bc3428,0,30,100,4;5,5,260,280,bc3428,0,30,100,4;6,5,260,280,bc3428,0,30,100,4;7,5,260,280,bc3428,0,30,100,4","data":{"type":1,"uid":40780684,"gift_name":"铃铛","coin":"100","gift_icon":"http://s1.hdslb.com/bfs/live/ee04980f412a49137648eac0c9c3285cadf117ad.png","rate":1,"start_time":"","end_time":""}},"_roomid":2710582}
 *
 * @interface ROOM_BOX_USER
 * @extends {ROOM_BOX_Base}
 */
interface ROOM_BOX_USER extends ROOM_BOX_Base {
  data: ROOM_BOX_USER_Data
}
interface ROOM_BOX_USER_Data extends ROOM_BOX_Base_Data {
  data: ROOM_BOX_USER_Data_Data
}
interface ROOM_BOX_USER_Data_Data extends ROOM_BOX_Base_Data_Data {
  type: number
  rate: number
}
/**
 * ROOM_CHANGE
 * // {"cmd":"ROOM_CHANGE","data":{"title":"【北北】是MIKU呀~","area_id":145,"parent_area_id":1,"area_name":"视频聊天","parent_area_name":"娱乐"},"_roomid":502153}
 *
 * @interface ROOM_CHANGE
 * @extends {danmuJson}
 */
interface ROOM_CHANGE extends danmuJson {
  data: ROOM_CHANGE_Data
}
interface ROOM_CHANGE_Data {
  title: string
  area_id: number
  parent_area_id: number
  area_name: string
  parent_area_name: string
}
/**
 * ROOM_LIMIT
 * {"cmd":"ROOM_LIMIT","type":"copyright_area","delay_range":60,"roomid":5440,"_roomid":5440}
 *
 * @interface ROOM_LIMIT
 * @extends {danmuJson}
 */
interface ROOM_LIMIT extends danmuJson {
  type: string
  delay_range: number
}
/**
 * 直播封禁
 * {"cmd":"ROOM_LOCK","expire":"2019-06-30 03:57:04","roomid":4468726,"_roomid":4468726}
 *
 * @interface ROOM_LOCK
 * @extends {danmuJson}
 */
interface ROOM_LOCK extends danmuJson {
  expire: string // 封禁时间 yyyy-MM-dd HH:mm:ss
}
/**
 * 房间排行榜
 * {"cmd":"ROOM_RANK","data":{"roomid":179883,"rank_desc":"娱乐小时榜 20","color":"#FB7299","h5_url":"https://live.bilibili.com/p/html/live-app-rankcurrent/index.html?is_live_half_webview=1&hybrid_half_ui=1,5,85p,70p,FFE293,0,30,100,10;2,2,320,100p,FFE293,0,30,100,0;4,2,320,100p,FFE293,0,30,100,0;6,5,65p,60p,FFE293,0,30,100,10;5,5,55p,60p,FFE293,0,30,100,10;3,5,85p,70p,FFE293,0,30,100,10;7,5,65p,60p,FFE293,0,30,100,10;&anchor_uid=1753451&rank_type=master_realtime_area_hour&area_hour=1&area_v2_id=199&area_v2_parent_id=1","web_url":"https://live.bilibili.com/blackboard/room-current-rank.html?rank_type=master_realtime_area_hour&area_hour=1&area_v2_id=199&area_v2_parent_id=1","timestamp":1561207680},"_roomid":179883}
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
  web_url: string
  timestamp: number
}
/**
 * ROOM_REAL_TIME_MESSAGE_UPDATE
 * {"cmd":"ROOM_REAL_TIME_MESSAGE_UPDATE","data":{"roomid":50583,"fans":259384,"red_notice":-1},"_roomid":50583}
 *
 * @interface ROOM_REAL_TIME_MESSAGE_UPDATE
 * @extends {danmuJson}
 */
interface ROOM_REAL_TIME_MESSAGE_UPDATE extends danmuJson {
  data: ROOM_REAL_TIME_MESSAGE_UPDATE_Data
}
interface ROOM_REAL_TIME_MESSAGE_UPDATE_Data {
  roomid: number
  fans: number
  red_notice: number
}
/**
 * 房间屏蔽
 * {"cmd":"ROOM_SHIELD","type":0,"user":"","keyword":"","roomid":939654,"_roomid":939654}
 * {"cmd":"ROOM_SHIELD","type":1,"user":"","keyword":"","roomid":14073662,"_roomid":14073662}
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
 * 房间禁言结束
 * {"cmd":"ROOM_SILENT_OFF","data":[],"roomid":21120344,"_roomid":21120344}
 *
 * @interface ROOM_SILENT_OFF
 * @extends {danmuJson}
 */
interface ROOM_SILENT_OFF extends danmuJson {
  data: any[]
}
/**
 * 房间开启禁言
 * {"cmd":"ROOM_SILENT_ON","data":{"type":"level","level":1,"second":1517318804},"roomid":544893,"_roomid":544893}
 * {"cmd":"ROOM_SILENT_ON","data":{"type":"level","level":1,"second":-1},"roomid":5050,"_roomid":5050}
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
 * ROOM_SKIN_MSG
 * {"cmd":"ROOM_SKIN_MSG","skin_id":36,"status":1,"end_time":1561564800,"current_time":1561207862,"scatter":{"min":3,"max":33},"_roomid":449952}
 *
 * @interface ROOM_SKIN_MSG
 * @extends {danmuJson}
 */
interface ROOM_SKIN_MSG extends danmuJson {
  skin_id: number
  status: number
  end_time: number
  current_time: number
  scatter: ROOM_SKIN_MSG_Scatter
}
interface ROOM_SKIN_MSG_Scatter {
  min: number
  max: number
}
/**
 * SCORE_CARD
 * {"cmd":"SCORE_CARD","data":{"start_time":1561220427,"end_time":1561220487,"now_time":1561220427,"gift_id":30081,"uid":1728634,"ruid":107638877,"id":153},"_roomid":4198132}
 *
 * @interface SCORE_CARD
 * @extends {danmuJson}
 */
interface SCORE_CARD extends danmuJson {
  data: SCORE_CARD_Data
}
interface SCORE_CARD_Data {
  start_time: number
  end_time: number
  now_time: number
  gift_id: number
  uid: number
  ruid: number
  id: number
}
/**
 * 礼物消息, 用户包裹和瓜子的数据直接在里面, 真是窒息
 * {"cmd":"SEND_GIFT","data":{"giftName":"B坷垃","num":1,"uname":"Vilitarain","rcost":28963232,"uid":2081485,"top_list":[{"uid":3091444,"uname":"丶你真难听","face":"http://i1.hdslb.com/bfs/face/b1e39bae99efc6277b95993cd2a0d7c176b52ce2.jpg","rank":1,"score":1657600,"guard_level":3,"isSelf":0},{"uid":135813741,"uname":"EricOuO","face":"http://i2.hdslb.com/bfs/face/db8cf9a9506d2e3fe6dcb3d8f2eee4da6c0e3e2d.jpg","rank":2,"score":1606200,"guard_level":2,"isSelf":0},{"uid":10084110,"uname":"平凡无奇迷某人","face":"http://i2.hdslb.com/bfs/face/df316f596d7dcd8625de7028172027aa399323af.jpg","rank":3,"score":1333100,"guard_level":3,"isSelf":0}],"timestamp":1517306026,"giftId":3,"giftType":0,"action":"赠送","super":1,"price":9900,"rnd":"1517301823","newMedal":1,"newTitle":0,"medal":{"medalId":"397","medalName":"七某人","level":1},"title":"","beatId":"0","biz_source":"live","metadata":"","remain":0,"gold":100,"silver":77904,"eventScore":0,"eventNum":0,"smalltv_msg":[],"specialGift":null,"notice_msg":[],"capsule":{"normal":{"coin":68,"change":1,"progress":{"now":1100,"max":10000}},"colorful":{"coin":0,"change":0,"progress":{"now":0,"max":5000}}},"addFollow":0,"effect_block":0},"_roomid":50583}
 * {"cmd":"SEND_GIFT","data":{"giftName":"小星星","num":5,"uname":"从小就好看zz","face":"http://i0.hdslb.com/bfs/face/a3cfe2e8567e380ce20cccdf69199a99e7f88106.jpg","guard_level":0,"rcost":169962792,"uid":324559285,"top_list":[],"timestamp":1561220907,"giftId":30085,"giftType":3,"action":"赠送","super":0,"super_gift_num":0,"price":100,"rnd":"D5CA8380-193D-4536-BD2A-9766037A99FA","newMedal":0,"newTitle":0,"medal":[],"title":"","beatId":"","biz_source":"live","metadata":"","remain":0,"gold":0,"silver":0,"eventScore":0,"eventNum":0,"smalltv_msg":[],"specialGift":null,"notice_msg":[],"capsule":null,"addFollow":0,"effect_block":1,"coin_type":"silver","total_coin":500,"effect":0,"tag_image":"","user_count":0,"send_master":null},"_roomid":83264}
 *
 * @interface SEND_GIFT
 * @extends {danmuJson}
 */
interface SEND_GIFT extends danmuJson {
  data: SEND_GIFT_Data
}
interface SEND_GIFT_Data {
  /** 道具文案 */
  giftName: string
  /** 数量 */
  num: number
  /** 用户名 */
  uname: string
  /** 用户头像 */
  face: string
  /** 舰队等级 */
  guard_level: number
  /** 主播积分 */
  rcost: number
  /** 用户uid */
  uid: number
  /** 更新排行 */
  top_list: SEND_GIFT_Data_TopList[] | []
  /** 用户提供的rnd, 正常为10位 */
  timestamp: number
  /** 礼物id */
  giftId: number
  /** 礼物类型(普通, 弹幕, 活动) */
  giftType: number
  action: '喂食' | '赠送'
  /** 高能 */
  super: 0 | 1
  super_gift_num: number
  /** 价值 */
  price: number
  rnd: string
  /** 是否获取到新徽章 */
  newMedal: 0 | 1
  /** 是否获取到新头衔 */
  newTitle: 0 | 1
  /** 新徽章 */
  medal: SEND_GIFT_Data_Medal | []
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
  smalltv_msg: SYS_MSG[] | []
  /** 特殊礼物 */
  specialGift: SPECIAL_GIFT_Data | null
  /** SYS_GIFT */
  notice_msg: string[] | []
  /** 扭蛋 */
  capsule: SEND_GIFT_Data_Capsule | null
  /** 是否新关注 */
  addFollow: 0 | 1
  /** 估计只有辣条才能是1 */
  effect_block: 0 | 1,
  coin_type: 'gold' | 'silver',
  total_coin: number,
  effect: number,
  tag_image: '',
  user_count: number,
  send_master: null
}
interface SEND_GIFT_Data_TopList {
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
interface SEND_GIFT_Data_Medal {
  /** 徽章id */
  medalId: string
  /** 徽章名 */
  medalName: string
  /** 徽章等级 */
  level: 1
}
interface SEND_GIFT_Data_Capsule {
  /** 普通扭蛋 */
  normal: SEND_GIFT_Data_Capsule_Data
  /** 梦幻扭蛋 */
  colorful: SEND_GIFT_Data_Capsule_Data
}
interface SEND_GIFT_Data_Capsule_Data {
  /** 数量 */
  coin: number
  /** 数量发生变化 */
  change: number
  progress: SEND_GIFT_Data_Capsule_Data_Progress
}
interface SEND_GIFT_Data_Capsule_Data_Progress {
  /** 当前送出道具价值 */
  now: number
  /** 需要的道具价值 */
  max: number
}
/**
 * 特殊礼物消息
 * {"cmd":"SPECIAL_GIFT","data":{"39":{"id":169666,"time":90,"hadJoin":0,"num":1,"content":"啦噜啦噜","action":"start","storm_gif":"http://static.hdslb.com/live-static/live-room/images/gift-section/mobilegift/2/jiezou.gif?2017011901"}},"_roomid":5096}
 * {"cmd":"SPECIAL_GIFT","data":{"39":{"action":"end","id":1209259849440}},"_roomid":4404024}
 *
 * @interface SPECIAL_GIFT
 * @extends {danmuJson}
 */
interface SPECIAL_GIFT extends danmuJson {
  data: SPECIAL_GIFT_Data
}
interface SPECIAL_GIFT_Data {
  /** 节奏风暴 */
  '39': SPECIAL_GIFT_Data_BeatStorm
}
type SPECIAL_GIFT_Data_BeatStorm = SPECIAL_GIFT_Data_BeatStorm_Start | SPECIAL_GIFT_Data_BeatStorm_End
interface SPECIAL_GIFT_Data_BeatStorm_Start {
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
interface SPECIAL_GIFT_Data_BeatStorm_End {
  /** 节奏风暴id */
  id: number
  /** 结束 */
  action: 'end'
}
/**
 * 系统礼物消息, 广播
 * {"cmd":"SYS_GIFT","msg":"叫我大兵就对了:?  在贪玩游戏的:?直播间5254205:?内赠送:?109:?共225个","rnd":"930578893","uid":30623524,"msg_text":"叫我大兵就对了在贪玩游戏的直播间5254205内赠送红灯笼共225个","_roomid":23058}
 * {"cmd":"SYS_GIFT","msg":"略略略--_--:? 在直播间 :?21340372:? 使用了 20 倍节奏风暴，大家快去跟风领取奖励吧！","tips":"【略略略--_--】在直播间【21340372】使用了 20 倍节奏风暴，大家快去跟风领取奖励吧！","msg_text":"【略略略--_--】在直播间【21340372】使用了 20 倍节奏风暴，大家快去跟风领取奖励吧！","giftId":39,"msgTips":1,"url":"http://live.bilibili.com/21340372","roomid":21340372,"rnd":1561467181,"_roomid":9884872}
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
  tips: string
  /** 同msg */
  msg_text: string
  /** 礼物id */
  giftId: number
  msgTips: number
  /** 点击跳转的地址 */
  url: string
  /** 原始房间号 */
  real_roomid?: number
  rnd: number
}
/**
 * 系统消息, 广播
 * {"cmd":"SYS_MSG","msg":"亚军主播【赤瞳不是翅桶是赤瞳】开播啦，一起去围观！","msg_text":"亚军主播【赤瞳不是翅桶是赤瞳】开播啦，一起去围观！","url":"http://live.bilibili.com/5198","_roomid":23058}
 * {"cmd":"SYS_MSG","msg":"丨奕玉丨:?送给:?大吉叽叽叽:?一个小电视飞船，点击前往TA的房间去抽奖吧","msg_text":"丨奕玉丨:?送给:?大吉叽叽叽:?一个小电视飞船，点击前往TA的房间去抽奖吧","msg_common":"全区广播：<%丨奕玉丨%>送给<%大吉叽叽叽%>一个小电视飞船，点击前往TA的房间去抽奖吧","msg_self":"全区广播：<%丨奕玉丨%>送给<%大吉叽叽叽%>一个小电视飞船，快来抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/286","roomid":286,"real_roomid":170908,"rnd":2113258721,"broadcast_type":1,"_roomid":23058}
 * {"cmd":"SYS_MSG","msg":"sumikakaka:?送给:?仅仅穿堂风啊:?1个摩天大楼，点击前往TA的房间去抽奖吧","msg_text":"sumikakaka:?送给:?仅仅穿堂风啊:?1个摩天大楼，点击前往TA的房间去抽奖吧","msg_common":"网游区广播: <%sumikakaka%>送给<%仅仅穿堂风啊%>1个摩天大楼，点击前往TA的房间去抽奖吧","msg_self":"网游区广播: <%sumikakaka%>送给<%仅仅穿堂风啊%>1个摩天大楼，快来抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/7533559","roomid":7533559,"real_roomid":7533559,"rnd":7,"broadcast_type":0,"_roomid":4393968}
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
 * 小电视抽奖结束
 * {"cmd":"TV_END","data":{"id":"56503","uname":"-清柠_","sname":"君子应如兰","giftName":"小电视抱枕","mobileTips":"恭喜 -清柠_ 获得小电视抱枕","raffleId":"56503","type":"small_tv","from":"君子应如兰","fromFace":"http://i1.hdslb.com/bfs/face/dfde2619c96280fa5f3f309d20207c8426a3722b.jpg","fromGiftId":25,"win":{"uname":"-清柠_","face":"http://i2.hdslb.com/bfs/face/e37a453b392be0342de2bae3caa18533273ad043.jpg","giftName":"小电视抱枕","giftId":"small_tv","giftNum":1,"msg":"恭喜<%-清柠_%>获得大奖<%小电视抱枕%>, 感谢<%君子应如兰%>的赠送"}},"_roomid":40270}
 * {"cmd":"TV_END","data":{"id":"335580","uname":"查无此_喵","sname":"sumikakaka","giftName":"100000x银瓜子","mobileTips":"恭喜 查无此_喵 获得100000x银瓜子","raffleId":"335580","type":"small_tv","from":"sumikakaka","fromFace":"http://i0.hdslb.com/bfs/face/801ad658933ea4a6f55f465089ff31749544c794.jpg","fromGiftId":25,"win":{"uname":"查无此_喵","face":"http://i0.hdslb.com/bfs/face/0010f77cf72e7c54d4adbcdee73e2ef6611d83e2.jpg","giftName":"银瓜子","giftId":"silver","giftNum":100000,"giftImage":"http://s1.hdslb.com/bfs/live/00d768b444f1e1197312e57531325cde66bf0556.png","msg":"恭喜<%查无此_喵%>获得大奖<%100000x银瓜子%>, 感谢<%sumikakaka%>的赠送"}},"_roomid":7533559}
 *
 * @interface TV_END
 * @extends {danmuJson}
 */
interface TV_END extends danmuJson {
  data: TV_END_Data
}
interface TV_END_Data extends RAFFLE_END_Data {
  type: 'small_tv'
}
/**
 * 小电视抽奖开始
 * {"cmd":"TV_START","data":{"id":"56473","dtime":180,"msg":{"cmd":"SYS_MSG","msg":"GDinBoston:?送给:?宝贤酱:?一个小电视飞船，点击前往TA的房间去抽奖吧","msg_text":"GDinBoston:?送给:?宝贤酱:?一个小电视飞船，点击前往TA的房间去抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/5520","roomid":5520,"real_roomid":4069122,"rnd":1527998406,"tv_id":0},"raffleId":56473,"title":"小电视飞船抽奖","type":"small_tv","from":"GDinBoston","from_user":{"uname":"GDinBoston","face":"http://i2.hdslb.com/bfs/face/6f42b610b2b3846bf054f78c348051c21ff223f1.jpg"},"time":180,"max_time":180,"time_wait":120,"asset_animation_pic":"http://i0.hdslb.com/bfs/live/746a8db0702740ec63106581825667ae525bb11a.gif","asset_tips_pic":"http://s1.hdslb.com/bfs/live/1a3acb48c59eb10010ad53b59623e14dc1339968.png"},"_roomid":4069122}
 * {"cmd":"TV_START","data":{"id":"335580","dtime":180,"msg":{"cmd":"SYS_MSG","msg":"sumikakaka:?送给:?仅仅穿堂风啊:?1个小电视飞船，点击前往TA的房间去抽奖吧","msg_text":"sumikakaka:?送给:?仅仅穿堂风啊:?1个小电视飞船，点击前往TA的房间去抽奖吧","msg_common":"全区广播：<%sumikakaka%>送给<%仅仅穿堂风啊%>1个小电视飞船，点击前往TA的房间去抽奖吧","msg_self":"全区广播：<%sumikakaka%>送给<%仅仅穿堂风啊%>1个小电视飞船，快来抽奖吧","rep":1,"styleType":2,"url":"http://live.bilibili.com/7533559","roomid":7533559,"real_roomid":7533559,"rnd":47,"broadcast_type":0},"raffleId":335580,"payflow_id":"1561208125131700001","title":"小电视飞船抽奖","type":"small_tv","from":"sumikakaka","from_user":{"uname":"sumikakaka","face":"http://i0.hdslb.com/bfs/face/801ad658933ea4a6f55f465089ff31749544c794.jpg"},"time":180,"max_time":180,"time_wait":120,"asset_animation_pic":"http://i0.hdslb.com/bfs/live/746a8db0702740ec63106581825667ae525bb11a.gif","asset_tips_pic":"http://s1.hdslb.com/bfs/live/ac43b069bec53d303a9a1e0c4e90ccd1213d1b6b.png","sender_type":0},"_roomid":7533559}
 *
 * @interface TV_START
 * @extends {danmuJson}
 */
interface TV_START extends danmuJson {
  data: TV_START_Data
}
interface TV_START_Data extends RAFFLE_START_Data {
  type: 'small_tv'
}
/**
 * USER_GAIN_MEDAL
 * {"cmd":"USER_GAIN_MEDAL","data":{"type":1,"up_uid":4425196,"medal_id":178360,"medal_name":"千本莺","medal_level":3,"medal_color":6406234,"msg_title":"都已经上了<%黑子莺%>的船，怎么能没有TA的粉丝勋章呢？送你一个吧~","msg_content":"获得750点亲密度\n你的粉丝勋章达到3级","normal_color":7697781,"highlight_color":16478873},"_roomid":6040401}
 *
 * @interface USER_GAIN_MEDAL
 * @extends {danmuJson}
 */
interface USER_GAIN_MEDAL extends danmuJson {
  data: USER_GAIN_MEDAL_Data
}
interface USER_GAIN_MEDAL_Data {
  type: number
  up_uid: number
  medal_id: number
  medal_name: string
  medal_level: number
  medal_color: number
  msg_title: string
  msg_content: string
  normal_color: number
  highlight_color: number
}
/**
 * USER_INFO_UPDATE
 * {"cmd":"USER_INFO_UPDATE","data":{"type":1,"uid":2255740,"room_id":1440094},"_roomid":24541}
 *
 * @interface USER_INFO_UPDATE
 * @extends {danmuJson}
 */
interface USER_INFO_UPDATE extends danmuJson {
  data: USER_INFO_UPDATE_Data
}
interface USER_INFO_UPDATE_Data {
  type: number
  uid: number
  room_id: number
}
/**
 * USER_PANEL_RED_ALARM
 * {"cmd":"USER_PANEL_RED_ALARM","data":{"module":"live_prop_mail","alarm_num":1},"_roomid":5335284}
 *
 * @interface USER_PANEL_RED_ALARM
 * @extends {danmuJson}
 */
interface USER_PANEL_RED_ALARM extends danmuJson {
  data: USER_PANEL_RED_ALARM_Data
}
interface USER_PANEL_RED_ALARM_Data {
  module: string
  alarm_num: number
}
/**
 * 用户头衔
 * {"cmd":"USER_TITLE_GET","data":{"title_id":"may-pillow","source":"2016 五月病","name":"被窝","description":"赠送 25 个被窝","colorful":0,"create_time":"2018-10-31 20:17:15","expire_time":"永久","url":"/may","mobile_pic_url":"http://s1.hdslb.com/bfs/static/blive/live-assets/mobile/titles/title/3/may-pillow.png?20180726173300","web_pic_url":"http://s1.hdslb.com/bfs/static/blive/live-assets/mobile/titles/title/3/may-pillow.png?20180726173300","num":1,"score":0,"level":1},"uid":301606770,"_roomid":9950825}
 * {"cmd":"USER_TITLE_GET","data":{"title_id":"title-174-1","source":"2018 BLS年终盛典 ","name":"幻影","description":"通过普通扭蛋机有几率获得 ","colorful":0,"create_time":"2018-10-31 20:19:26","expire_time":"永久","url":"http://live.bilibili.com/blackboard/bls-2018-web.html","mobile_pic_url":"http://s1.hdslb.com/bfs/vc/a61f2913f8a86b03ef432a286fd5e9e3e22e17bd.png?20180726173300","web_pic_url":"http://s1.hdslb.com/bfs/vc/a61f2913f8a86b03ef432a286fd5e9e3e22e17bd.png?20180726173300","num":1,"score":0,"level":1},"uid":66822870,"_roomid":2776645}
 * {"cmd":"USER_TITLE_GET","data":{"title_id":"title-217-1","source":"音之守护者活动","name":"小拳拳","description":"音之守护者第一阶段守护者奖池抽奖","colorful":0,"create_time":"2019-06-23 00:31:31","expire_time":"2019-06-27 00:00:00","url":"https://live.bilibili.com/blackboard/sound-guardian-2019-web.html","mobile_pic_url":"http://s1.hdslb.com/bfs/vc/0cbe6cc577e303085b5e4cb3835796642cd51bef.png?20180726173300","web_pic_url":"http://s1.hdslb.com/bfs/vc/0cbe6cc577e303085b5e4cb3835796642cd51bef.png?20180726173300","num":1,"score":0,"status":0,"level":1},"uid":6970675,"_roomid":423227}
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
  status: number
  level: number
}
/**
 * 入场特效
 * {"cmd":"USER_TOAST_MSG","data":{"op_type":1,"uid":95518573,"username":"卢噜噜噜噜噜","guard_level":3,"is_show":0},"_roomid":515838}
 * {"cmd":"USER_TOAST_MSG","data":{"op_type":2,"uid":101961799,"username":"cxr0819","guard_level":3,"is_show":0},"_roomid":102002}
 *
 * @interface USER_TOAST_MSG
 * @extends {danmuJson}
 */
interface USER_TOAST_MSG extends danmuJson {
  data: USER_TOAST_MSG_Data
}
interface USER_TOAST_MSG_Data {
  op_type: number
  uid: number
  username: string
  guard_level: number
  is_show: number
}
/**
 * 直播警告
 * {"cmd":"WARNING","msg":"违反直播着装规范，请立即调整","roomid":883802,"_roomid":883802}
 * {"cmd":"WARNING","msg":"因版权原因，请立即更换","roomid":10727567,"_roomid":10727567}
 *
 * @interface WARNING
 */
interface WARNING {
  msg: string
}
/**
 * 欢迎消息
 * {"cmd":"WELCOME","data":{"uid":111153087,"uname":"拂晓の涟漪","isadmin":0,"vip":1},"roomid":939654,"_roomid":939654}
 *
 * @interface WELCOME
 * @extends {danmuJson}
 */
interface WELCOME extends danmuJson {
  data: WELCOME_Data
}
interface WELCOME_Data {
  /** 用户uid */
  uid: number
  /** 用户名 */
  uname: string
  /** 是否为管理员 */
  isadmin: 0 | 1
  /** 是否为老爷 */
  vip: 0 | 1
}
/**
 * 欢迎消息-舰队
 * {"cmd":"WELCOME_GUARD","data":{"uid":18753702,"username":"青山又依旧","guard_level":3},"_roomid":146088}
 *
 * @interface WELCOME_GUARD
 * @extends {danmuJson}
 */
interface WELCOME_GUARD extends danmuJson {
  data: WELCOME_GUARD_Data
}
interface WELCOME_GUARD_Data {
  /** 用户uid */
  uid: number
  /** 用户名 */
  username: string
  /** 舰队等级 */
  guard_level: number
}
/**
 * 实物抽奖结束
 * {"cmd":"WIN_ACTIVITY","number":1,"data":{"delay_time_min":0,"delay_time_max":30},"_roomid":5440}
 *
 * @interface WIN_ACTIVITY
 * @extends {danmuJson}
 */
interface WIN_ACTIVITY extends danmuJson {
  /** 第n轮抽奖 */
  number: number
  data: WIN_ACTIVITY_Data
}
interface WIN_ACTIVITY_Data {
  delay_time_min: number
  delay_time_max: number
}
/**
 * 许愿瓶
 * {"cmd":"WISH_BOTTLE","data":{"action":"update","id":6301,"wish":{"id":6301,"uid":610390,"type":1,"type_id":109,"wish_limit":99999,"wish_progress":39370,"status":1,"content":"灯笼挂着好看","ctime":"2018-01-21 13:20:12","count_map":[1,20,225]}},"_roomid":14893}
 * {"cmd":"WISH_BOTTLE","data":{"action":"update","id":66506,"wish":{"id":66506,"uid":269415357,"type":1,"type_id":30046,"wish_limit":99999,"wish_progress":3037,"status":1,"content":"毕生心愿","ctime":"2019-06-14 01:39:51","count_map":[1,10,100]}},"_roomid":7688602}
 *
 * @interface WISH_BOTTLE
 * @extends {danmuJson}
 */
interface WISH_BOTTLE extends danmuJson {
  data: WISH_BOTTLE_Data
}
interface WISH_BOTTLE_Data {
  action: 'update' | 'delete' | 'full' | 'create' | 'finish'
  /** 许愿瓶id */
  id: number
  wish: WISH_BOTTLE_Data_Wish
}
interface WISH_BOTTLE_Data_Wish {
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