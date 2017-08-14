/**
 * 设置
 * 
 * @class Options
 */
class Options {
  private _D = document
  private _elmDivOptions = <HTMLDivElement>this._D.querySelector('.options')
  private _elmDivUsersData = <HTMLDivElement>this._D.querySelector('.usersdata')
  private _elmInputSave = <HTMLInputElement>this._D.querySelector('#save')
  private _elmInputAdd = <HTMLInputElement>this._D.querySelector('#add')
  private _ws: WebSocket
  private _options: config
  private _UID: string
  /**
   * 载入页面
   * 
   * @memberof Options
   */
  public Start() {
    // WebSocket与客户端通讯
    this._ws = new WebSocket('ws://127.0.0.1:10080')
    this._ws.addEventListener('open', () => {
      this._D.body.classList.remove('hide')
    })
    this._ws.addEventListener('close', message => {
      try {
        let msg: message = JSON.parse(message.reason)
        this._D.body.innerText = <string>msg.msg
      } catch (error) {
        this._D.body.innerText = 'connection closed'
      }
    })
    this._ws.addEventListener('error', () => {
      this._D.body.innerText = 'connection error'
    })
    this._ws.addEventListener('message', this._WSMessage.bind(this))
  }
  /**
   * 接收消息, 目前只有options
   * 
   * @private
   * @param {MessageEvent} message
   * @memberof Options
   */
  private _WSMessage(message: MessageEvent) {
    let msg: message = JSON.parse(message.data)
    if (msg.cmd === 'options') {
      this._options = msg.data
      this._SetOption()
      this._SetSelect()
      this._SetUser()
    }
  }
  /**
   * 添加全局设置
   * 
   * @private
   * @memberof Options
   */
  private _SetOption() {
    let df = this._D.createDocumentFragment()
    for (let key in this._options) {
      let info = <configInfoData | undefined>this._options.info[key]
        , option = this._options[key]
      if (info != null) {
        let elmDiv = this._D.createElement('div')
          , elmInput = this._D.createElement('input')
        switch (info.type) {
          case 'numberNull':
            elmInput.type = 'text'
            elmInput.value = (option === null) ? 'null' : option.toString()
            elmInput.addEventListener('input', () => {
              this._options[key] = (elmInput.value === 'null') ? null : parseInt(elmInput.value)
            })
            break
          case 'number':
            elmInput.type = 'text'
            elmInput.value = option.toString()
            elmInput.addEventListener('input', () => {
              this._options[key] = parseInt(elmInput.value)
            })
            break
          case 'numberArray':
            elmInput.type = 'text'
            elmInput.value = option.join(',')
            elmInput.addEventListener('input', () => {
              this._options[key] = elmInput.value.split(',').map(value => { return parseInt(value) })
            })
            break
          case 'string':
            elmInput.type = 'text'
            elmInput.value = option
            elmInput.addEventListener('input', () => {
              this._options[key] = elmInput.value
            })
            break
          default:
            break
        }
        elmDiv.className = 'relative'
        elmDiv.innerHTML = `
<span class="description">${info.description}</span>
<span class="tip">${info.tip}</span>`
        elmDiv.appendChild(elmInput)
        df.appendChild(elmDiv)
      }
    }
    this._elmDivOptions.appendChild(df)
  }
  /**
   * 添加按钮选项
   * 
   * @private
   * @memberof Options
   */
  private _SetSelect() {
    this._elmInputAdd.addEventListener('click', this._AddNewUser.bind(this))
    this._elmInputSave.addEventListener('click', this._SaveOptions.bind(this))
  }
  /**
   * 添加用户设置
   * 
   * @private
   * @memberof Options
   */
  private _SetUser() {
    let df = this._D.createDocumentFragment()
    for (let uid in this._options.usersData) {
      let elmDivUser = this._AddUser(uid)
      df.appendChild(elmDivUser)
    }
    this._elmDivUsersData.appendChild(df)
  }
  /**
   * 添加用户
   * 
   * @private
   * @param {string} uid 
   * @returns {HTMLDivElement} 
   * @memberof Options
   */
  private _AddUser(uid: string): HTMLDivElement {
    let userData = this._options.usersData[uid]
      , elmDivUser = this._D.createElement('div')
      , elmInputUser = this._D.createElement('input')
    elmInputUser.type = 'button'
    elmInputUser.className = 'delete'
    elmInputUser.value = '删除'
    elmInputUser.addEventListener('click', () => {
      delete this._options.usersData[uid]
      elmDivUser.remove()
      if (this._IsEmptyObject(this._options.usersData)) this._AddNewUser()
    })
    elmDivUser.id = uid
    elmDivUser.className = 'userdata'
    elmDivUser.appendChild(elmInputUser)
    for (let key in userData) {
      let info = <configInfoData | undefined>this._options.info[key]
        , option = userData[key]
      if (info != null) {
        let elmDiv = this._D.createElement('div')
          , elmInput = this._D.createElement('input')
        switch (info.type) {
          case 'string':
            elmInput.type = 'text'
            elmInput.value = option
            elmInput.addEventListener('input', () => {
              this._options.usersData[uid][key] = elmInput.value
            })
            break
          case 'boolean':
            elmInput.type = 'checkbox'
            elmInput.checked = option
            elmInput.addEventListener('change', () => {
              this._options.usersData[uid][key] = elmInput.checked
            })
            break
          default:
            break
        }
        elmDiv.className = 'relative'
        elmDiv.innerHTML = `
<span class="description">${info.description}</span>
<span class="tip">${info.tip}</span>`
        elmDiv.appendChild(elmInput)
        elmDivUser.appendChild(elmDiv)
      }
    }
    return elmDivUser
  }
  /**
   * 添加新用户
   * 
   * @private
   * @memberof Options
   */
  private _AddNewUser() {
    let newUID = Date.now().toString(16)
      , userData: userData = {
        "nickname": "新用户",
        "userName": "bishi",
        "passWord": "password",
        "accessToken": "",
        "cookie": "",
        "status": false,
        "doSign": false,
        "treasureBox": false,
        "eventRoom": false,
        "smallTV": false,
        "raffle": false,
        "beatStorm": false,
        "debug": false
      }
    this._options.usersData[newUID] = userData
    let elmDivUser = this._AddUser(newUID)
    this._elmDivUsersData.appendChild(elmDivUser)
  }
  /**
   * 保存设置
   * 
   * @private
   * @memberof Options
   */
  private _SaveOptions() {
    this._ws.send(JSON.stringify({ cmd: 'save', data: this._options }))
  }
  /**
   * 判断对象是否为{}
   * 
   * @private
   * @param {Object} object
   * @returns {boolean}
   * @memberof Options
   */
  private _IsEmptyObject(object: Object): boolean {
    for (let t in object) return false
    return true
  }
}
const app = new Options()
app.Start()
/**
 * WebSocket消息
 * 
 * @interface message
 */
interface message {
  cmd: string
  msg?: string
  data?: any
}
/**
 * 应用设置
 * 
 * @export
 * @interface config
 */
interface config {
  defaultUserID: number | null
  defaultRoomID: number
  apiOrigin: string
  apiKey: string
  eventRooms: number[]
  beatStormBlackList: number[]
  usersData: usersData
  info: configInfo
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
  raffle: boolean
  beatStorm: boolean
  debug: boolean
}
interface configInfo {
  defaultUserID: configInfoData
  defaultRoomID: configInfoData
  apiOrigin: configInfoData
  apiKey: configInfoData
  eventRooms: configInfoData
  beatStormBlackList: configInfoData
  beatStormLiveTop: configInfoData
  nickname: configInfoData
  userName: configInfoData
  passWord: configInfoData
  accessToken: configInfoData
  cookie: configInfoData
  status: configInfoData
  doSign: configInfoData
  treasureBox: configInfoData
  eventRoom: configInfoData
  smallTV: configInfoData
  raffle: configInfoData
  beatStorm: configInfoData
  debug: configInfoData
}
interface configInfoData {
  description: string
  tip: string
  type: string
}