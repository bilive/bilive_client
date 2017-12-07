import * as request from 'request'
import * as tools from './lib/tools'
import { EventEmitter } from 'events'
import { AppClient } from './lib/app_client'
import { apiLiveOrigin, _options, cookieJar, userData } from './index'
/**
 * 挂机得经验
 * 
 * @export
 * @class Online
 * @extends {EventEmitter}
 */
export class Online extends EventEmitter {
  constructor() {
    super()
  }
  public doLoop: NodeJS.Timer
  public onlineHeart: NodeJS.Timer
  /**
   * 开始挂机
   * 
   * @memberof Online
   */
  public Start() {
    this.DoLoop()
    this.OnlineHeart()
    // 为以后可能的END做准备
    this.doLoop = setInterval(() => { this.DoLoop() }, 288e5) // 8小时
    this.onlineHeart = setInterval(() => { this.OnlineHeart() }, 3e5) // 5分钟
  }
  /**
   * 发送在线心跳包, 检查cookie是否失效
   * 
   * @memberof Online
   */
  public async OnlineHeart() {
    let roomID = _options.config.defaultRoomID
      , usersData = _options.user
    for (let uid in usersData) {
      let userData = usersData[uid]
      if (userData.status) {
        // PC
        let online: request.Options = {
          method: 'POST',
          uri: `${apiLiveOrigin}/User/userOnlineHeart`,
          jar: cookieJar[uid],
          json: true,
          headers: {
            'Referer': `https://live.bilibili.com/${roomID}`
          }
        }
          , heartPC = await tools.XHR<userOnlineHeart>(online)
        if (heartPC.response.statusCode === 200 && heartPC.body.code === 3) this.emit('cookieError', uid)
        // 客户端
        let heartbeatQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
          , heartbeat: request.Options = {
            method: 'POST',
            uri: `${apiLiveOrigin}/mobile/userOnlineHeart?${AppClient.ParamsSign(heartbeatQuery)}`,
            body: `room_id=${roomID}&scale=xxhdpi`,
            json: true
          }
          , heart = await tools.XHR<userOnlineHeart>(heartbeat, 'Android')
        if (heart.response.statusCode === 200 && heart.body.code === 3) this.emit('tokenError', uid)
      }
    }
  }
  /**
   * 八小时循环, 用于签到, 宝箱, 日常活动, 自动送礼
   * 
   * @memberof Online
   */
  public DoLoop() {
    let usersData = _options.user
      , eventRooms = _options.config.eventRooms
    for (let uid in usersData) {
      let userData = usersData[uid]
      if (!userData.status) continue
      // 每日签到
      if (userData.doSign) this._DoSign(userData).catch((reject) => { tools.Error(userData.nickname, '每日签到', reject) })
      // 每日宝箱
      if (userData.treasureBox) this._TreasureBox(userData).catch((reject) => { tools.Error(userData.nickname, '每日宝箱', reject) })
      // 日常活动
      if (userData.eventRoom && eventRooms.length > 0) this._EventRoom(userData, uid, eventRooms).catch((reject) => { tools.Error(userData.nickname, '日常活动', reject) })
      // 自动送礼
      if (userData.sendGift && userData.sendGiftRoom !== 0) this._sendGift(userData).catch((reject) => { tools.Error(userData.nickname, '自动送礼', reject) })
      // 应援团签到
      if (userData.signGroup) this._signGroup(userData).catch((reject) => { tools.Error(userData.nickname, '应援团签到', reject) })
    }
  }
  /**
   * 每日签到
   * 
   * @private
   * @param {userData} userData
   * @memberof Online
   */
  private async _DoSign(userData: userData) {
    let baseQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      // 签到
      , sign: request.Options = {
        uri: `${apiLiveOrigin}/AppUser/getSignInfo?${AppClient.ParamsSign(baseQuery)}`,
        json: true
      }
      , signInfo = await tools.XHR<signInfo>(sign, 'Android')
    if (signInfo.response.statusCode === 200 && signInfo.body.code === 0) tools.Log(userData.nickname, '每日签到', '已签到')
    // 道具包裹
    let getBag: request.Options = {
      uri: `${apiLiveOrigin}/AppBag/getSendGift?${AppClient.ParamsSign(baseQuery)}`,
      json: true
    }
      , getBagGift = await tools.XHR<getBagGift>(getBag, 'Android')
    if (getBagGift.response.statusCode === 200 && getBagGift.body.code === 0) tools.Log(userData.nickname, '每日签到', '已获取每日包裹')
  }
  /**
   * 每日宝箱
   * 
   * @private
   * @param {userData} userData
   * @memberof Online
   */
  private async _TreasureBox(userData: userData) {
    let baseQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      // 获取宝箱状态,换房间会重新冷却
      , current: request.Options = {
        uri: `${apiLiveOrigin}/mobile/freeSilverCurrentTask?${AppClient.ParamsSign(baseQuery)}`,
        json: true
      }
      , currentTask = await tools.XHR<currentTask>(current, 'Android')
    if (currentTask.response.statusCode === 200) {
      if (currentTask.body.code === 0) {
        await tools.Sleep(currentTask.body.data.minute * 6e4)
        let award: request.Options = {
          uri: `${apiLiveOrigin}/mobile/freeSilverAward?${AppClient.ParamsSign(baseQuery)}`,
          json: true
        }
        await tools.XHR<award>(award, 'Android')
        this._TreasureBox(userData)
      }
      else if (currentTask.body.code === -10017) tools.Log(userData.nickname, '每日宝箱', '已领取所有宝箱')
    }
  }
  /**
   * 日常活动
   * 
   * @private
   * @param {userData} userData 
   * @param {string} uid
   * @param {number[]} roomIDs
   * @memberof Online
   */
  private async _EventRoom(userData: userData, uid: string, roomIDs: number[]) {
    // 分享房间
    let biliUID = userData.biliUID
      , md5 = tools.Hash('md5', `${biliUID}${roomIDs[0]}bilibili`)
      , sha1 = tools.Hash('sha1', `${md5}bilibili`)
      , baseQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      , share: request.Options = {
        uri: `${apiLiveOrigin}/activity/v1/Common/shareCallback?${AppClient.ParamsSign(`roomid=${roomIDs[0]}&sharing_plat=weibo&share_sign=${sha1}&${baseQuery}`)}`,
        json: true
      }
    let shareCallback = await tools.XHR<shareCallback>(share, 'Android')
    if (shareCallback.response.statusCode === 200 && shareCallback.body.code === 0) tools.Log(userData.nickname, '日常活动', `分享房间 ${roomIDs[0]} 成功`)
    else tools.Log(userData.nickname, '日常活动', shareCallback.body.msg)
    // 做任务
    let task = ['single_watch_task', 'double_watch_task', 'share_task']
    task.forEach(value => {
      let task: request.Options = {
        method: 'POST',
        uri: `${apiLiveOrigin}/activity/v1/task/receive_award`,
        body: `task_id=${value}`,
        jar: cookieJar[uid],
        json: true,
        headers: {
          'Referer': `https://live.bilibili.com/${roomIDs[0]}`
        }
      }
      tools.XHR(task, 'WebView').catch(error => { tools.Error(userData.nickname, '日常活动', error) })
    })
  }
  /**
   * 自动送礼
   * 
   * @private
   * @param {userData} userData 
   * @memberof Online
   */
  private async _sendGift(userData: userData) {
    let roomID = userData.sendGiftRoom
      , baseQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      // 获取房间信息
      , room: request.Options = {
        uri: `${apiLiveOrigin}/AppRoom/index?${AppClient.ParamsSign(`room_id=${roomID}&${baseQuery}`)}`,
        json: true
      }
      , roomInfo = await tools.XHR<roomInfo>(room, 'Android')
    if (roomInfo.response.statusCode === 200 && roomInfo.body.code === 0) {
      // masterID
      let mid = roomInfo.body.data.mid
        // 获取包裹信息
        , bag: request.Options = {
          uri: `${apiLiveOrigin}/gift/v2/gift/m_bag_list?${AppClient.ParamsSign(baseQuery)}`,
          json: true
        }
        , bagInfo = await tools.XHR<bagInfo>(bag, 'Android')
      if (bagInfo.response.statusCode === 200 && bagInfo.body.code === 0 && bagInfo.body.data.length > 0) {
        bagInfo.body.data.forEach(async giftData => {
          // 永久礼物expireat值为0
          if (giftData.expireat > 0 && giftData.expireat < 86400) {
            // 送出礼物
            let send: request.Options = {
              method: 'POST',
              uri: `${apiLiveOrigin}/gift/v2/live/bag_send`,
              body: AppClient.ParamsSign(`bag_id=${giftData.id}&biz_code=live&biz_id=${roomID}&gift_id=${giftData.gift_id}&gift_num=${giftData.gift_num}&ruid=${mid}&uid=${giftData.uid}&rnd=${AppClient.RND}&${baseQuery}`),
              json: true
            }
              , sendBag = await tools.XHR<sendBag>(send, 'Android')
            if (sendBag.response.statusCode === 200 && sendBag.body.code === 0) {
              let sendBagData = sendBag.body.data
              tools.Log(userData.nickname, '自动送礼', `向房间 ${roomID} 赠送 ${sendBagData.gift_num} 个${sendBagData.gift_name}`)
            }
            else tools.Log(userData.nickname, '自动送礼', `向房间 ${roomID} 赠送 ${giftData.gift_num} 个${giftData.gift_name} 失败`, sendBag.body)
          }
        })
      }
      else tools.Log(userData.nickname, '自动送礼', '获取包裹信息失败', bagInfo.body)
    }
    else tools.Log(userData.nickname, '自动送礼', '获取房间信息失败', roomInfo.body)
  }
  /**
   * 应援团签到
   * 
   * @private
   * @param {userData} userData 
   * @memberof Online
   */
  private async _signGroup(userData: userData) {
    let baseQuery = `access_key=${userData.accessToken}&${AppClient.baseQuery}`
      // 获取已加入应援团列表
      , group: request.Options = {
        uri: `${apiLiveOrigin}/link_group/v1/member/joinable_groups?${AppClient.ParamsSign(baseQuery)}`,
        json: true
      }
      , linkGroup = await tools.XHR<linkGroup>(group, 'Android')
    if (linkGroup.response.statusCode === 200 && linkGroup.body.code === 0 && linkGroup.body.data.list.length > 0) {
      linkGroup.body.data.list.forEach(async groupInfo => {
        // 应援团自动签到
        let sign: request.Options = {
          uri: `${apiLiveOrigin}/link_setting/v1/link_setting/sign_in?${AppClient.ParamsSign(`group_id=${groupInfo.group_id}&owner_id=${groupInfo.owner_uid}&${baseQuery}`)}`,
          json: true
        }
          , signGroup = await tools.XHR<signGroup>(sign, 'Android')
        if (signGroup.response.statusCode === 200 && signGroup.body.data.add_num > 0) tools.Log(userData.nickname, '应援团签到', `在${groupInfo.group_name}签到获得 ${signGroup.body.data.add_num} 点亲密度`)
        else tools.Log(userData.nickname, '应援团签到', `已在${groupInfo.group_name}签到过`)
      })
    }
    else tools.Log(userData.nickname, '应援团签到', '获取应援团列表失败', linkGroup.body)
  }
}
/**
 * 签到信息
 * 
 * @export
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