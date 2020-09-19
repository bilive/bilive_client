interface modalOPtions {
  body: string | DocumentFragment
  title?: string
  close?: string
  ok?: string
  showOK?: boolean
  onOK?: (body: this['body']) => void
  onClose?: (body: this['body']) => void
}
declare function initGeetest(options: geetestOptions, callback: (captcha: geetestCaptcha) => void): void

interface geetestOptions {
  /** 验证 id，极验后台申请得到 */
  gt: string
  /** 验证流水号，服务端 SDK 向极验服务器申请得到 */
  challenge: string
  /** 极验API服务器是否宕机（即处于 failback 状态） */
  offline: boolean
  /** 宕机情况下使用，表示验证是 3.0 还是 2.0，3.0 的 sdk 该字段为 true */
  new_captcha: boolean
  /** 设置下一步验证的展现形式, 默认值 popup */
  product: 'float' | 'popup' | 'custom' | 'bind'
  /** 设置按钮的长度, 默认值 300px */
  width?: string
  /** 设置验证界面文字的语言, 默认值 zh-cn */
  lang?: 'zh-cn' | 'zh-hk' | 'zh-tw' | 'en' | 'ja' | 'ko' | 'id' | 'ru' | 'ar' | 'es' | 'pt-pt' | 'fr' | 'de'
  /** 是否使用 https 请求, 默认值 false */
  https?: boolean
  /** 设置验证过程中单个请求超时时间, 默认值 30000 */
  timeout?: number
  /** 设置验证码单位转为rem的基准值, 默认值 1 */
  remUnit?: number
  /** 设置验证码大图坐标的缩放, 默认值 null */
  zoomEle?: string
  /** 是否隐藏后续验证界面的成功提示文案, 默认值 false */
  hideSuccess?: boolean
  /** 是否隐藏后续验证界面的关闭按钮, 默认值 false */
  hideClose?: boolean
  /** 是否隐藏后续验证界面的刷新按钮, 默认值 false */
  hideRefresh?: boolean
}
interface geetestCaptcha {
  appendTo(position: string | HTMLElement): void
  bindForm(position: HTMLFormElement): void
  getValidate(): geetestValidate
  reset(): void
  verify(): void
  onReady(callback: () => void): void
  onSuccess(callback: () => void): void
  onError(callback: (error: geetestErrorCode) => void): void
  onClose(callback: () => void): void
  destroy(): void
}
interface geetestValidate {
  geetest_challenge: string
  geetest_validate: string
  geetest_seccode: string
}
interface geetestErrorCode {
  error_code: string
  msg: string
}