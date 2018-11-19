import { Options as requestOptions } from 'request'
import Plugin, { tools, AppClient } from '../../plugin'

class SendGift extends Plugin {
  constructor() {
    super()
  }
  public name = '自动送礼'
  public description = '在指定房间送出剩余时间不足24小时的礼物'
  public version = '0.0.1'
  public author = 'lzghzr'
  public async load({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }) {
    // 自动送礼
    defaultOptions.newUserData['sendGift'] = false
    defaultOptions.info['sendGift'] = {
      description: '自动送礼',
      tip: '自动送出剩余时间不足24小时的礼物',
      type: 'boolean'
    }
    whiteList.add('sendGift')
    // 自动送礼房间
    defaultOptions.newUserData['sendGiftRoom'] = 0
    defaultOptions.info['sendGiftRoom'] = {
      description: '自动送礼房间',
      tip: '要自动送出礼物的房间号',
      type: 'number'
    }
    whiteList.add('sendGiftRoom')
    this.loaded = true
  }
  public async start({ users }: { users: Map<string, User> }) {
    this._sendGift(users)
  }
  public async loop({ cstMin, cstHour, cstString, users }: { cstMin: number, cstHour: number, cstString: string, users: Map<string, User> }) {
    // 每天04:30, 12:30, 13:55, 20:30自动送礼, 因为一般活动14:00结束
    if (cstMin === 30 && cstHour % 8 === 4 || cstString === '13:55') this._sendGift(users)
  }
  /**
   * 自动送礼
   *
   * @private
   * @memberof SendGift
   */
  private _sendGift(users: Map<string, User>) {
    users.forEach(async user => {
      if (!user.userData['sendGift'] || user.userData['sendGiftRoom'] === 0) return
      const roomID = user.userData.sendGiftRoom
      // 获取房间信息
      const room: requestOptions = {
        uri: `https://api.live.bilibili.com/room/v1/Room/mobileRoomInit?id=${roomID}}`,
        json: true
      }
      const roomInit = await tools.XHR<roomInit>(room, 'Android')
      if (roomInit !== undefined && roomInit.response.statusCode === 200) {
        if (roomInit.body.code === 0) {
          // masterID
          const mid = roomInit.body.data.uid
          const room_id = roomInit.body.data.room_id
          // 获取包裹信息
          const bag: requestOptions = {
            uri: `https://api.live.bilibili.com/gift/v2/gift/m_bag_list?${AppClient.signQueryBase(user.tokenQuery)}`,
            json: true,
            headers: user.headers
          }
          const bagInfo = await tools.XHR<bagInfo>(bag, 'Android')
          if (bagInfo !== undefined && bagInfo.response.statusCode === 200) {
            if (bagInfo.body.code === 0) {
              if (bagInfo.body.data.length > 0) {
                for (const giftData of bagInfo.body.data) {
                  if (giftData.expireat > 0 && giftData.expireat < 24 * 60 * 60) {
                    // expireat单位为分钟, 永久礼物值为0
                    const send: requestOptions = {
                      method: 'POST',
                      uri: `https://api.live.bilibili.com/gift/v2/live/bag_send?${AppClient.signQueryBase(user.tokenQuery)}`,
                      body: `uid=${giftData.uid}&ruid=${mid}&gift_id=${giftData.gift_id}&gift_num=${giftData.gift_num}\
&bag_id=${giftData.id}&biz_id=${room_id}&rnd=${AppClient.RND}&biz_code=live&jumpFrom=21002`,
                      json: true,
                      headers: user.headers
                    }
                    const sendBag = await tools.XHR<sendBag>(send, 'Android')
                    if (sendBag !== undefined && sendBag.response.statusCode === 200) {
                      if (sendBag.body.code === 0) {
                        const sendBagData = sendBag.body.data
                        tools.Log(user.nickname, '自动送礼', `向房间 ${roomID} 赠送 ${sendBagData.gift_num} 个${sendBagData.gift_name}`)
                      }
                      else tools.Log(user.nickname, '自动送礼', sendBag.body)
                    }
                    else tools.Log(user.nickname, '自动送礼', '网络错误')
                    await tools.Sleep(3000)
                  }
                }
              }
            }
            else tools.Log(user.nickname, '自动送礼', '包裹信息', bagInfo.body)
          }
          else tools.Log(user.nickname, '自动送礼', '包裹信息', '网络错误')
        }
        else tools.Log(user.nickname, '自动送礼', '房间信息', roomInit.body)
      }
      else tools.Log(user.nickname, '自动送礼', '房间信息', '网络错误')
    })
  }
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

export default new SendGift()