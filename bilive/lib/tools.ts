import * as fs from 'fs'
import * as request from 'request'
import { config, usersData, userData } from '../index'
/**
 * 添加request头信息
 * 
 * @export
 * @template T
 * @param {request.Options} options
 * @returns {Promise<T>}
 */
export function XHR<T>(options: request.Options): Promise<T> {
  // 开启gzip压缩
  options.gzip = true
  // 添加头信息
  let headers = {
    'user-agent': 'Mozilla/5.0 BiliDroid/4.34.0 (bbcallen@gmail.com)',
    'referer': 'https://live.bilibili.com/'
  }
  if (options.method === 'POST') headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (options.headers == null) options.headers = headers
  else Object.assign(options.headers, headers)
  // 返回异步request
  return new Promise<T>((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error == null) resolve(body)
      else reject(error)
    })
  })
}
/**
 * 设置cookie
 * 
 * @export
 * @param {string} cookieString
 * @param {string} url
 * @returns {request.CookieJar}
 */
export function SetCookie(cookieString: string, url: string): request.CookieJar {
  let jar = request.jar()
  cookieString.split(';').forEach((cookie) => {
    jar.setCookie(request.cookie(cookie), url)
  })
  return jar
}
/**
 * 操作数据文件, 为了可以快速应用不使用数据库
 * 
 * @export
 * @param {config} [options]
 * @returns {Promise<config>}
 */
export function UserInfo(options?: config): Promise<config> {
  return new Promise<config>((resolve, reject) => {
    if (options == null) {
      fs.readFile(`${__dirname}/../options.json`, (error, data) => {
        if (error == null) {
          let config = <config>JSON.parse(data.toString())
          resolve(config)
        }
        else reject(error)
      })
    }
    else {
      let config = JSON.stringify(options)
      fs.writeFile(`${__dirname}/../options.json`, config, (error) => {
        if (error == null) resolve(options)
        else reject(error)
      })
    }
  })
}
/**
 * 格式化输出, 配合PM2凑合用
 * 
 * @export
 * @param {*} [message]
 * @param {...any[]} optionalParams
 */
export function Log(message?: any, ...optionalParams: any[]) {
  console.log(`${new Date().toString().slice(4, 24)} :`, message, ...optionalParams)
}
/**
 * sleep
 * 
 * @export
 * @param {number} ms
 * @returns {Promise<{}>}
 */
export function Sleep(ms: number): Promise<{}> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms, 'sleep')
  })
}