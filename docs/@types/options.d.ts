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
  [index: string]: number | string | number[]
  defaultUserID: number
  defaultRoomID: number
  eventRooms: number[]
  adminServerChan: string
  raffleDelay: number
  rafflePause: number[]
  droprate: number
  calcGiftTime: string
}
interface userData {
  [index: string]: string | boolean | number
  nickname: string
  userName: string
  passWord: string
  biliUID: number
  cookie: string
  status: boolean
  doSign: boolean
  treasureBox: boolean
  eventRoom: boolean
  silver2coin: boolean
  raffle: boolean
  sendGift: boolean
  sendGiftRoom: number
  signGroup: boolean
}
interface optionsInfo {
  [index: string]: configInfoData
  defaultUserID: configInfoData
  defaultRoomID: configInfoData
  eventRooms: configInfoData
  adminServerChan: configInfoData
  raffleDelay: configInfoData
  rafflePause: configInfoData
  droprate: configInfoData
  calcGiftTime: configInfoData
  nickname: configInfoData
  userName: configInfoData
  passWord: configInfoData
  biliUID: configInfoData
  cookie: configInfoData
  status: configInfoData
  doSign: configInfoData
  treasureBox: configInfoData
  eventRoom: configInfoData
  silver2coin: configInfoData
  raffle: configInfoData
  sendGift: configInfoData
  sendGiftRoom: configInfoData
  signGroup: configInfoData
}
interface configInfoData {
  description: string
  tip: string
  type: string
}