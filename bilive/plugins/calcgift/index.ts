import { Options as requestOptions } from 'request'
import Plugin, { tools } from '../../plugin'

class CalcGift extends Plugin {
  constructor() {
    super()
  }
  public name = '礼物统计'
  public description = '指定时间统计礼物, 并发送到指定位置'
  public version = '0.0.1'
  public author = 'lzghzr'
  public async load({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }) {
    defaultOptions.config['calcGiftTime'] = ''
    defaultOptions.info['calcGiftTime'] = {
      description: '汇报礼物时间',
      tip: '在这个时间点会统计服务器上所有用户的礼物数量情况, 滚键盘则关闭, 格式: HH:mm',
      type: 'string'
    }
    whiteList.add('calcGiftTime')
    this.loaded = true
  }
  public async loop({ cstString, options, users }: { cstString: string, options: options, users: Map<string, User> }) {
    if (cstString === options.config.calcGiftTime) {
      // 缓存礼物名
      const giftList: giftList = new Map()
      // 缓存用户礼物数
      const userGiftList: userGiftList = new Map()
      for (const [uid, user] of users) {
        const bag: requestOptions = {
          uri: `https://api.live.bilibili.com/gift/v2/gift/m_bag_list?${AppClient.signQueryBase(user.tokenQuery)}`,
          json: true,
          headers: user.headers
        }
        const bagInfo = await tools.XHR<bagInfo>(bag, 'Android')
        if (bagInfo === undefined || bagInfo.response.statusCode !== 200 || bagInfo.body.code !== 0 || bagInfo.body.data.length === 0)
          userGiftList.set(uid, { nickname: user.nickname, gift: new Map() })
        else {
          const gift: userGiftID = new Map()
          for (const giftData of bagInfo.body.data) {
            // 添加礼物名
            if (!giftList.has(giftData.gift_id)) giftList.set(giftData.gift_id, { name: giftData.gift_name, number: { all: 0, twoDay: 0, oneDay: 0 } })
            const allGiftNum = <giftNameNum>giftList.get(giftData.gift_id)
            allGiftNum.number.all += giftData.gift_num
            // 添加礼物数
            if (!gift.has(giftData.gift_id)) gift.set(giftData.gift_id, { all: 0, twoDay: 0, oneDay: 0 })
            const giftNum = <giftHas>gift.get(giftData.gift_id)
            giftNum.all += giftData.gift_num
            // 临期礼物
            if (giftData.expireat > 0 && giftData.expireat < 2 * 24 * 60 * 60) {
              allGiftNum.number.twoDay += giftData.gift_num
              giftNum.twoDay += giftData.gift_num
            }
            if (giftData.expireat > 0 && giftData.expireat < 24 * 60 * 60) {
              allGiftNum.number.oneDay += giftData.gift_num
              giftNum.oneDay += giftData.gift_num
            }
          }
          userGiftList.set(uid, { nickname: user.nickname, gift })
        }
      }
      // 构造表格
      let table = '用户\\礼物'
      let row = ':-:'
      let allGift = '总计'
      // 第一行为礼物名
      giftList.forEach(gift => {
        table += `|${gift.name}/48H/24H`
        row += '|:-:'
        allGift += `|${gift.number.all}/${gift.number.twoDay}/${gift.number.oneDay}`
      })
      table += '\n' + row + '\n' + allGift
      // 插入用户礼物信息
      userGiftList.forEach(userGift => {
        const nickname = userGift.nickname
        const gift = userGift.gift
        table += `\n|${nickname}`
        giftList.forEach((_name, id) => {
          const giftNum = gift.has(id) ? <giftHas>gift.get(id) : { all: 0, twoDay: 0, oneDay: 0 }
          table += `|${giftNum.all}/${giftNum.twoDay}/${giftNum.oneDay}`
        })
      })
      tools.sendSCMSG(table)
    }
  }
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
// 统计相关
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

export default new CalcGift()