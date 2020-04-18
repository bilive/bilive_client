const options = new Options()
let optionsInfo: optionsInfo
const dDiv = <HTMLDivElement>document.querySelector('#ddd')
const loginDiv = <HTMLDivElement>document.querySelector('#login')
const optionDiv = <HTMLDivElement>document.querySelector('#option')
const configDiv = <HTMLDivElement>document.querySelector('#config')
const userDiv = <HTMLDivElement>document.querySelector('#user')
const logDiv = <HTMLDivElement>document.querySelector('#log')
const returnButton = <HTMLElement>document.querySelector('#logreturn')
const modalDiv = <HTMLDivElement>document.querySelector('.modal')
const template = <HTMLDivElement>document.querySelector('#template')
// 3D效果
let firstDiv: HTMLDivElement = loginDiv
let secondDiv: HTMLDivElement
const dddArray = ['top', 'bottom', 'left', 'right']
let dddString: string
function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function danimation(toDiv: HTMLDivElement) {
  dddString = dddArray[getRandomIntInclusive(0, 3)]
  if (firstDiv === logDiv) returnButton.classList.add('d-none')
  secondDiv = toDiv
  secondDiv.classList.add(`d_${dddString}2`)
  secondDiv.classList.remove('d-none')
  firstDiv.classList.add(`d_${dddString}1`)
  dDiv.className = `ddd_${dddString}`
}
dDiv.addEventListener('animationend', () => {
  dDiv.className = ''
  firstDiv.classList.remove(`d_${dddString}1`)
  firstDiv.classList.add('d-none')
  secondDiv.classList.remove(`d_${dddString}2`)
  firstDiv = secondDiv
  if (firstDiv === logDiv) returnButton.classList.remove('d-none')
})
/**
 * 显示登录界面
 * 
 */
function showLogin() {
  const pathInput = <HTMLInputElement>loginDiv.querySelector('#path input')
  const protocolInput = <HTMLInputElement>loginDiv.querySelector('#protocol input[type="text"]')
  const connectButton = <HTMLElement>loginDiv.querySelector('#connect button')
  const connectSpan = <HTMLSpanElement>loginDiv.querySelector('#connect span')
  if (location.hash !== '') {
    const loginInfo = location.hash.match(/path=(.*)&protocol=(.*)/)
    if (loginInfo !== null) {
      pathInput.value = loginInfo[1]
      protocolInput.value = loginInfo[2]
    }
  }
  connectButton.onclick = async () => {
    const protocols = [protocolInput.value]
    const connected = await options.connect(pathInput.value, protocols)
    if (connected) login()
    else connectSpan.innerText = '连接失败'
  }
  loginDiv.classList.remove('d-none')
}
/**
 * 登录成功
 * 
 */
async function login() {
  const infoMSG = await options.getInfo()
  optionsInfo = infoMSG.data
  // 处理错误信息
  options.onerror = (event) => {
    modal({ body: event.data })
  }
  options.onwserror = () => wsClose('连接发生错误')
  options.onwsclose = (event) => {
    try {
      const msg: message = JSON.parse(event.reason)
      wsClose('连接已关闭 ' + msg.msg)
    } catch (error) {
      wsClose('连接已关闭')
    }
  }
  danimation(optionDiv)
  await showConfig()
  await showUser()
  showLog()
}
/**
 * 加载全局设置
 * 
 */
async function showConfig() {
  const saveConfigButton = <HTMLElement>document.querySelector('#saveConfig')
  const addUserButton = <HTMLElement>document.querySelector('#addUser')
  const showLogButton = <HTMLElement>document.querySelector('#showLog')
  const configMSG = await options.getConfig()
  let config = configMSG.data
  const configDF = getConfigTemplate(config)
  // 保存全局设置
  saveConfigButton.onclick = async () => {
    modal()
    const configMSG = await options.setConfig(config)
    if (configMSG.msg != null) modal({ body: configMSG.msg })
    else {
      config = configMSG.data
      const configDF = getConfigTemplate(config)
      configDiv.innerText = ''
      configDiv.appendChild(configDF)
      modal({ body: '保存成功' })
    }
  }
  // 添加新用户
  addUserButton.onclick = async () => {
    modal()
    const userDataMSG = await options.newUserData()
    const uid = userDataMSG.uid
    const userData = userDataMSG.data
    const userDF = getUserDF(uid, userData)
    userDiv.appendChild(userDF)
    modal({ body: '添加成功' })
  }
  // 显示日志
  showLogButton.onclick = () => {
    danimation(logDiv)
  }
  configDiv.appendChild(configDF)
}
/**
 * 加载Log
 * 
 */
async function showLog() {
  const logMSG = await options.getLog()
  const logs = logMSG.data
  const logDF = document.createDocumentFragment()
  logs.forEach(log => {
    const div = document.createElement('div')
    div.innerHTML = log.replace(/房间 (\d+) /, '房间 <a href="https://live.bilibili.com/$1" target="_blank" rel="noreferrer">$1</a> ')
    logDF.appendChild(div)
  })
  options.onlog = data => {
    const div = document.createElement('div')
    div.innerHTML = data.replace(/房间 (\d+) /, '房间 <a href="https://live.bilibili.com/$1" target="_blank" rel="noreferrer">$1</a> ')
    logDiv.appendChild(div)
    if (logDiv.scrollHeight - logDiv.clientHeight - logDiv.scrollTop < 2 * div.offsetHeight) logDiv.scrollTop = logDiv.scrollHeight
  }
  returnButton.onclick = () => {
    danimation(optionDiv)
  }
  logDiv.appendChild(logDF)
}
/**
 * 加载用户设置
 * 
 */
async function showUser() {
  const userMSG = await options.getAllUID()
  const uidArray = userMSG.data
  const df = document.createDocumentFragment()
  for (const uid of uidArray) {
    const userDataMSG = await options.getUserData(uid)
    const userData = userDataMSG.data
    const userDF = getUserDF(uid, userData)
    df.appendChild(userDF)
  }
  userDiv.appendChild(df)
}
/**
 * 新建用户模板
 * 
 * @param {string} uid 
 * @param {userData} userData 
 * @returns {DocumentFragment} 
 */
function getUserDF(uid: string, userData: userData): DocumentFragment {
  const userTemplate = <HTMLTemplateElement>template.querySelector('#userTemplate')
  const clone = document.importNode(userTemplate.content, true)
  const userDataDiv = <HTMLDivElement>clone.querySelector('.userData')
  const userConfigDiv = <HTMLDivElement>clone.querySelector('.userConfig')
  const saveUserButton = <HTMLElement>clone.querySelector('.saveUser')
  const deleteUserButton = <HTMLElement>clone.querySelector('.deleteUser')
  const userConfigDF = getConfigTemplate(userData)
  userConfigDiv.appendChild(userConfigDF)
  // 保存用户设置
  let captcha: string | undefined = undefined
  let validate: string | undefined = undefined
  let authcode: string | undefined = undefined
  saveUserButton.onclick = async () => {
    modal()
    const userDataMSG = await options.setUserData({ uid, data: userData, captcha, validate, authcode })
    captcha = undefined
    validate = undefined
    authcode = undefined
    if (userDataMSG.msg == null) {
      modal({ body: '保存成功' })
      userData = userDataMSG.data
      const userConfigDF = getConfigTemplate(userData)
      userConfigDiv.innerText = ''
      userConfigDiv.appendChild(userConfigDF)
    }
    else if (userDataMSG.msg === 'captcha' && userDataMSG.captcha != null) {
      const captchaTemplate = <HTMLTemplateElement>template.querySelector('#captchaTemplate')
      const clone = document.importNode(captchaTemplate.content, true)
      const captchaImg = <HTMLImageElement>clone.querySelector('img')
      const captchaInput = <HTMLInputElement>clone.querySelector('input')
      captchaImg.src = userDataMSG.captcha
      modal({
        body: clone,
        showOK: true,
        onOK: () => {
          captcha = captchaInput.value
          saveUserButton.click()
        }
      })
    }
    else if (userDataMSG.msg === 'authcode' && userDataMSG.authcode != null) {
      const captchaTemplate = <HTMLTemplateElement>template.querySelector('#captchaTemplate')
      const clone = document.importNode(captchaTemplate.content, true)
      const captchaImg = <HTMLImageElement>clone.querySelector('img')
      const qr = qrcode(6, 'L')
      qr.addData(userDataMSG.authcode)
      qr.make()
      captchaImg.src = qr.createDataURL(4)
      modal({
        body: clone,
        showOK: true,
        onOK: () => {
          authcode = 'confirm'
          saveUserButton.click()
        }
      })
    }
    else modal({ body: userDataMSG.msg })
  }
  // 删除用户设置
  deleteUserButton.onclick = async () => {
    modal()
    const userDataMSG = await options.delUserData(uid)
    if (userDataMSG.msg != null) modal({ body: userDataMSG.msg })
    else {
      modal({ body: '删除成功' })
      userDataDiv.remove()
    }
  }
  return clone
}
/**
 * 设置模板
 * 
 * @param {(config | userData)} config 
 * @returns {DocumentFragment} 
 */
function getConfigTemplate(config: config | userData): DocumentFragment {
  const df = document.createDocumentFragment()
  for (const key in config) {
    const info = optionsInfo[key]
    if (info == null) continue
    const configValue = config[key]
    let configTemplate: HTMLTemplateElement
    if (info.type === 'boolean') configTemplate = <HTMLTemplateElement>template.querySelector('#configCheckboxTemplate')
    else configTemplate = <HTMLTemplateElement>template.querySelector('#configTextTemplate')
    const clone = document.importNode(configTemplate.content, true)
    const descriptionDiv = <HTMLDivElement>clone.querySelector('._description')
    const inputInput = <HTMLInputElement>clone.querySelector('.form-control')
    const checkboxInput = <HTMLInputElement>clone.querySelector('.form-check-input')
    switch (info.type) {
      case 'number':
        inputInput.value = (<number>configValue).toString()
        inputInput.oninput = () => config[key] = parseInt(inputInput.value)
        break
      case 'numberArray':
        inputInput.value = (<number[]>configValue).join(',')
        inputInput.oninput = () => config[key] = inputInput.value.split(',').map(value => parseInt(value))
        break
      case 'string':
        inputInput.value = <string>configValue
        inputInput.oninput = () => config[key] = inputInput.value
        break
      case 'stringArray':
        inputInput.value = (<string[]>configValue).join(',')
        inputInput.oninput = () => config[key] = inputInput.value.split(',')
        break
      case 'boolean':
        checkboxInput.checked = <boolean>configValue
        checkboxInput.onchange = () => config[key] = checkboxInput.checked
        break
      default:
        break
    }
    descriptionDiv.innerText = info.description
    descriptionDiv.title = info.tip
    $(descriptionDiv).tooltip()
    df.appendChild(clone)
  }
  return df
}
/**
 * 处理连接中断
 * 
 * @param {string} data 
 */
function wsClose(data: string) {
  const connectSpan = <HTMLSpanElement>loginDiv.querySelector('#connect span')
  configDiv.innerText = ''
  logDiv.innerText = ''
  userDiv.innerText = ''
  connectSpan.innerText = data
  danimation(loginDiv)
}
/**
 * 弹窗提示
 * 无参数时只显示遮罩
 * 
 * @param {modalOPtions} [options] 
 */
function modal(options?: modalOPtions) {
  if (options != null) {
    const modalDialogDiv = <HTMLDivElement>modalDiv.querySelector('.modal-dialog')
    const modalTemplate = <HTMLTemplateElement>template.querySelector('#modalContentTemplate')
    const clone = document.importNode(modalTemplate.content, true)
    const headerTitle = <HTMLHeadingElement>clone.querySelector('.modal-header .modal-title')
    const headerClose = <HTMLElement>clone.querySelector('.modal-header .close')
    const modalBody = <HTMLDivElement>clone.querySelector('.modal-body')
    const footerClose = <HTMLElement>clone.querySelector('.modal-footer .btn-secondary')
    const footerOK = <HTMLElement>clone.querySelector('.modal-footer .btn-primary')
    headerClose.onclick = footerClose.onclick = () => {
      $(modalDiv).one('hidden.bs.modal', () => {
        modalDialogDiv.innerText = ''
        if (typeof options.onClose === 'function') options.onClose(options.body)
      })
      $(modalDiv).modal('hide')
    }
    footerOK.onclick = () => {
      $(modalDiv).one('hidden.bs.modal', () => {
        modalDialogDiv.innerText = ''
        if (typeof options.onOK === 'function') options.onOK(options.body)
      })
      $(modalDiv).modal('hide')
    }
    if (options.body instanceof DocumentFragment) modalBody.appendChild(options.body)
    else modalBody.innerText = options.body
    if (options.title != null) headerTitle.innerText = options.title
    if (options.close != null) footerClose.innerText = options.close
    if (options.ok != null) footerOK.innerText = options.ok
    if (options.showOK) footerOK.classList.remove('d-none')
    modalDialogDiv.appendChild(clone)
  }
  $(modalDiv).modal({ backdrop: 'static', keyboard: false })
}
showLogin()