"use strict";
class Options {
    constructor() {
        this.__callback = {};
        this.__crypto = false;
        window.onunload = () => { options.close(); };
    }
    get _ts() {
        const bufArray = window.crypto.getRandomValues(new Uint32Array(5));
        let random = '';
        bufArray.forEach(value => { random += value.toString(16); });
        return random.slice(0, 32);
    }
    connect(path, protocols) {
        return new Promise(resolve => {
            try {
                const ws = new WebSocket(path, protocols);
                const removeEvent = () => {
                    this.__crypto = false;
                    delete ws.onopen;
                    delete ws.onerror;
                };
                ws.onopen = async () => {
                    removeEvent();
                    this._ws = ws;
                    this._init();
                    if (window.crypto.subtle !== undefined) {
                        const clientKey = await window.crypto.subtle.generateKey({
                            name: 'ECDH',
                            namedCurve: 'P-521'
                        }, false, ['deriveKey', 'deriveBits']);
                        const clientPublicKeyExported = await window.crypto.subtle.exportKey('raw', clientKey.publicKey);
                        const clientPublicKeyHex = ECDH.buf2hex(new Uint8Array(clientPublicKeyExported));
                        const type = 'ECDH-AES-256-GCM';
                        const server = await this._send({ cmd: 'hello', msg: type, data: clientPublicKeyHex });
                        if (server.msg === type) {
                            const serverPublicKeyHex = server.data;
                            const serverPublicKey = ECDH.hex2buf(serverPublicKeyHex);
                            const serverKeyImported = await window.crypto.subtle.importKey('raw', serverPublicKey, {
                                name: 'ECDH',
                                namedCurve: 'P-521'
                            }, false, []);
                            const sharedSecret = await window.crypto.subtle.deriveKey({
                                name: 'ECDH',
                                public: serverKeyImported
                            }, clientKey.privateKey, {
                                name: 'AES-GCM',
                                length: 256
                            }, false, ['encrypt', 'decrypt']);
                            this.__crypto = true;
                            this.__algorithm = type;
                            this.__sharedSecret = sharedSecret;
                        }
                    }
                    else {
                        const clientKey = ECDH.createECDH('secp521r1');
                        clientKey.generateKeys();
                        const clientPublicKeyHex = clientKey.getPublicKey();
                        const type = 'ECDH-AES-256-CBC';
                        const server = await this._send({ cmd: 'hello', msg: type, data: clientPublicKeyHex });
                        if (server.msg === type) {
                            const serverPublicKeyHex = server.data;
                            const sharedSecretHex = clientKey.computeSecret(serverPublicKeyHex).slice(0, 64);
                            this.__crypto = true;
                            this.__algorithm = type;
                            this.__sharedSecretHex = CryptoJS.enc.Hex.parse(sharedSecretHex);
                        }
                    }
                    resolve(true);
                };
                ws.onerror = error => {
                    removeEvent();
                    console.error(error);
                    resolve(false);
                };
            }
            catch (error) {
                console.error(error);
                resolve(false);
            }
        });
    }
    _init() {
        this._ws.onerror = data => {
            this.close();
            if (typeof this.onwserror === 'function')
                this.onwserror(data);
            else
                console.error(data);
        };
        this._ws.onclose = data => {
            this.close();
            if (typeof this.onwsclose === 'function')
                this.onwsclose(data);
            else
                console.error(data);
        };
        this._ws.onmessage = async (data) => {
            const Data = data.data;
            let message;
            if (typeof Data === 'string')
                message = JSON.parse(Data);
            else {
                const msg = new Blob([Data]);
                if (this.__crypto) {
                    switch (this.__algorithm) {
                        case 'ECDH-AES-256-GCM':
                            {
                                const aesdata = new Uint8Array(await msg.arrayBuffer());
                                const iv = aesdata.slice(0, 12);
                                const encrypted = aesdata.slice(12);
                                const decrypted = await window.crypto.subtle.decrypt({
                                    name: "AES-GCM",
                                    iv: iv
                                }, this.__sharedSecret, encrypted);
                                const decoder = new Blob([decrypted]);
                                const decoded = await decoder.text();
                                message = JSON.parse(decoded);
                            }
                            break;
                        case 'ECDH-AES-256-CBC':
                            {
                                const aesdata = new Uint8Array(await msg.arrayBuffer());
                                const ivHex = CryptoJS.enc.Hex.parse(ECDH.buf2hex(aesdata.slice(0, 16)));
                                const encryptedHex = CryptoJS.enc.Hex.parse(ECDH.buf2hex(aesdata.slice(16)));
                                const encryptedBase64 = CryptoJS.enc.Base64.stringify(encryptedHex);
                                const decrypted = CryptoJS.AES.decrypt(encryptedBase64, this.__sharedSecretHex, {
                                    iv: ivHex
                                });
                                const decoded = decrypted.toString(CryptoJS.enc.Utf8);
                                message = JSON.parse(decoded);
                            }
                            break;
                        default:
                            message = { cmd: 'log', ts: 'log', msg: '未知加密格式' };
                            break;
                    }
                }
                else
                    message = JSON.parse(await msg.text());
            }
            const ts = message.ts;
            if (ts != null && typeof this.__callback[ts] === 'function') {
                delete message.ts;
                this.__callback[ts](message);
                delete this.__callback[ts];
            }
            else if (message.cmd === 'log' && typeof this.onlog === 'function')
                this.onlog(message.msg);
            else if (typeof this.onerror === 'function')
                this.onerror(data);
            else
                console.error(data);
        };
    }
    _send(message) {
        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject('timeout');
            }, 30 * 1000);
            const ts = this._ts;
            message.ts = ts;
            this.__callback[ts] = (msg) => {
                clearTimeout(timeout);
                resolve(msg);
            };
            const msg = JSON.stringify(message);
            if (this._ws.readyState === WebSocket.OPEN) {
                if (this.__crypto) {
                    switch (this.__algorithm) {
                        case 'ECDH-AES-256-GCM':
                            {
                                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                                const encoder = new Blob([msg]);
                                const encoded = await encoder.arrayBuffer();
                                const encrypted = await window.crypto.subtle.encrypt({
                                    name: "AES-GCM",
                                    iv: iv
                                }, this.__sharedSecret, encoded);
                                const aesdata = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
                                this._ws.send(aesdata);
                            }
                            break;
                        case 'ECDH-AES-256-CBC':
                            {
                                const ivHex = CryptoJS.enc.Hex.parse(ECDH.randomBytes(16));
                                const encrypted = CryptoJS.AES.encrypt(msg, this.__sharedSecretHex, {
                                    iv: ivHex
                                });
                                const aesdataHex = ivHex + encrypted.ciphertext;
                                const aesdata = ECDH.hex2buf(aesdataHex);
                                this._ws.send(aesdata);
                            }
                            break;
                        default:
                            break;
                    }
                }
                else
                    this._ws.send(msg);
            }
            else
                reject('closed');
        });
    }
    close() {
        this._ws.close();
        this.__callback = {};
    }
    getLog() {
        const message = { cmd: 'getLog' };
        return this._send(message);
    }
    getConfig() {
        const message = { cmd: 'getConfig' };
        return this._send(message);
    }
    setConfig(data) {
        const message = { cmd: 'setConfig', data };
        return this._send(message);
    }
    getInfo() {
        const message = { cmd: 'getInfo' };
        return this._send(message);
    }
    getAllUID() {
        const message = { cmd: 'getAllUID' };
        return this._send(message);
    }
    getUserData(uid) {
        const message = { cmd: 'getUserData', uid };
        return this._send(message);
    }
    setUserData(uid, data, validate, validatecode, authcode) {
        const message = { cmd: 'setUserData', uid, data };
        if (validate !== undefined)
            message.validate = validate;
        else if (validatecode !== undefined)
            message.validatecode = validatecode;
        else if (authcode !== undefined)
            message.authcode = authcode;
        return this._send(message);
    }
    delUserData(uid) {
        const message = { cmd: 'delUserData', uid };
        return this._send(message);
    }
    newUserData() {
        const message = { cmd: 'newUserData' };
        return this._send(message);
    }
}
