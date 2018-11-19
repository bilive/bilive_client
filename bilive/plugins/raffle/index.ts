import Lottery from './raffle'
import Plugin, { tools } from '../../plugin'

class Raffle extends Plugin {
  constructor() {
    super()
  }
  public name = '抽奖插件'
  public description = '自动参与抽奖'
  public version = '0.0.1'
  public author = 'lzghzr'
  // 是否开启抽奖
  private _raffle = false
  public async load({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }) {
    // 抽奖延时
    defaultOptions.config['raffleDelay'] = 0
    defaultOptions.info['raffleDelay'] = {
      description: '抽奖延时',
      tip: '活动抽奖, 小电视抽奖的延时, ms',
      type: 'number'
    }
    whiteList.add('raffleDelay')
    // 抽奖暂停
    defaultOptions.config['rafflePause'] = [3, 9]
    defaultOptions.info['rafflePause'] = {
      description: '抽奖暂停',
      tip: '在此时间段内不参与抽奖, 24时制, 以\",\"分隔, 只有一个时间时不启用',
      type: 'numberArray'
    }
    whiteList.add('rafflePause')
    // 抽奖概率
    defaultOptions.config['droprate'] = 0
    defaultOptions.info['droprate'] = {
      description: '丢弃概率',
      tip: '就是每个用户多少概率漏掉1个奖啦，范围0~100',
      type: 'number'
    }
    whiteList.add('droprate')
    // 小电视抽奖
    defaultOptions.newUserData['smallTV'] = false
    defaultOptions.info['smallTV'] = {
      description: '小电视抽奖',
      tip: '自动参与小电视抽奖',
      type: 'boolean'
    }
    whiteList.add('smallTV')
    // raffle类抽奖
    defaultOptions.newUserData['raffle'] = false
    defaultOptions.info['raffle'] = {
      description: 'raffle类抽奖',
      tip: '自动参与raffle类抽奖',
      type: 'boolean'
    }
    whiteList.add('raffle')
    // lottery类抽奖
    defaultOptions.newUserData['lottery'] = false
    defaultOptions.info['lottery'] = {
      description: 'lottery类抽奖',
      tip: '自动参与lottery类抽奖',
      type: 'boolean'
    }
    whiteList.add('lottery')
    // 节奏风暴
    defaultOptions.newUserData['beatStorm'] = false
    defaultOptions.info['beatStorm'] = {
      description: '节奏风暴',
      tip: '自动参与节奏风暴',
      type: 'boolean'
    }
    whiteList.add('beatStorm')
    this.loaded = true
  }
  public async loop({ cstHour, options }: { cstHour: number, options: options }) {
    // 抽奖暂停
    const rafflePause = <number[]>options.config['rafflePause']
    if (rafflePause.length > 1) {
      const start = rafflePause[0]
      const end = rafflePause[1]
      if (start > end && (cstHour >= start || cstHour < end) || (cstHour >= start && cstHour < end)) this._raffle = false
      else this._raffle = true
    }
    else this._raffle = true
  }
  public async msg({ message, options, users }: { message: raffleMessage | lotteryMessage | beatStormMessage, options: options, users: Map<string, User> }) {
    if (this._raffle) {
      users.forEach(async user => {
        if (user.captchaJPEG === '' && user.userData[message.cmd]) {
          const droprate = <number>options.config['droprate']
          if (droprate !== 0 && Math.random() < droprate / 100)
            tools.Log(user.nickname, '丢弃抽奖', message.id)
          else {
            const raffleDelay = <number>options.config['raffleDelay']
            if (raffleDelay !== 0) await tools.Sleep(raffleDelay)
            switch (message.cmd) {
              case 'smallTV':
                new Lottery(message, user).SmallTV()
                break
              case 'raffle':
                new Lottery(message, user).Raffle()
                break
              case 'lottery':
                new Lottery(message, user).Lottery()
                break
              case 'beatStorm':
                new Lottery(message, user).BeatStorm()
                break
            }
          }
        }
      })
    }
  }
}

export default new Raffle()