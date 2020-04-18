interface Window {
  Options: Options
}
// WebSocket消息
interface message {
  cmd: string
  msg?: string
  ts?: string
  uid?: string
  data?: config | optionsInfo | string[] | userData
}
interface logMSG extends message {
  data: string[]
}
interface configMSG extends message {
  data: config
}
interface infoMSG extends message {
  data: optionsInfo
}
interface userMSG extends message {
  data: string[]
}
interface userDataMSG extends message {
  uid: string
  data: userData
  captcha?: string
  validate?: string
  authcode?: string
}
// 应用设置
interface config {
  [index: string]: number | number[] | string | string[]
}
interface userData {
  [index: string]: string | boolean | number
}
interface optionsInfo {
  [index: string]: configInfoData
}
interface configInfoData {
  description: string
  tip: string
  type: string
}