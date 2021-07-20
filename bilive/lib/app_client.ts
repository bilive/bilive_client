import crypto, { KeyLike, RsaPublicKey } from 'crypto'
import { Headers } from 'got'
import { CookieJar } from 'tough-cookie'
import tools from './tools'
/**
 * 登录状态
 *
 * @enum {number}
 */
enum appStatus {
  'success',
  'error',
  'httpError',
  'validate',
  'authcode',
}
/**
 * 模拟app登录
 *
 * @abstract
 * @class AppClient
 */
abstract class AppClient {
  // 固定参数
  public static readonly vendor = {
    brand: 'Sony',
    buildhost: 'ip-10-26-20-19',
    cpuVendor: 'ARM',
    date: 'Thu Jul 1 21:41:24 JST 2021',
    device: 'qssi',
    fingerprint: 'Sony/qssi/qssi:11/RKQ1.210107.001/1:user/release-keys',
    id: '61.0.A.10.1',
    incremental: '1',
    kernel: '5.4.61-qgki-00366-g7f139a75669b',
    manufacturer: 'Sony',
    marketname: 'Xperia 1 III',
    model: 'XQ-BC72',
    modem: 'lahaina.gen-00013-13,lahaina.gen-00013-13',
    name: 'qssi',
    platform: 'qcom',
    release: '11',
    sdk: '30',
    tags: 'release-keys',
    type: 'user',
    utc: '1625143284',
  }
  // bilibili 客户端
  protected static _version = '6.33.0'
  protected static _versionCode = '6330300'
  protected static _innerVersionCode = '6330300'
  protected static get _buvid(): string {
    const uuid = this.RandomHex(32).toUpperCase()
    return 'XX' + uuid[2] + uuid[12] + uuid[22] + uuid
  }
  protected static get _deviceID(): string {
    const yyyyMMddHHmmss = new Date().toISOString().replace(/[-:TZ]/g, '').slice(0, 14)
    const deviceID = this.RandomHex(32) + yyyyMMddHHmmss + this.RandomHex(16)
    const check = deviceID.match(/\w{2}/g)?.map(v => parseInt(v, 16)).reduce((a, c) => a + c).toString(16).substr(-2)
    return deviceID + check
  }
  protected static get _headerDeviceID(): string {
    const device = Buffer.from(`${AppClient.RandomHex(16)}@${AppClient.vendor.model}`)
    device[0] = device[0] ^ (device.length & 0x00ff)
    for (let i = 1; i < device.length; i = i + 1)  device[i] = ((device[(i - 1)] ^ device[i]) & 0x00ff)
    return device.toString('base64url')
  }

  protected static readonly __loginSecretKey: string = '60698ba2f68e01ce44738920a0ffe768'
  public static readonly loginAppKey: string = 'bca7e84c2d947ac6'
  protected static readonly __secretKey: string = '560c52ccd288fed045859ed18bffd973'
  public static readonly appKey: string = '1d8b6e7d45233436'
  public static readonly actionKey: string = 'appkey'
  // 同一客户端应与deviceID相同
  public static get biliLocalID(): string { return AppClient._deviceID }
  public static readonly build: string = AppClient._versionCode
  public static get buvid(): string { return AppClient._buvid }
  public static readonly Clocale: string = 'zh-Hans_CN'
  public static readonly channel: string = 'master'
  public static readonly device: string = 'android'
  public static get deviceID(): string { return AppClient._deviceID }
  public static readonly deviceName: string = AppClient.vendor.brand + AppClient.vendor.model
  public static readonly devicePlatform: string = 'Android' + AppClient.vendor.release + AppClient.vendor.brand + AppClient.vendor.model
  public static get headerDeviceID(): string { return AppClient._headerDeviceID }
  // 同一客户端应与buvid相同
  public static get localID(): string { return AppClient._buvid }
  public static readonly mobiApp: string = 'android'
  public static readonly platform: string = 'android'
  public static readonly Slocale: string = 'zh-Hans_CN'
  public static readonly statistics: string = encodeURIComponent(`{"appId":1,"platform":3,"version":"${AppClient._version}","abtest":""}`)

  // bilibili 国际版
  // protected static readonly __loginSecretKey: string = 'c75875c596a69eb55bd119e74b07cfe3'
  // public static readonly loginAppKey: string = 'ae57252b0c09105d'
  // protected static readonly __secretKey: string = '36efcfed79309338ced0380abd824ac1'
  // public static readonly appKey: string = 'bb3101000e232e27'
  // public static readonly build: string = '112000'
  // public static readonly lang: string = 'hans'
  // public static readonly locale: string = 'zh_CN'
  // public static readonly sim_code: string = '46001'
  // public static readonly statistics: string = encodeURIComponent('{"appId":1,"platform":3,"version":"2.10.1","abtest":""}')
  // public static readonly timezone: string = 'GMT+08:00'
  // public static readonly mobiApp: string = 'android_i'

  // bilibili 概念版
  // protected static readonly __loginSecretKey: string = '34381a26236dd1171185c0beb042e1c6'
  // public static readonly loginAppKey: string = '178cf125136ca8ea'
  // protected static readonly __secretKey: string = '25bdede4e1581c836cab73a48790ca6e'
  // public static readonly appKey: string = '07da50c9a0bf829f'
  // public static readonly build: string = '5380400'
  // public static readonly mobiApp: string = 'android_b'

  // bilibili TV
  // protected static readonly __loginSecretKey: string = '59b43e04ad6965f34319062b478f83dd'
  // public static readonly loginAppKey: string = '4409e2ce8ffd12b8'
  // protected static readonly __secretKey: string = '59b43e04ad6965f34319062b478f83dd'
  // public static readonly appKey: string = '4409e2ce8ffd12b8'
  // public static readonly biliLocalId: string = AppClient.RandomID(20)
  // public static readonly build: string = '102401'
  // public static readonly buvid: string = AppClient.RandomID(37).toUpperCase()
  // public static readonly channel: string = 'master'
  // public static readonly device: string = 'Sony'
  // public static readonly deviceId: string = AppClient.biliLocalId
  // public static readonly deviceName: string = 'M2007J1SC'
  // public static readonly devicePlatform: string = 'Android10XiaomiM2007J1SC'
  // public static get fingerprint(): string { return this.RandomID(62) }
  // public static readonly guid: string = AppClient.buvid
  // // 同一客户端与fingerprint相同
  // public static get localFingerprint(): string { return this.fingerprint }
  // public static readonly localId: string = AppClient.buvid
  // public static readonly mobiApp: string = 'android_tv_yst'
  // public static readonly networkstate: string = 'wifi'
  // public static readonly platform: string = 'android'

  // bilibili link
  // protected static readonly __loginSecretKey: string = 'e988e794d4d4b6dd43bc0e89d6e90c43'
  // public static readonly loginAppKey: string = '37207f2beaebf8d7'
  // protected static readonly __secretKey: string = 'e988e794d4d4b6dd43bc0e89d6e90c43'
  // public static readonly appKey: string = '37207f2beaebf8d7'
  // public static readonly build: string = '4610002'
  // public static readonly mobiApp: string = 'biliLink'
  // public static readonly platform: string = 'android_link'

  /**
   * 谜一样的TS
   *
   * @readonly
   * @static
   * @type {number}
   * @memberof AppClient
   */
  public static get TS(): number { return Math.floor(Date.now() / 1000) }
  /**
   * 谜一样的RND
   *
   * @readonly
   * @static
   * @type {number}
   * @memberof AppClient
   */
  public static get RND(): number { return AppClient.RandomNum(9) }
  /**
   * 谜一样的RandomNum
   *
   * @static
   * @param {number} length
   * @returns {number}
   * @memberof AppClient
   */
  public static RandomNum(length: number): number {
    const words = '0123456789'
    let randomNum = ''
    randomNum += words[Math.floor(Math.random() * 9) + 1]
    for (let i = 0; i < length - 1; i++) randomNum += words[Math.floor(Math.random() * 10)]
    return +randomNum
  }
  /**
   * 谜一样的RandomID
   *
   * @static
   * @param {number} length
   * @returns {string}
   * @memberof AppClient
   */
  public static RandomID(length: number): string {
    const words = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let randomID = ''
    randomID += words[Math.floor(Math.random() * 61) + 1]
    for (let i = 0; i < length - 1; i++) randomID += words[Math.floor(Math.random() * 62)]
    return randomID
  }
  /**
   * 随机Hex
   *
   * @static
   * @returns {string}
   * @memberof AppClient
   */
  public static RandomHex(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').substring(0, length)
  }
  /**
   * UUID
   *
   * @readonly
   * @static
   * @type {string}
   * @memberof AppClient
   */
  public static get UUID(): string {
    return this.RandomHex(32).replace(/(\w{8})(\w{4})\w(\w{3})\w(\w{3})(\w{12})/, `$1-$2-4$3-${'89ab'[Math.floor(Math.random() * 4)]}$4-$5`)
  }
  /**
   * MAC
   *
   * @readonly
   * @static
   * @type {string}
   * @memberof AppClient
   */
  public static get MAC(): string {
    return this.RandomHex(12).match(/\w{2}/g)?.join(':') || '00:00:00:00:00:00'
  }
  /**
   * 基本请求参数
   *
   * @readonly
   * @static
   * @type {string}
   * @memberof AppClient
   */
  public static get baseQuery(): string {
    return `actionKey=${this.actionKey}&appkey=${this.appKey}&build=${this.build}&c_locale=${this.Clocale}&channel=${this.channel}\
&device=${this.device}&mobi_app=${this.mobiApp}&platform=${this.platform}&s_locale=${this.Slocale}&statistics=${this.statistics}`
  }
  /**
   * 登录请求参数
   *
   * @readonly
   * @static
   * @type {string}
   * @memberof AppClient
   */
  public static get loginQuery(): string {
    return `appkey=${this.loginAppKey}&build=${this.build}&c_locale=${this.Clocale}&channel=${this.channel}\
&mobi_app=${this.mobiApp}&platform=${this.platform}&s_locale=${this.Slocale}&statistics=${this.statistics}`
  }
  /**
   * 对参数签名
   *
   * @static
   * @param {string} params
   * @param {boolean} [ts=true]
   * @param {string} [secretKey=this.__secretKey]
   * @returns {string}
   * @memberof AppClient
   */
  public static signQuery(params: string, ts: boolean = true, secretKey: string = this.__secretKey): string {
    let paramsSort = params
    if (ts) paramsSort = `${params}&ts=${this.TS}`
    paramsSort = paramsSort.split('&').sort().join('&')
    const paramsSecret = paramsSort + secretKey
    const paramsHash = tools.Hash('md5', paramsSecret)
    return `${paramsSort}&sign=${paramsHash}`
  }
  /**
   * 对参数加参后签名
   *
   * @static
   * @param {string} [params]
   * @returns {string}
   * @memberof AppClient
   */
  public static signBaseQuery(params?: string): string {
    const paramsBase = params === undefined ? this.baseQuery : `${params}&${this.baseQuery}`
    return this.signQuery(paramsBase)
  }
  /**
   * 对参数加参后签名
   *
   * @static
   * @param {string} [params]
   * @returns {string}
   * @memberof AppClient
   */
  public static signQueryBase(params?: string): string {
    return this.signBaseQuery(params)
  }
  /**
   * 对登录参数加参后签名
   *
   * @static
   * @param {string} [params]
   * @returns {string}
   * @memberof AppClient
   */
  public static signLoginQuery(params?: string): string {
    const paramsBase = params === undefined ? this.loginQuery : `${params}&${this.loginQuery}`
    return this.signQuery(paramsBase, true, this.__loginSecretKey)
  }

  // 固定参数
  constructor(deviceInfo?: deviceInfo) {
    if (deviceInfo !== undefined) {
      this._vendor = deviceInfo.vendor
      this._adid = deviceInfo.adid
      this._fts = deviceInfo.fts
      this._guestID = deviceInfo.guestID
      this._guid = deviceInfo.guid
      this._uid = deviceInfo.uid
      this._deviceID = deviceInfo.deviceID
    }
  }

  protected _vendor = AppClient.vendor
  protected _adid = AppClient.RandomHex(16)
  protected _fts = AppClient.TS.toString()
  protected _guestID = ''
  protected _guid = AppClient.UUID
  protected _uid = `101${AppClient.RandomNum(2)}`
  protected _deviceID = this._biliLocalID

  protected get _buvidXX(): string {
    // XW UUID
    // XX AndroidID
    // XY MAC
    // XZ IMEI
    const buvid = tools.Hash('MD5', this._adid).toUpperCase()
    return 'XX' + buvid[2] + buvid[12] + buvid[22] + buvid
  }
  protected get _biliLocalID(): string {
    const yyyyMMddHHmmss = new Date().toISOString().replace(/[-:TZ]/g, '').slice(0, 14)
    const biliLocalID = tools.Hash('MD5', this._buvidXX + this._vendor.model + this._vendor.modem) + yyyyMMddHHmmss + AppClient.RandomHex(16)
    const biliLocalIDCheck = biliLocalID.match(/\w{2}/g)?.map(v => parseInt(v, 16)).reduce((a, c) => a + c).toString(16).substr(-2)
    return biliLocalID + biliLocalIDCheck
  }
  // 此Device-ID和之前的Device-ID并不一致, 多用在headers
  protected get _headerDeviceID(): string {
    const device = Buffer.from(`${this._adid}@${this._vendor.model}`)
    device[0] = device[0] ^ (device.length & 0x00ff)
    for (let i = 1; i < device.length; i = i + 1)  device[i] = ((device[(i - 1)] ^ device[i]) & 0x00ff)
    return device.toString('base64url')
  }

  protected __loginSecretKey: string = AppClient.__loginSecretKey
  public loginAppKey: string = AppClient.loginAppKey
  protected __secretKey: string = AppClient.__secretKey
  public actionKey: string = AppClient.actionKey
  public appKey: string = AppClient.appKey
  public get biliLocalID(): string { return this._deviceID }
  public build: string = AppClient.build
  public get buvid(): string { return this._buvidXX }
  public channel: string = AppClient.channel
  public Clocale: string = AppClient.Clocale
  public device: string = AppClient.device
  public get deviceID(): string { return this._deviceID }
  public deviceName: string = AppClient.deviceName
  public devicePlatform: string = AppClient.devicePlatform
  public get headerDeviceID(): string { return this._headerDeviceID }
  public get localID(): string { return this._buvidXX }
  public mobiApp: string = AppClient.mobiApp
  public platform: string = AppClient.platform
  public Slocale: string = AppClient.Slocale
  public statistics: string = AppClient.statistics
  /**
   * 请求头
   *
   * @type {Headers}
   * @memberof AppClient
   */
  public headers: Headers = {
    'User-Agent': `Mozilla/5.0 BiliDroid/${AppClient._version} (bbcallen@gmail.com) os/${this.device} model/${this._vendor.model} mobi_app/${this.mobiApp} build/${this.build} channel/${this.channel} innerVer/${AppClient._innerVersionCode} osVer/${this._vendor.release} network/1`,
    'APP-KEY': this.mobiApp,
    'Buvid': this.buvid,
    'Device-ID': this.headerDeviceID,
    'env': 'prod'
  }
  /**
   * 设备指纹
   * 目前登录并不会检测此项, 从MITM破坏dt值并不会报错得出此结论
   *
   * @memberof AppClient
   */
  public get deviceMeta() {
    const battery = AppClient.RandomNum(2)
    const brightness = AppClient.RandomNum(2).toString()
    const mem = `12000${AppClient.RandomNum(6)}`
    return {
      'aaid': '',
      'accessibility_service': '[]',
      'adb_enabled': '0',
      'adid': this._adid,
      'androidapp20': '[]',
      'androidappcnt': 400 + AppClient.RandomNum(2),
      'androidsysapp20': '[]',
      'app_id': '1',
      'app_version': AppClient._version,
      'app_version_code': AppClient._versionCode,
      'apps': '[]',
      'axposed': 'false',
      'band': this._vendor.modem,
      'battery': battery,
      'batteryState': 'BATTERY_STATUS_DISCHARGING',
      'biometric': '1',
      'biometrics': 'touchid',
      'boot': '',
      'brand': this._vendor.brand,
      'brightness': brightness,
      'bssid': '02:00:00:00:00:00',
      'btmac': '',
      'build_id': this._vendor.id,
      'buvid_local': this.buvid,
      'chid': 'master',
      'countryIso': 'cn',
      'cpuCount': '8',
      'cpuFreq': '1804800',
      'cpuModel': 'ARMv8 Processor rev 0 (v8l)',
      'cpuVendor': this._vendor.cpuVendor,
      'data_activity_state': '3',
      'data_connect_state': '2',
      'device_angle': '',
      'emu': '000',
      'files': '/data/user/0/tv.danmaku.bili/files',
      'first': 'false',
      'free_memory': AppClient.RandomNum(10).toString(),
      'fstorage': 256_100_000_000 + AppClient.RandomNum(7),
      'fts': this._fts,
      'gadid': '',
      'glimit': '',
      'gps_sensor': '1',
      'guest_id': this._guestID,
      'guid': this._guid,
      'gyroscope_sensor': '1',
      'is_root': 'false',
      'kernel_version': this._vendor.kernel,
      'languages': 'zh',
      'last_dump_ts': Date.now().toString(),
      'light_intensity': '',
      'linear_speed_sensor': '0',
      'mac': '',
      'maps': '',
      'mem': mem,
      "memory": mem,
      'mid': '',
      'model': this._vendor.model,
      'net': '[]',
      'network': 'CELLULAR',
      'oaid': '',
      'oid': '46001',
      'os': 'android',
      'osver': this._vendor.release,
      'proc': 'tv.danmaku.bili',
      'props': {
        'gsm.network.type': 'LTE,LTE',
        'gsm.sim.state': 'LOADED,LOADED',
        'http.agent': '',
        'http.proxy': '',
        'net.dns1': '',
        'net.eth0.gw': '',
        'net.gprs.local-ip': '',
        'net.hostname': '',
        'persist.sys.country': '',
        'persist.sys.language': '',
        'ro.boot.hardware': this._vendor.platform,
        'ro.boot.serialno': '',
        'ro.build.date.utc': this._vendor.utc,
        'ro.build.tags': this._vendor.tags,
        'ro.debuggable': '0',
        'ro.product.device': this._vendor.device,
        'ro.serialno': '',
        'sys.usb.state': ''
      },
      'rc_app_code': '0000000000',
      'root': false,
      'screen': '1080,2340,392',
      'sdkver': '0.2.4',
      'sensor': '[]',
      'sensors_info': '[]',
      'sim': '5',
      'speed_sensor': '1',
      'ssid': '<unknown ssid>',
      'str_app_id': '1',
      'str_battery': battery.toString(),
      'str_brightness': brightness,
      'sys': {
        'cpu_abi': 'armeabi-v7a',
        'cpu_abi2': 'armeabi',
        'device': this._vendor.device,
        'display': this._vendor.id,
        'fingerprint': this._vendor.fingerprint,
        'hardware': this._vendor.platform,
        'manufacturer': this._vendor.manufacturer,
        'product': this._vendor.name,
        'serial': 'unknown'
      },
      'systemvolume': 0,
      't': Date.now().toString(),
      'totalSpace': AppClient.RandomNum(12),
      'udid': this._adid,
      'ui_version': this._vendor.id.toLowerCase(),
      'uid': this._uid,
      'usb_connected': '0',
      'vaid': '',
      'virtual': '0',
      'virtualproc': '[]',
      'wifimac': '',
      'wifimaclist': []
    }
  }
  /**
   * 设备信息
   *
   * @memberof AppClient
   */
  public get deviceInfo() {
    return {
      'AndroidID': this._adid,
      'BuildBrand': this._vendor.brand,
      'BuildDisplay': this._vendor.id,
      'BuildFingerprint': this._vendor.fingerprint,
      'BuildHost': this._vendor.buildhost,
      'Buvid': this.buvid,
      'DeviceType': AppClient.device,
      'fts': this._fts
    }
  }
  /**
   * 基本请求参数
   *
   * @type {string}
   * @memberof AppClient
   */
  public baseQuery: string = `actionKey=${this.actionKey}&appkey=${this.appKey}&build=${this.build}&c_locale=${this.Clocale}&channel=${this.channel}\
&device=${this.device}&mobi_app=${this.mobiApp}&platform=${this.platform}&s_locale=${this.Slocale}&statistics=${this.statistics}`
  /**
   * 登录请求参数
   *
   * @type {string}
   * @memberof AppClient
   */
  public loginQuery: string = `appkey=${this.loginAppKey}&build=${this.build}&buvid=${this.buvid}&c_locale=${this.Clocale}&channel=${this.channel}\
&mobi_app=${this.mobiApp}&platform=${this.platform}&s_locale=${this.Slocale}&statistics=${this.statistics}`
  /**
   * 对参数签名
   *
   * @param {string} params
   * @param {boolean} [ts=true]
   * @param {string} [secretKey=this.__secretKey]
   * @returns {string}
   * @memberof AppClient
   */
  public signQuery(params: string, ts: boolean = true, secretKey: string = this.__secretKey): string {
    return AppClient.signQuery(params, ts, secretKey)
  }
  /**
   * 对参数加参后签名
   *
   * @param {string} [params]
   * @returns {string}
   * @memberof AppClient
   */
  public signBaseQuery(params?: string): string {
    const paramsBase = params === undefined ? this.baseQuery : `${params}&${this.baseQuery}`
    return this.signQuery(paramsBase)
  }
  /**
     * 对登录参数加参后签名
     *
     * @param {string} [params]
     * @returns {string}
     * @memberof AppClient
     */
  public signLoginQuery(params?: string): string {
    const paramsBase = params === undefined ? this.loginQuery : `${params}&${this.loginQuery}`
    return this.signQuery(paramsBase, true, this.__loginSecretKey)
  }
  /**
   * 登录状态
   *
   * @static
   * @type {typeof appStatus}
   * @memberof AppClient
   */
  public static readonly status: typeof appStatus = appStatus
  /**
   * 极验验证码, 登录时会自动清空
   *
   * @type {string}
   * @memberof AppClient
   */
  public validate: string = ''
  /**
   * 极验验证页面, 登录时会自动清空
   *
   * @type {string}
   * @memberof AppClient
   */
  public validateURL: string = ''
  /**
   * 用户名, 推荐邮箱或电话号
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public abstract userName: string
  /**
   * 密码
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public abstract passWord: string
  /**
   * 登录后获取的B站UID
   *
   * @abstract
   * @type {number}
   * @memberof AppClient
   */
  public abstract biliUID: number
  /**
   * 登录后获取的access_token
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public abstract accessToken: string
  /**
   * 登录后获取的refresh_token
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public abstract refreshToken: string
  /**
   * 登录后获取的cookieString
   *
   * @abstract
   * @type {string}
   * @memberof AppClient
   */
  public abstract cookieString: string
  /**
   * 登录后创建的CookieJar
   *
   * @abstract
   * @type {CookieJar}
   * @memberof AppClient
   */
  public abstract jar: CookieJar
  /**
   * RSA/ECB/PKCS1Padding
   *
   * @protected
   * @param {KeyLike} key
   * @param {string} plainText
   * @returns {Buffer}
   * @memberof AppClient
   */
  protected _RSA(key: KeyLike, plainText: string): Buffer {
    const RSAPublicKey: RsaPublicKey = {
      key,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }
    const encrypted = crypto.publicEncrypt(RSAPublicKey, Buffer.from(plainText))
    return encrypted
  }
  /**
   * 对密码进行加密
   *
   * @protected
   * @param {getKeyResponseData} publicKey
   * @returns {string}
   * @memberof AppClient
   */
  protected _RSAPassWord(publicKey: getKeyResponseData): string {
    const hashPassWord = publicKey.hash + this.passWord
    const encryptPassWord = this._RSA(publicKey.key, hashPassWord).toString('base64')
    return encryptPassWord
  }
  /**
   * 对指纹进行加密
   *
   * @protected
   * @param {string} key
   * @param {object} [meta=this.deviceMeta]
   * @returns {string}
   * @memberof AppClient
   */
  protected _AESMeta(key: string, meta: object = this.deviceMeta): string {
    const metaText = JSON.stringify(meta)
    const cipher = crypto.createCipheriv('aes-128-cbc', key, key)
    const encrypted = Buffer.concat([cipher.update(metaText), cipher.final()])
    return encrypted.toString('hex').toUpperCase()
  }
  /**
   * 获取来宾ID
   *
   * @protected
   * @returns {(Promise<string>)}
   * @memberof AppClient
   */
  protected async _getGuestID(): Promise<string> {
    const stime = (Date.now() - 10).toString()
    const ftime = Date.now().toString()

    const reportBaseQuery = `appkey=${this.appKey}&build=${this.build}&buvid=${this.buvid}&c_locale=${this.Clocale}&channel=${this.channel}\
&event_type=4&fts=${this._fts}&mobi_app=${this.mobiApp}&platform=${this.platform}&s_locale=${this.Slocale}&statistics=${this.statistics}`

    const reportStartupQuery = `${reportBaseQuery}&event_id=${encodeURIComponent('app.active.startup.sys')}&message_info=${encodeURIComponent(`{"app_id":"1",\
"brand":${this._vendor.brand},"buvid":${this.buvid},"chid":${this.channel},"ctime":${stime},"device_id":${this.headerDeviceID},"event_category":"4",\
"event_id":"app.active.startup.sys","extended_fields":"{buvid_ext=${this.buvid}, idfa=, session_id=null, lastruninterval=0, openudid=${this._adid}, \
mac=, oaid=}","fts":${this._fts},"latitude":"0","logver":"","longitude":"0","mid":"","model":${this._vendor.model},"network":"1","oid":"46001","osver":"11",\
"platform":"3","retry_send_count":"0","upload_time":${stime},"version":${AppClient._version},"version_code":${AppClient._versionCode}}`)}`
    const reportStartup: XHRoptions = {
      method: 'POST',
      url: 'https://app.bilibili.com/x/v2/dataflow/report',
      body: this.signQuery(reportStartupQuery),
      responseType: 'json',
      headers: this.headers
    }

    const reportFingerprintQuery = `${reportBaseQuery}&event_id=${encodeURIComponent('app.active.devicefingerprint.sys')}&message_info=${encodeURIComponent(`{"app_id":"1",\
"brand":${this._vendor.brand},"buvid":${this.buvid},"chid":${this.channel},"ctime":${ftime},"device_id":${this.headerDeviceID},"event_category":"4",\
"event_id":"app.active.devicefingerprint.sys","extended_fields":"{serial=unknown, guid=${this._uid}, android_id=${this._adid}}","fts":${this._fts},"latitude":"0",\
"logver":"","longitude":"0","mid":"","model":${this._vendor.model},"network":"1","oid":"46001","osver":"11","platform":"3","retry_send_count":"0",\
"upload_time":${ftime},"version":${AppClient._version},"version_code":${AppClient._versionCode}}`)}`
    const reportFingerprin: XHRoptions = {
      method: 'POST',
      url: 'https://app.bilibili.com/x/v2/dataflow/report',
      body: this.signQuery(reportFingerprintQuery),
      responseType: 'json',
      headers: this.headers
    }

    const reportStartupResponse = await tools.XHR<regResponse>(reportStartup, 'Android')
    const reportFingerprinResponse = await tools.XHR<regResponse>(reportFingerprin, 'Android')
    if (reportStartupResponse?.response.statusCode === 200 && reportFingerprinResponse?.response.statusCode === 200 && reportStartupResponse.body.code === 0 && reportFingerprinResponse.body.code === 0) {
      const getKeyResponse = await this._getKey()
      if (getKeyResponse?.response.statusCode === 200 && getKeyResponse.body.code === 0) {
        const publicKey = getKeyResponse.body.data
        const key = AppClient.RandomID(16)
        const deviceInfo = this._AESMeta(key, this.deviceInfo)
        const dt = encodeURIComponent(this._RSA(publicKey.key, key).toString('base64'))
        const regQuery = `device_info=${deviceInfo}&dt=${dt}`
        const reg: XHRoptions = {
          method: 'POST',
          url: 'https://passport.bilibili.com/x/passport-user/guest/reg',
          body: this.signLoginQuery(regQuery),
          responseType: 'json',
          headers: this.headers
        }
        const regResponse = await tools.XHR<regResponse>(reg, 'Android')
        if (regResponse?.response.statusCode === 200 && regResponse.body.code === 0)
          return regResponse.body.data.guest_id.toString()
      }
    }
    return ''
  }
  /**
   * 获取公钥
   *
   * @protected
   * @returns {(Promise<response<getKeyResponse> | undefined>)}
   * @memberof AppClient
   */
  protected _getKey(): Promise<XHRresponse<getKeyResponse> | undefined> {
    const getKey: XHRoptions = {
      url: `https://passport.bilibili.com/x/passport-login/web/key?${this.signLoginQuery()}`,
      responseType: 'json',
      headers: this.headers
    }
    return tools.XHR<getKeyResponse>(getKey, 'Android')
  }
  /**
   * 验证登录信息
   *
   * @protected
   * @param {getKeyResponseData} publicKey
   * @returns {Promise<response<authResponse> | undefined>)}
   * @memberof AppClient
   */
  protected _auth(publicKey: getKeyResponseData): Promise<XHRresponse<authResponse> | undefined> {
    const passWord = encodeURIComponent(this._RSAPassWord(publicKey))
    const validate = this.validate === '' ? '' : `validate=${this.validate}&`
    const key = AppClient.RandomID(16)
    const deviceMeta = this._AESMeta(key)
    const dt = encodeURIComponent(this._RSA(publicKey.key, key).toString('base64'))
    const authQuery = `${validate}username=${encodeURIComponent(this.userName)}&password=${passWord}&bili_local_id=${this.biliLocalID}&device=phone\
&device_id=${this.deviceID}&device_meta=${deviceMeta}&device_name=${this.deviceName}&device_platform=${this.devicePlatform}&device_tourist_id=${this._guestID}\
&dt=${dt}&from_pv=${encodeURIComponent('main.my-information.my-login.0.click')}&from_url=${encodeURIComponent('bilibili://user_center/mine')}\
&local_id=${this.localID}&login_session_id=${tools.Hash('MD5', this.buvid + Date.now())}&spm_id=${encodeURIComponent('main.my-information.my-login.0')}`
    const auth: XHRoptions = {
      method: 'POST',
      url: 'https://passport.bilibili.com/x/passport-login/oauth2/login',
      body: this.signLoginQuery(authQuery),
      responseType: 'json',
      headers: this.headers
    }
    this.validate = ''
    return tools.XHR<authResponse>(auth, 'Android')
  }
  /**
   * 更新用户凭证
   *
   * @protected
   * @param {authResponseData} authResponseData
   * @memberof AppClient
   */
  protected _update(authResponseData: authResponseData) {
    const tokenInfo = authResponseData.token_info
    const cookies = authResponseData.cookie_info.cookies
    this.biliUID = +tokenInfo.mid
    this.accessToken = tokenInfo.access_token
    this.refreshToken = tokenInfo.refresh_token
    this.cookieString = cookies.reduce((cookieString, cookie) => cookieString === ''
      ? `${cookie.name}=${cookie.value}`
      : `${cookieString}; ${cookie.name}=${cookie.value}`
      , '')
  }
  /**
   * 客户端登录
   *
   * @returns {Promise<loginResponse>}
   * @memberof AppClient
   */
  public async login(): Promise<loginResponse> {
    if (this._guestID === '') this._guestID = await this._getGuestID()
    const getKeyResponse = await this._getKey()
    if (getKeyResponse?.response.statusCode === 200 && getKeyResponse.body.code === 0) {
      const authResponse = await this._auth(getKeyResponse.body.data)
      if (authResponse?.response.statusCode === 200) {
        if (authResponse.body.code === 0) {
          if (authResponse.body.data.status === 0 && authResponse.body.data.token_info != null && authResponse.body.data.cookie_info != null) {
            this._update(authResponse.body.data)
            return { status: AppClient.status.success, data: authResponse.body }
          }
          return { status: AppClient.status.error, data: authResponse.body }
        }
        if (authResponse.body.code === -105) {
          this.validateURL = authResponse.body.data.url
          return { status: AppClient.status.validate, data: authResponse.body }
        }
        return { status: AppClient.status.error, data: authResponse.body }
      }
      return { status: AppClient.status.httpError, data: authResponse }
    }
    return { status: AppClient.status.httpError, data: getKeyResponse }
  }
  /**
   * 客户端登出
   *
   * @returns {Promise<logoutResponse>}
   * @memberof AppClient
   */
  public async logout(): Promise<logoutResponse> {
    const revokeQuery = `access_token=${this.accessToken}&mid=${tools.getCookie(this.jar, 'DedeUserID')}&session=${encodeURIComponent(tools.getCookie(this.jar, 'SESSDATA'))}\
&bili_local_id=${this.biliLocalID}&buvid=${this.buvid}&device=phone&device_id=${this.deviceID}&device_name=${this.deviceName}&device_platform=${this.devicePlatform}&local_id=${this.localID}`
    const revoke: XHRoptions = {
      method: 'POST',
      url: 'https://passport.bilibili.com/x/passport-login/revoke',
      body: this.signLoginQuery(revokeQuery),
      responseType: 'json',
      headers: this.headers
    }
    const revokeResponse = await tools.XHR<revokeResponse>(revoke, 'Android')
    if (revokeResponse?.response.statusCode === 200) {
      if (revokeResponse.body.code === 0) return { status: AppClient.status.success, data: revokeResponse.body }
      return { status: AppClient.status.error, data: revokeResponse.body }
    }
    return { status: AppClient.status.httpError, data: revokeResponse }
  }
  /**
   * 更新access_token
   *
   * @returns {Promise<loginResponse>}
   * @memberof AppClient
   */
  public async refresh(): Promise<loginResponse> {
    const cookie = this.cookieString === '' ? '' : `${this.cookieString.split('; ').map(cookie => cookie.split('=').map(v => encodeURIComponent(v)).join('=')).sort().join('&')}&`
    const refreshQuery = `${cookie}access_key=${this.accessToken}&access_token=${this.accessToken}&refresh_token=${this.refreshToken}`
    const refresh: XHRoptions = {
      method: 'POST',
      url: 'https://passport.bilibili.com/x/passport-login/oauth2/refresh_token',
      body: this.signLoginQuery(refreshQuery),
      responseType: 'json',
      headers: this.headers
    }
    const refreshResponse = await tools.XHR<authResponse>(refresh, 'Android')
    if (refreshResponse?.response.statusCode === 200) {
      if (refreshResponse.body?.code === 0) {
        this._update(refreshResponse.body.data)
        return { status: AppClient.status.success, data: refreshResponse.body }
      }
      return { status: AppClient.status.error, data: refreshResponse.body }
    }
    return { status: AppClient.status.httpError, data: refreshResponse }
  }
}
export default AppClient