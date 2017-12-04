import * as fs from 'fs'
import * as request from 'request'
import { _options } from '../index'
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
        'Connection': 'Keep-Alive',
        'User-Agent': 'Mozilla/5.0 BiliDroid/5.19.0 (bbcallen@gmail.com)'
      }
      break
    case 'WebView':
      headers = {
        'Accept': 'application/json, text/javascript, */*',
        'Accept-Language': 'zh-CN',
        'Connection': 'keep-alive',
        'Origin': 'https://live.bilibili.com',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 7.1.1; E6883 Build/32.4.A.1.54; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/62.0.3202.84 Mobile Safari/537.36 BiliApp/1',
        'X-Requested-With': 'tv.danmaku.bili'
      }
      break
    default:
      headers = {
        'Accept': 'application/json, text/javascript, */*',
        'Accept-Language': 'zh-CN',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Origin': 'https://live.bilibili.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
      }
      break
  }
  options.headers = options.headers == null ? headers : Object.assign(headers, options.headers)
  if (options.method === 'POST') options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
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
export function setCookie(cookieString: string, urls: string[]): request.CookieJar {
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
export function getCookie(jar: request.CookieJar, url: string, key: string): string {
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
 * @param {_options} [options]
 * @returns {Promise<options>}
 */

export function Options(options?: _options): Promise<_options> {
  return new Promise(async resolve => {
    let dirname = __dirname + (process.env.npm_package_scripts_start === 'node build/app.js' ? '/../../..' : '/../..')
      , hasDir = fs.existsSync(dirname + '/options/')
    if (!hasDir) fs.mkdirSync(dirname + '/options/')
    let hasFile = fs.existsSync(dirname + '/options/options.json')
    if (!hasFile) fs.copyFileSync(dirname + '/bilive/options.default.json', dirname + '/options/options.json')
    if (options == null) {
      let defaultOptionBuffer = fs.readFileSync(dirname + '/bilive/options.default.json')
        , defaultOption = await JsonParse<_options>(defaultOptionBuffer.toString())
        , optionBuffer = fs.readFileSync(dirname + '/options/options.json')
        , option = await JsonParse<_options>(optionBuffer.toString())
      option.newUserData = Object.freeze(defaultOption.newUserData)
      option.info = Object.freeze(defaultOption.info)
      for (let uid in option.user) option.user[uid] = Object.assign({}, option.newUserData, option.user[uid])
      resolve(option)
    }
    else {
      let option = JSON.stringify(options)
      fs.writeFileSync(dirname + '/options/options.json', option)
      resolve(options)
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
  return new Promise(resolve => {
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