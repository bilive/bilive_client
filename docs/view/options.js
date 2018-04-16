"use strict";
/**
 * 与服务器进行通信并返回结果
 *
 * @class Options
 */
var Options = /** @class */ (function () {
    function Options() {
        /**
         * 回调函数
         *
         * @private
         * @memberof Options
         */
        this.__callback = {};
        // 关闭窗口时断开连接
        window.onunload = function () { options.close(); };
    }
    Object.defineProperty(Options.prototype, "_ts", {
        /**
         * 随机16进制数
         *
         * @readonly
         * @protected
         * @type {string}
         * @memberof Options
         */
        get: function () {
            var bufArray = window.crypto.getRandomValues(new Uint32Array(5));
            var random = '';
            bufArray.forEach(function (value) { random += value.toString(16); });
            return random.slice(0, 32);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 连接到服务器
     *
     * @param {string} path
     * @param {string[]} protocols
     * @returns {Promise<boolean>}
     * @memberof Options
     */
    Options.prototype.connect = function (path, protocols) {
        var _this = this;
        return new Promise(function (resolve) {
            try {
                var ws_1 = new WebSocket(path, protocols);
                var removeEvent_1 = function () {
                    delete ws_1.onopen;
                    delete ws_1.onerror;
                };
                ws_1.onopen = function () {
                    removeEvent_1();
                    _this._ws = ws_1;
                    _this._init();
                    resolve(true);
                };
                ws_1.onerror = function (error) {
                    removeEvent_1();
                    console.error(error);
                    resolve(false);
                };
            }
            catch (error) {
                console.error(error);
                resolve(false);
            }
        });
    };
    /**
     * 添加各种EventListener
     *
     * @protected
     * @memberof Options
     */
    Options.prototype._init = function () {
        var _this = this;
        this._ws.onerror = function (data) {
            _this.close();
            if (typeof _this.onwserror === 'function')
                _this.onwserror(data);
            else
                console.error(data);
        };
        this._ws.onclose = function (data) {
            _this.close();
            if (typeof _this.onwsclose === 'function')
                _this.onwsclose(data);
            else
                console.error(data);
        };
        this._ws.onmessage = function (data) {
            var message = JSON.parse(data.data);
            var ts = message.ts;
            if (ts != null && typeof _this.__callback[ts] === 'function') {
                delete message.ts;
                _this.__callback[ts](message);
                delete _this.__callback[ts];
            }
            else if (message.cmd === 'log' && typeof _this.onlog === 'function')
                _this.onlog(message.msg);
            else if (typeof _this.onerror === 'function')
                _this.onerror(data);
            else
                console.error(data);
        };
    };
    /**
     * 向服务器发送消息
     *
     * @protected
     * @template T
     * @param {message} message
     * @returns {Promise<T>}
     * @memberof Options
     */
    Options.prototype._send = function (message) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var timeout = setTimeout(function () {
                reject('timeout');
            }, 30 * 1000); // 30秒
            var ts = _this._ts;
            message.ts = ts;
            _this.__callback[ts] = function (msg) {
                clearTimeout(timeout);
                resolve(msg);
            };
            var msg = JSON.stringify(message);
            if (_this._ws.readyState === WebSocket.OPEN)
                _this._ws.send(msg);
            else
                reject('closed');
        });
    };
    /**
     * 关闭连接
     *
     * @memberof Options
     */
    Options.prototype.close = function () {
        this._ws.close();
        this.__callback = {};
    };
    /**
     * 获取Log
     *
     * @returns {Promise<logMSG>}
     * @memberof Options
     */
    Options.prototype.getLog = function () {
        var message = { cmd: 'getLog' };
        return this._send(message);
    };
    /**
     * 获取设置
     *
     * @returns {Promise<configMSG>}
     * @memberof Options
     */
    Options.prototype.getConfig = function () {
        var message = { cmd: 'getConfig' };
        return this._send(message);
    };
    /**
     * 保存设置
     *
     * @param {config} data
     * @returns {Promise<configMSG>}
     * @memberof Options
     */
    Options.prototype.setConfig = function (data) {
        var message = { cmd: 'setConfig', data: data };
        return this._send(message);
    };
    /**
     * 获取设置描述
     *
     * @returns {Promise<infoMSG>}
     * @memberof Options
     */
    Options.prototype.getInfo = function () {
        var message = { cmd: 'getInfo' };
        return this._send(message);
    };
    /**
     * 获取uid
     *
     * @returns {Promise<userMSG>}
     * @memberof Options
     */
    Options.prototype.getAllUID = function () {
        var message = { cmd: 'getAllUID' };
        return this._send(message);
    };
    /**
     * 获取用户设置
     *
     * @param {string} uid
     * @returns {Promise<userDataMSG>}
     * @memberof Options
     */
    Options.prototype.getUserData = function (uid) {
        var message = { cmd: 'getUserData', uid: uid };
        return this._send(message);
    };
    /**
     * 保存用户设置
     *
     * @param {string} uid
     * @param {userData} data
     * @param {string} [captcha]
     * @returns {Promise<userDataMSG>}
     * @memberof Options
     */
    Options.prototype.setUserData = function (uid, data, captcha) {
        var message = { cmd: 'setUserData', uid: uid, data: data, captcha: captcha };
        if (captcha != null)
            message.captcha = captcha;
        return this._send(message);
    };
    /**
     * 删除用户
     *
     * @param {string} uid
     * @returns {Promise<userDataMSG>}
     * @memberof Options
     */
    Options.prototype.delUserData = function (uid) {
        var message = { cmd: 'delUserData', uid: uid };
        return this._send(message);
    };
    /**
     * 设置新用户
     *
     * @returns {Promise<userDataMSG>}
     * @memberof Options
     */
    Options.prototype.newUserData = function () {
        var message = { cmd: 'newUserData' };
        return this._send(message);
    };
    return Options;
}());
