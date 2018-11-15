class Test implements IPlugin {
  public name = '测试插件'
  public description = '这是用来测试的'
  public version = '0.0.1'
  public author = 'lzghzr'
  public async start({ defaultOptions, whiteList }: { defaultOptions: options, whiteList: Set<string> }) {
    !{ defaultOptions, whiteList }
  }
  public async loop({ cst, cstMin, cstHour, cstString, options, users }: { cst: Date, cstMin: number, cstHour: number, cstString: string, options: options, users: Map<string, User> }) {
    !{ cst, cstMin, cstHour, cstString, options, users }
  }
  public async msg({ message, options, users }: { message: raffleMessage | lotteryMessage | beatStormMessage, options: options, users: Map<string, User> }) {
    !{ message, options, users }
  }
}

export default new Test()