'use strict'
const tools = require('./bilive/lib/tools').default
const { apiLiveOrigin } = require('./bilive/index')

const jar = tools.setCookie('此处需要输入cookie, 可以设置提取')

// 需要兑换的礼物
const awardID = 'gift-109'
// 每次兑换数量, 因为是无限次兑换, 所以无法保证最终兑换数量
const exchangeNum = 20

tools.Log('正在测试可用ip')
tools.Options()
  .then(options => tools.testIP(options.apiIPs))
  .then(num => {
    num = num === 0 ? 1 : num
    setInterval(() => exchange(awardID, exchangeNum), 500 / num)
  })
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
