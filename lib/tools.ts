import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import * as nodemailer from 'nodemailer'
import * as url from 'url'
import * as zlib from 'zlib'
class Tools {
  /**
   * 并不是想造轮子, 只是为了方便使用cookie
   * 
   * @static
   * @param {string} urlStr url字符串hash表示Referer
   * @param {string} [cookie]
   * @param {string} [method='GET']
   * @returns {Promise<Buffer>}
   */
  static XHR(urlStr: string, cookie?: string, method = 'GET'): Promise<Buffer> {
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
        'X-Requested-With': 'XMLHttpRequest'
      }
      // 自以为很机智的用hash附加referer
      if (urlObj.hash !== null) headers['Referer'] = urlObj.hash.slice(1)
      // 很简单的把cookie加进去了, 这也是为什么不用requset
      if (cookie !== undefined) headers['Cookie'] = cookie
      if (method === 'POST') {
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
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
          .on('data', (chunk) => { bufferList.push(chunk) })
          .on('end', () => {
            if (bufferList.length === 0) { reject() }
            else {
              let bufferChunk = Buffer.concat(bufferList)
              resolve(bufferChunk)
            }
          })
          .on('error', (err) => { reject(err) })
      })
      req.on('error', (err) => { reject(err) })
      if (urlObj.query !== null) req.write(urlObj.query)
      req.end()
    })
  }
  /**
   * 操作数据文件, 为了可以快速应用不使用数据库
   * 
   * @static
   * @param {string} appName
   * @param {Object} [userData]
   * @returns {Promise<JSON>}
   */
  static UserInfo(appName: string, userData?: Object): Promise<JSON> {
    return new Promise((resolve, reject) => {
      fs.readFile(`${__dirname}/../configs/${appName}.json`, (err, data) => {
        if (err === null) {
          let appConf: JSON = JSON.parse(data.toString())
          if (userData === undefined) {
            resolve(appConf)
          }
          else {
            appConf['usersData'] = Object.assign(appConf['usersData'], userData)
            let jsonStr = JSON.stringify(appConf)
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
   * @static
   * @param {string} appName
   * @param {JSON} userData
   * @param {string} subject
   * @param {string} html
   * @returns {Promise<nodemailer.SentMessageInfo>}
   */
  static SendMail(appName: string, subject: string, html: string, userData?: JSON): Promise<nodemailer.SentMessageInfo> {
    return new Promise((resolve, reject) => {
      fs.readFile(`${__dirname}/../configs/options.json`, (err, data) => {
        if (err === null) {
          let options: options = JSON.parse(data.toString())
          let transporter = nodemailer.createTransport(options.SMTP)
          let admin = options.SMTP.auth.user
          let mailOptions: nodemailer.SendMailOptions = {
            from: `"${appName}" <${admin}>`,
            subject: subject,
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
   * @static
   * @param {string} appName
   * @param {string} logData
   */
  static Log(appName: string, logData: string) {
    console.log(`${new Date().toISOString()} : ${appName} , ${logData}`)
  }
}
export {Tools}

interface options extends JSON {
  SMTP: optionsSMTP;
}
interface optionsSMTP {
  host: string;
  port: number;
  secure: boolean;
  auth: optionsAuth;
}
interface optionsAuth {
  user: string;
  pass: string;
}