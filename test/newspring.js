'use strict'
const tools = require('./bilive/lib/tools').default
const { apiLiveOrigin } = require('./bilive/index')

const jar = tools.setCookie('此处需要输入cookie, 可以从设置提取')

const mytitle = new Set()
let lastround = 0
tools.Options().then(options => {
  tools.Log('正在测试可用ip')
  tools.testIP(options.apiIPs).then(() => {
    tools.XHR({
      uri: `${apiLiveOrigin}/i/api/ajaxTitleInfo?had=1&pageSize=100`,
      jar,
      json: true
    }).then(titleInfo => {
      if (titleInfo !== undefined && titleInfo.response.statusCode === 200
        && titleInfo.body.code === 0 && titleInfo.body.data.list.length > 0) {
        titleInfo.body.data.list.forEach(title => mytitle.add(title.id))
        setInterval(() => gogogo(), 500)
      }
    })
  })
})
function gogogo() {
  tools.XHR({
    uri: `${apiLiveOrigin}/activity/v1/NewSpring/redBagPool?_=${Date.now()}`,
    jar,
    json: true
  }).then(redBagPool => {
    if (redBagPool !== undefined && redBagPool.response.statusCode === 200 && redBagPool.body.code === 0) {
      const data = redBagPool.body.data
      if (lastround !== data.round) {
        lastround = data.round
        // 之所以保留红包是为了兑换头衔有余额
        let red_bag_num = data.red_bag_num - 1000
        for (let award of data.pool_list) {
          tools.Log(award.award_name)
          if (award.stock_num === 0) {
            tools.Log('已兑换完')
            continue
          }
          const award_id = award.award_id.split('-')
          if (award_id.length === 2) {
            // 此处为兑换头衔, 无论是否余额充足都会兑换, 优先级最高
            if (award_id[0] === 'title' && !mytitle.has(+award_id[1])) exchange(award.award_id, 1)
            // 计算可兑换数量
            let exchange_num
            if (award.user_exchange_count === 0 && award.exchange_limit === 0)
              exchange_num = Math.min(award.stock_num, Math.floor(red_bag_num / award.price))
            else
              exchange_num = Math.min(award.stock_num, award.exchange_limit, award.user_exchange_count, Math.floor(red_bag_num / award.price))
            if (exchange_num > 0) {
              if (award_id[0] === 'stuff') {
                // 此处为兑换经验石
                if (award_id[1] === '1' || award_id[1] === '2' || award_id[1] === '3') {
                  // 1为经验原石, 2为经验曜石, 3为贤者之石
                  red_bag_num -= exchange_num * award.price
                  exchange(award.award_id, exchange_num)
                }
              }
              else if (award_id[0] === 'gift') {
                // 此处为兑换礼物
                if (/*award_id[1] === '3' || award_id[1] === '4' || */award_id[1] === '109') {
                  // 3为B坷垃, 4为喵娘, 109为红灯笼
                  red_bag_num -= exchange_num * award.price
                  exchange(award.award_id, exchange_num)
                }
              }
              else if (award_id[0] === 'title') {
                // 此处为兑换头衔
                if (/*award_id[1] === '89' || award_id[1] === '92' || */award_id[1] === '140') {
                  // 89为爆竹, 92为年兽, 140为秋田君
                  red_bag_num -= exchange_num * award.price
                  exchange(award.award_id, exchange_num)
                }
              }
            }
            else tools.Log('红包不足或已经兑换上限')
          }
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
