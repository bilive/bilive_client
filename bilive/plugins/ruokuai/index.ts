import { Options as requestOptions } from 'request'
import Plugin, { tools } from '../../plugin'

class Ruokuai extends Plugin {
  constructor() {
    super()
  }
  public name = '若快验证码'
  public description = '使用若快识别登录验证码'
  public version = '0.0.1'
  public author = 'lzghzr'
  /**
   * 获取设置
   *
   * @private
   * @type {options}
   * @memberof ServerChan
   */
  private _!: options
  public async load({ defaultOptions, whiteList }: {
    defaultOptions: options,
    whiteList: Set<string>
  }): Promise<void> {
    defaultOptions.config['ruokuai'] = []
    defaultOptions.info['ruokuai'] = {
      description: '若快',
      tip: '若快账号密码, 格式: username,password',
      type: 'stringArray'
    }
    whiteList.add('ruokuai')
    this.loaded = true
  }
  public async options({ options }: { options: options }): Promise<void> {
    this._ = options
    tools.Captcha = captchaJPEG => this._captcha(captchaJPEG)
  }
  private async _captcha(captchaJPEG: string) {
    const [username, password] = <string[]>this._.config['ruokuai']
    if (username === undefined || password === undefined) return ''
    const image = captchaJPEG.split(',')[1]
    const send: requestOptions = {
      method: 'POST',
      uri: 'https://api.ruokuai.com/create.json',
      body: JSON.stringify({
        username,
        password,
        typeid: '3050',
        softid: '103978',
        softkey: '9171ed71213044738bf0545f896b4fd8',
        image
      }),
      json: true,
      headers: { 'Content-Type': 'application/json' }
    }
    const ruokuaiResponse = await tools.XHR<ruokuaiResponse>(send)
    if (ruokuaiResponse !== undefined && ruokuaiResponse.response.statusCode === 200) {
      const body = ruokuaiResponse.body
      if (body.Error === undefined) return body.Result
      else {
        tools.Log('若快验证码', body.Error)
        return ''
      }
    }
    else {
      tools.Log('若快验证码', '网络错误')
      return ''
    }
  }
}

/**
 * 若快返回
 *
 * @interface ruokuaiResult
 */
interface ruokuaiResult {
  Result: string
  Id: string
}
interface ruokuaiError {
  Error: string
  Error_Code: number
  Request: string
}
type ruokuaiResponse = ruokuaiResult & ruokuaiError

export default new Ruokuai()