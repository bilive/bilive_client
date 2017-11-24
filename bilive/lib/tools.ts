import * as fs from 'fs'
import { inflate } from 'zlib'
import * as request from 'request'
import { options } from '../index'
/**
 * 添加request头信息
 * 
 * @export
 * @template T 
 * @param {request.Options} options 
 * @param {('PC' | 'Android' | 'WebView')} [platform='PC'] 
 * @returns {Promise<response<T>>} 
 */
export function XHR<T>(options: request.Options, platform: 'PC' | 'Android' | 'WebView' = 'PC'): Promise<response<T>> {
  options.gzip = true
  // 添加头信息
  let headers: request.Headers
  switch (platform) {
    case 'Android':
      headers = {
        'Accept-Encoding': 'gzip',
        'Connection': 'Keep-Alive',
        'User-Agent': 'Mozilla/5.0 BiliLiveDroid/2.0.0 bililive'
      }
      break
    case 'WebView':
      headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 7.1.1; F8132 Build/41.2.A.7.65; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.98 Mobile Safari/537.36 BiliApp/211109',
        'X-Requested-With': 'com.bilibili.bilibililive'
      }
      break
    default:
      headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6,en;q=0.4',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Origin': 'http://live.bilibili.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
      }
      break
  }
  options.headers = options.headers == null ? headers : Object.assign(headers, options.headers)
  // 返回异步request
  return new Promise<response<T>>((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error == null) resolve({ response, body })
      else reject(error)
    })
  })
}
/**
 * 设置cookie
 * 
 * @export
 * @param {string} cookieString
 * @param {string[]} urls
 * @returns {request.CookieJar}
 */
export function SetCookie(cookieString: string, urls: string[]): request.CookieJar {
  let jar = request.jar()
  urls.forEach(url => {
    cookieString.split(';').forEach((cookie) => {
      jar.setCookie(request.cookie(cookie), url)
    })
  })
  return jar
}
/**
 * 获取cookie值
 * 
 * @export
 * @param {request.CookieJar} jar 
 * @param {string} url 
 * @param {string} key 
 * @returns {string} 
 */
export function GetCookie(jar: request.CookieJar, url: string, key: string): string {
  let cookies = jar.getCookies(url)
    , cookieFind = cookies.find(cookie => {
      if (cookie.key === key) return cookie.value
    })
  return cookieFind == null ? '' : cookieFind.value
}
/**
 * 操作数据文件, 为了可以快速应用不使用数据库
 * 
 * @export
 * @param {options} [options]
 * @returns {Promise<options>}
 */
export function Options(options?: options): Promise<options> {
  return new Promise<options>((resolve, reject) => {
    if (options == null) {
      fs.readFile(`${__dirname}/../options.json`, (error, data) => {
        if (error == null) {
          let config = <options>JSON.parse(data.toString())
          resolve(config)
        }
        else reject(error)
      })
    }
    else {
      let config = JSON.stringify(options)
      fs.writeFile(`${__dirname}/../options.json`, config, error => {
        if (error == null) resolve(options)
        else reject(error)
      })
    }
  })
}
/**
 * 格式化JSON
 * 
 * @export
 * @template T 
 * @param {string} text 
 * @param {((key: any, value: any) => any)} [reviver] 
 * @returns {Promise<T>} 
 */
export function JsonParse<T>(text: string, reviver?: ((key: any, value: any) => any)): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    try {
      let obj = JSON.parse(text, reviver)
      resolve(obj)
    } catch (error) { reject(error) }
  })
}
/**
 * 解压数据
 * 
 * @export
 * @param {Buffer} data 
 * @returns {Promise<Buffer>} 
 */
export function Uncompress(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    inflate(data, (error, result) => {
      if (error == null) resolve(result)
      else reject(error)
    })
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
 * 格式化输出, 配合PM2凑合用
 * 
 * @export
 * @param {*} [message]
 * @param {...any[]} optionalParams
 */
export function Error(message?: any, ...optionalParams: any[]) {
  console.error(`${new Date().toString().slice(4, 24)} :`, message, ...optionalParams)
}
/**
 * sleep
 * 
 * @export
 * @param {number} ms
 * @returns {Promise<{}>}
 */
export function Sleep(ms: number): Promise<{}> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms, 'sleep')
  })
}
/**
 * XHR返回
 * 
 * @export
 * @interface response
 * @template T 
 */
export interface response<T> {
  response: request.RequestResponse
  body: T
}