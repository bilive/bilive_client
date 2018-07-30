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
}
// 应用设置
interface config {
  [index: string]: number | number[]
  defaultUserID: number
  listenNumber: number
  eventRooms: number[]
  adminServerChan: string
}
interface userData {
  [index: string]: string | boolean | number
  nickname: string
  userName: string
  passWord: string
  biliUID: number
  accessToken: string
  cookie: string
  status: boolean
  getUserInfo: boolean
  doSign: boolean
  treasureBox: boolean
  eventRoom: boolean
  raffle: boolean
  appraffle: boolean
  silver2coin: boolean
  coin2silver: boolean
  sendGift: boolean
  sendGiftRoom: number
  autoSend: boolean
  signGroup: boolean
}
interface optionsInfo {
  [index: string]: configInfoData
  defaultUserID: configInfoData
  listenNumber: configInfoData
  apiOrigin: configInfoData
  apiKey: configInfoData
  eventRooms: configInfoData
  nickname: configInfoData
  userName: configInfoData
  passWord: configInfoData
  biliUID: configInfoData
  accessToken: configInfoData
  cookie: configInfoData
  status: configInfoData
  getUserInfo: configInfoData
  doSign: configInfoData
  treasureBox: configInfoData
  raffle: configInfoData
  appraffle: configInfoData
  eventRoom: configInfoData
  silver2coin: configInfoData
  coin2silver: configInfoData
  sendGift: configInfoData
  sendGiftRoom: configInfoData
  autoSend: configInfoData
  signGroup: configInfoData
}
interface configInfoData {
  description: string
  tip: string
  type: string
}
