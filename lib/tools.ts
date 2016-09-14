import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import * as nodemailer from 'nodemailer'
import * as url from 'url'
import * as zlib from 'zlib'
/**
 * 并不是想造轮子, 只是为了方便使用cookie
 * 
 * @export
 * @param {string} urlStr
 * @param {string} [cookie]
 * @param {string} [method='GET']
 * @returns {Promise<Buffer>}
 */
export function XHR(urlStr: string, cookie?: string, method = 'GET'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // 格式化url, 为之后的拼接做准备
    let urlObj = url.parse(urlStr)
    // 因为有符号-, 处理起来比较麻烦, 所以就不定义接口了
    let headers = {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
      'Connection': 'keep-alive',
      'DNT': 1,
      'Host': urlObj.host,
      'Referer': `${urlObj.protocol}//${urlObj.host}/`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:48.0) Gecko/20100101 Firefox/48.0',
      'X-Requested-With': 'XMLHttpRequest'
    }
    // 自以为很机智的用hash附加referer
    if (urlObj.hash !== null) headers['Referer'] = urlObj.hash.slice(1)
    // 很简单的把cookie加进去了, 这也是为什么不用requset
    if (cookie !== undefined) headers['Cookie'] = cookie
    if (method === 'POST') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
      headers['Content-Length'] = (urlObj.query === null) ? 0 : urlObj.query.length
    }
    let options: http.RequestOptions = {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      method: method,
      headers: headers
    }
    // 为了post时去掉search部分
    options.path = (method === 'POST') ? urlObj.pathname : urlObj.path
    let request = (urlObj.protocol === 'https:') ? https.request : http.request
    let req = request(options, (res) => {
      let decompress
      // 不知道大小写有没有影响
      switch (res.headers['content-encoding']) {
        case 'gzip':
          decompress = res.pipe(zlib.createGunzip())
          break
        case 'deflate':
          decompress = res.pipe(zlib.createInflate())
          break
        default:
          decompress = res
          break
      }
      let bufferList = []
      decompress
        .on('error', reject)
        .on('data', (chunk) => { bufferList.push(chunk) })
        .on('end', () => {
          if (bufferList.length === 0) reject()
          else {
            let bufferChunk = Buffer.concat(bufferList)
            resolve(bufferChunk)
          }
        })
    })
    req.on('error', reject)
    if (urlObj.query !== null) req.write(urlObj.query)
    req.end()
  })
}
/**
 * 操作数据文件, 为了可以快速应用不使用数据库
 * 
 * @export
 * @template T
 * @param {string} appName
 * @param {string} [UID]
 * @param {userData} [userData]
 * @returns {Promise<T>}
 */
export function UserInfo<T>(appName: string, UID?: string, userData?: userData): Promise<T> {
  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/../configs/${appName}.json`, (err, data) => {
      if (err === null) {
        let appConfig = <config>JSON.parse(data.toString())
        if (userData === undefined) {
          let usersData = appConfig.usersData
          let canUsersData: usersData = {}
          for (let uid in usersData) {
            if (usersData[uid].status === true) {
              Object.assign(canUsersData, { [uid]: usersData[uid] })
            }
          }
          appConfig.usersData = canUsersData
          resolve(appConfig)
        }
        else {
          Object.assign(appConfig.usersData, { [UID]: userData })
          let jsonStr = JSON.stringify(appConfig)
          fs.writeFile(`${__dirname}/../configs/${appName}.json`, jsonStr, (err) => {
            if (err === null) { resolve() } else { reject(err) }
          })
        }
      }
      else { reject(err) }
    })
  })
}
/**
 * 发送邮件通知一些事情
 * 
 * @export
 * @param {string} appName
 * @param {string} subject
 * @param {string} html
 * @param {userData} [userData]
 * @returns {Promise<nodemailer.SentMessageInfo>}
 */
export function SendMail(appName: string, subject: string, html: string, userData?: userData): Promise<nodemailer.SentMessageInfo> {
  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/../configs/options.json`, (err, data) => {
      if (err === null) {
        let options: options = JSON.parse(data.toString())
        let transporter = nodemailer.createTransport(options.SMTP)
        let admin = options.SMTP.auth.user
        let mailOptions: nodemailer.SendMailOptions = {
          from: `"always_online" <${admin}>`,
          subject: `${appName}, ${subject}`,
          html: html
        }
        mailOptions.to = (userData === undefined) ? admin : userData['email']
        transporter.sendMail(mailOptions, (err, info) => {
          if (err === null) { resolve(info) } else { reject(err) }
        })
      }
      else { reject(err) }
    })
  })
}
/**
 * 格式化输出, 配合PM2凑合用
 * 
 * @export
 * @param {string} appName
 * @param {string} logData
 */
export function Log(appName: string, logData: string) {
  console.log(`${new Date().toISOString()} : ${appName} , ${logData}`)
}
/**
 * 应用用户信息设置
 * 
 * @export
 * @interface config
 */
export interface config {
  usersData: usersData
}
export interface usersData {
  [index: string]: userData
}
export interface userData {
  userName: string
  email: string
  failure: number
  status: boolean
  cookie: string
}
/**
 * 系统设置
 * 
 * @interface options
 */
interface options {
  SMTP: optionsSMTP
}
interface optionsSMTP {
  host: string
  port: number
  secure: boolean
  auth: optionsAuth
}
interface optionsAuth {
  user: string
  pass: string
}