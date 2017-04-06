/**
 * 设置
 * 
 * @class Options
 */
class Options {
  private _D = document
  private _inputDefaultUserID = <HTMLInputElement>this._D.querySelector('#defaultUserID')
  private _inputDefaultRoomID = <HTMLInputElement>this._D.querySelector('#defaultRoomID')
  private _inputApiOrigin = <HTMLInputElement>this._D.querySelector('#apiOrigin')
  private _inputApiKey = <HTMLInputElement>this._D.querySelector('#apiKey')
  private _inputEventRooms = <HTMLInputElement>this._D.querySelector('#eventRooms')
  private _inputBeatStormBlackList = <HTMLInputElement>this._D.querySelector('#beatStormBlackList')
  private _selectUser = <HTMLSelectElement>document.querySelector('#select')
  private _optionUserData: NodeListOf<HTMLOptionElement>
  private _optionUseData: HTMLOptionElement
  private _inputSave = <HTMLInputElement>this._D.querySelector('#save')
  private _inputAdd = <HTMLInputElement>this._D.querySelector('#add')
  private _inputDelete = <HTMLInputElement>this._D.querySelector('#delete')
  private _inputNickname = <HTMLInputElement>this._D.querySelector('#nickname')
  private _inputUserName = <HTMLInputElement>this._D.querySelector('#userName')
  private _inputPassWord = <HTMLInputElement>this._D.querySelector('#passWord')
  private _inputAccessToken = <HTMLInputElement>this._D.querySelector('#accessToken')
  private _inputCookie = <HTMLInputElement>this._D.querySelector('#cookie')
  private _inputStatus = <HTMLInputElement>this._D.querySelector('#status')
  private _inputDoSign = <HTMLInputElement>this._D.querySelector('#doSign')
  private _inputTreasureBox = <HTMLInputElement>this._D.querySelector('#treasureBox')
  private _inputEventRoom = <HTMLInputElement>this._D.querySelector('#eventRoom')
  private _inputSmallTV = <HTMLInputElement>this._D.querySelector('#smallTV')
  private _inputLottery = <HTMLInputElement>this._D.querySelector('#lottery')
  private _inputBeatStorm = <HTMLInputElement>this._D.querySelector('#beatStorm')
  private _ws: WebSocket
  private _options: config
  private _UID: string
  /**
   * 载入页面
   * 
   * @memberOf Options
   */
  public Start() {
    // WebSocket与客户端通讯
    this._ws = new WebSocket('ws://127.0.0.1:10080')
    this._ws.addEventListener('open', () => {
      this._D.body.classList.remove('hide')
    })
    this._ws.addEventListener('close', (message) => {
      try {
        let msg: message = JSON.parse(message.reason)
        this._D.body.innerText = <string>msg.msg
      } catch (error) {
        this._D.body.innerText = 'connection error'
      }
    })
    this._ws.addEventListener('error', () => {
      this._D.body.innerText = 'connection error'
    })
    this._ws.addEventListener('message', this._WSMessage.bind(this))
    // 添加各种点击事件
    this._inputSave.addEventListener('click', this._SaveOptions.bind(this))
    this._inputAdd.addEventListener('click', this._AddUser.bind(this))
    this._inputDelete.addEventListener('click', this._DeleteUser.bind(this))
    this._selectUser.addEventListener('change', this._SetUser.bind(this))
    // 用户数据
    this._inputNickname.addEventListener('input', () => {
      let nickName = this._inputNickname.value
      this._optionUseData.innerText = nickName
      this._options.usersData[this._UID].nickname = nickName
    })
    this._inputUserName.addEventListener('input', () => {
      let userName = this._inputUserName.value
      this._options.usersData[this._UID].userName = userName
    })
    this._inputPassWord.addEventListener('input', () => {
      let passWord = this._inputPassWord.value
      this._options.usersData[this._UID].passWord = passWord
    })
    this._inputStatus.addEventListener('change', () => {
      this._options.usersData[this._UID].status = this._inputStatus.checked
    })
    this._inputDoSign.addEventListener('change', () => {
      this._options.usersData[this._UID].doSign = this._inputDoSign.checked
    })
    this._inputTreasureBox.addEventListener('change', () => {
      this._options.usersData[this._UID].treasureBox = this._inputTreasureBox.checked
    })
    this._inputEventRoom.addEventListener('change', () => {
      this._options.usersData[this._UID].eventRoom = this._inputEventRoom.checked
    })
    this._inputSmallTV.addEventListener('change', () => {
      this._options.usersData[this._UID].smallTV = this._inputSmallTV.checked
    })
    this._inputLottery.addEventListener('change', () => {
      this._options.usersData[this._UID].lottery = this._inputLottery.checked
    })
    this._inputBeatStorm.addEventListener('change', () => {
      this._options.usersData[this._UID].beatStorm = this._inputBeatStorm.checked
    })
  }
  /**
   * 接收消息, 目前只有options
   * 
   * @private
   * @param {MessageEvent} message
   * @memberOf Options
   */
  private _WSMessage(message: MessageEvent) {
    let msg: message = JSON.parse(message.data)
    if (msg.cmd === 'options') {
      this._options = msg.data
      this._SetOption()
      this._AddOptionElement()
      this._SetUser()
    }
  }
  /**
   * 添加全局设置
   * 
   * @private
   * @memberOf Options
   */
  private _SetOption() {
    this._inputDefaultUserID.value = this._options.defaultUserID == null ? 'null' : this._options.defaultUserID.toString()
    this._inputDefaultRoomID.value = this._options.defaultRoomID.toString()
    this._inputApiOrigin.value = this._options.apiOrigin
    this._inputApiKey.value = this._options.apiKey
    let eventRooms = this._options.eventRooms
    this._inputEventRooms.value = eventRooms.join()
    let beatStormBlackList = this._options.beatStormBlackList
    this._inputBeatStormBlackList.value = beatStormBlackList.join()
  }
  /**
   * 添加选择菜单
   * 
   * @private
   * @memberOf Options
   */
  private _AddOptionElement() {
    let usersData = this._options.usersData
    let selectUsersData = ''
    for (let uid in usersData) selectUsersData += `<option value="${uid}" class="userData">${usersData[uid].nickname}</option>`
    this._selectUser.innerHTML = selectUsersData
  }
  /**
   * 添加用户设置
   * 
   * @private
   * @memberOf Options
   */
  private _SetUser() {
    let usersData = this._options.usersData
    this._optionUserData = <NodeListOf<HTMLOptionElement>>this._D.querySelectorAll('.userData')
    for (let optionUserData of this._optionUserData) {
      if (optionUserData.selected) {
        this._optionUseData = optionUserData
        this._UID = optionUserData.value
        this._inputNickname.value = usersData[this._UID].nickname
        this._inputUserName.value = usersData[this._UID].userName
        this._inputPassWord.value = usersData[this._UID].passWord
        this._inputAccessToken.value = usersData[this._UID].accessToken
        this._inputCookie.value = usersData[this._UID].cookie
        this._inputStatus.checked = usersData[this._UID].status
        this._inputDoSign.checked = usersData[this._UID].doSign
        this._inputTreasureBox.checked = usersData[this._UID].treasureBox
        this._inputEventRoom.checked = usersData[this._UID].eventRoom
        this._inputSmallTV.checked = usersData[this._UID].smallTV
        this._inputLottery.checked = usersData[this._UID].lottery
        this._inputBeatStorm.checked = usersData[this._UID].beatStorm
      }
    }
  }
  /**
   * 添加用户
   * 
   * @private
   * @memberOf Options
   */
  private _AddUser() {
    let usersData = this._options.usersData
    let newUID = 0
    for (let uid in usersData) {
      if (newUID <= parseInt(uid)) newUID = parseInt(uid) + 1
    }
    let UID = newUID.toString()
    let userData: userData = {
      nickname: '新用户',
      userName: 'bishi',
      passWord: 'password',
      accessToken: '',
      cookie: '',
      status: false,
      doSign: false,
      treasureBox: false,
      eventRoom: false,
      smallTV: false,
      lottery: false,
      beatStorm: false,
    }
    this._options.usersData[UID] = userData
    this._AddOptionElement()
    this._SetUser()
  }
  /**
   * 删除用户
   * 
   * @private
   * @memberOf Options
   */
  private _DeleteUser() {
    for (let optionUserData of this._optionUserData) {
      if (optionUserData.selected) delete this._options.usersData[optionUserData.value]
    }
    if (this._IsEmptyObject(this._options.usersData)) this._AddUser()
    this._AddOptionElement()
    this._SetUser()
  }
  /**
   * 保存设置
   * 
   * @private
   * @memberOf Options
   */
  private _SaveOptions() {
    let defaultUserID = this._inputDefaultUserID.value === 'null' ? null : parseInt(this._inputDefaultUserID.value)
    let defaultRoomID = parseInt(this._inputDefaultRoomID.value)

    let apiOrigin = this._inputApiOrigin.value
    let apiKey = this._inputApiKey.value

    let eventRoom = this._inputEventRooms.value
    let eventRooms: number[] = []
    eventRoom.split(',').forEach((value) => { eventRooms.push(parseInt(value)) })
    let blackList = this._inputBeatStormBlackList.value
    let beatStormBlackList: number[] = []
    blackList.split(',').forEach((value) => { beatStormBlackList.push(parseInt(value)) })

    this._options.defaultUserID = defaultUserID
    this._options.defaultRoomID = defaultRoomID
    this._options.apiOrigin = apiOrigin
    this._options.apiKey = apiKey
    this._options.eventRooms = eventRooms
    this._options.beatStormBlackList = beatStormBlackList

    this._ws.send(JSON.stringify({ cmd: 'save', data: this._options }))
  }
  /**
   * 判断对象是否为{}
   * 
   * @private
   * @param {Object} object
   * @returns {boolean}
   * @memberOf Options
   */
  private _IsEmptyObject(object: Object): boolean {
    for (let t in object) return false
    return true
  }
}
const app = new Options()
app.Start()
interface message {
  cmd: string
  msg?: string
  data?: any
}

interface config {
  defaultUserID: number | null
  defaultRoomID: number
  apiOrigin: string
  apiKey: string
  eventRooms: number[]
  beatStormBlackList: number[]
  beatStormLiveTop: number
  usersData: usersData
}
interface usersData {
  [index: string]: userData
}
interface userData {
  nickname: string
  userName: string
  passWord: string
  accessToken: string
  cookie: string
  status: boolean
  doSign: boolean
  treasureBox: boolean
  eventRoom: boolean
  smallTV: boolean
  lottery: boolean
  beatStorm: boolean
}