'use strict'
const tools = require('./bilive/lib/tools').default
const { apiLiveOrigin } = require('./bilive/index')

const jar = tools.setCookie('此处需要输入cookie, 可以设置提取')

const mytitle = new Set()
let lastround = 0
tools.Log('正在测试可用ip')
tools.Options()
  .then(options => tools.testIP(options.apiIPs))
  .then(() => tools.XHR({
    uri: `${apiLiveOrigin}/i/api/ajaxTitleInfo?had=1&pageSize=100`,
    jar,
    json: true
  }))
  .then(titleInfo => {
    if (titleInfo !== undefined && titleInfo.response.statusCode === 200
      && titleInfo.body.code === 0 && titleInfo.body.data.list.length > 0) {
      titleInfo.body.data.list.forEach(title => mytitle.add(title.id))
      setInterval(() => gogogo(), 500)
    }
  })
function gogogo() {
  tools.XHR({
    uri: `${apiLiveOrigin}/activity/v1/NewSpring/redBagPool?_=${Date.now()}`,
    jar,
    json: true
  }).then(redBagPool => {
    if (redBagPool !== undefined && redBagPool.response.statusCode === 200 && redBagPool.body.code === 0) {
      const data = redBagPool.body.data
      if (lastround === data.round) return
      lastround = data.round
      // 之所以保留红包是为了兑换头衔有余额
      let red_bag_num = data.red_bag_num - 1000
      for (const award of data.pool_list) {
        tools.Log(award.award_name)
        if (award.stock_num === 0) tools.Log('已兑换完')
        else {
          const award_id = award.award_id
          const award_title = award_id.split('-')
          // 此处为兑换头衔, 无论是否余额充足都会兑换, 优先级最高
          if (award_title[0] === 'title' && !mytitle.has(+award_title[1])) exchange(award_id, 1)
          // 计算可兑换数量
          let exchange_num
          if (award.user_exchange_count === 0 && award.exchange_limit === 0)
            exchange_num = Math.min(award.stock_num, Math.floor(red_bag_num / award.price))
          else
            exchange_num = Math.min(award.stock_num, award.exchange_limit, award.user_exchange_count, Math.floor(red_bag_num / award.price))
          if (exchange_num > 0) {
            /**
             * award-calendar 台历
             * guard-3 表面舰长
             * stuff 1为经验原石, 2为经验曜石, 3为贤者之石
             * gift 3为B坷垃, 4为喵娘, 109为红灯笼
             * title 89为爆竹, 92为年兽, 140为秋田君
             */
            switch (award_id) {
              case 'award-calendar':
              case 'guard-3':
              case 'stuff-1':
              case 'stuff-2':
              case 'stuff-3':
              case 'gift-3':
              case 'gift-4':
              case 'gift-109':
              case 'title-140':
                red_bag_num -= exchange_num * award.price
                exchange(award_id, exchange_num)
                break
              default:
                break
            }
          }
          else tools.Log('红包不足或已经兑换上限')
        }
      }
    }
  })
}
function exchange(award_id, exchange_num) {
  tools.XHR({
    uri: `${apiLiveOrigin}/activity/v1/NewSpring/redBagExchange`,
    method: 'POST',
    body: `award_id=${award_id}&exchange_num=${exchange_num}`,
    jar,
    json: true
  }).then(redBagExchange => {
    if (redBagExchange !== undefined && redBagExchange.response.statusCode === 200
      && redBagExchange.body.code === 0)
      tools.Log(award_id, exchange_num, redBagExchange.body)
  })
}
