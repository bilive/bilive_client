"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const options = new Options();
let optionsInfo;
const dDiv = document.querySelector('#ddd');
const loginDiv = document.querySelector('#login');
const optionDiv = document.querySelector('#option');
const configDiv = document.querySelector('#config');
const userDiv = document.querySelector('#user');
const logDiv = document.querySelector('#log');
const returnButton = document.querySelector('#logreturn');
const modalDiv = document.querySelector('.modal');
const template = document.querySelector('#template');
// 3D效果
let firstDiv = loginDiv;
let secondDiv;
const dddArray = ['top', 'bottom', 'left', 'right'];
let dddString;
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function danimation(toDiv) {
    dddString = dddArray[getRandomIntInclusive(0, 3)];
    if (firstDiv === logDiv)
        returnButton.classList.add('d-none');
    secondDiv = toDiv;
    secondDiv.classList.add(`d_${dddString}2`);
    secondDiv.classList.remove('d-none');
    firstDiv.classList.add(`d_${dddString}1`);
    dDiv.className = `ddd_${dddString}`;
}
dDiv.addEventListener('animationend', () => {
    dDiv.className = '';
    firstDiv.classList.remove(`d_${dddString}1`);
    firstDiv.classList.add('d-none');
    secondDiv.classList.remove(`d_${dddString}2`);
    firstDiv = secondDiv;
    if (firstDiv === logDiv)
        returnButton.classList.remove('d-none');
});
/**
 * 显示登录界面
 *
 */
function showLogin() {
    const pathInput = loginDiv.querySelector('#path input');
    const protocolInput = loginDiv.querySelector('#protocol input[type="text"]');
    const connectButton = loginDiv.querySelector('#connect button');
    const connectSpan = loginDiv.querySelector('#connect span');
    if (location.hash !== '') {
        const loginInfo = location.hash.match(/path=(.*)&protocol=(.*)/);
        if (loginInfo !== null) {
            pathInput.value = loginInfo[1];
            protocolInput.value = loginInfo[2];
        }
    }
    connectButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
        const protocols = [protocolInput.value];
        const connected = yield options.connect(pathInput.value, protocols);
        if (connected)
            login();
        else
            connectSpan.innerText = '连接失败';
    });
    loginDiv.classList.remove('d-none');
}
/**
 * 登录成功
 *
 */
function login() {
    return __awaiter(this, void 0, void 0, function* () {
        const infoMSG = yield options.getInfo();
        optionsInfo = infoMSG.data;
        // 处理错误信息
        options.onerror = (event) => {
            modal({ body: event.data });
        };
        options.onwserror = () => wsClose('连接发生错误');
        options.onwsclose = (event) => {
            try {
                const msg = JSON.parse(event.reason);
                wsClose('连接已关闭 ' + msg.msg);
            }
            catch (error) {
                wsClose('连接已关闭');
            }
        };
        danimation(optionDiv);
        yield showConfig();
        yield showUser();
        showLog();
    });
}
/**
 * 加载全局设置
 *
 */
function showConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const saveConfigButton = document.querySelector('#saveConfig');
        const addUserButton = document.querySelector('#addUser');
        const showLogButton = document.querySelector('#showLog');
        const configMSG = yield options.getConfig();
        let config = configMSG.data;
        const configDF = getConfigTemplate(config);
        // 保存全局设置
        saveConfigButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
            modal();
            const configMSG = yield options.setConfig(config);
            if (configMSG.msg != null)
                modal({ body: configMSG.msg });
            else {
                config = configMSG.data;
                const configDF = getConfigTemplate(config);
                configDiv.innerText = '';
                configDiv.appendChild(configDF);
                modal({ body: '保存成功' });
            }
        });
        // 添加新用户
        addUserButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
            modal();
            const userDataMSG = yield options.newUserData();
            const uid = userDataMSG.uid;
            const userData = userDataMSG.data;
            const userDF = getUserDF(uid, userData);
            userDiv.appendChild(userDF);
            modal({ body: '添加成功' });
        });
        // 显示日志
        showLogButton.onclick = () => {
            danimation(logDiv);
        };
        configDiv.appendChild(configDF);
    });
}
/**
 * 加载Log
 *
 */
function showLog() {
    return __awaiter(this, void 0, void 0, function* () {
        const logMSG = yield options.getLog();
        const logs = logMSG.data;
        const logDF = document.createDocumentFragment();
        logs.forEach(log => {
            const div = document.createElement('div');
            div.innerHTML = log.replace(/房间 (\d+) /, '房间 <a href="https://live.bilibili.com/$1" target="_blank" rel="noreferrer">$1</a> ');
            logDF.appendChild(div);
        });
        options.onlog = data => {
            const div = document.createElement('div');
            div.innerHTML = data.replace(/房间 (\d+) /, '房间 <a href="https://live.bilibili.com/$1" target="_blank" rel="noreferrer">$1</a> ');
            logDiv.appendChild(div);
            if (logDiv.scrollHeight - logDiv.clientHeight - logDiv.scrollTop < 2 * div.offsetHeight)
                logDiv.scrollTop = logDiv.scrollHeight;
        };
        returnButton.onclick = () => {
            danimation(optionDiv);
        };
        logDiv.appendChild(logDF);
    });
}
/**
 * 加载用户设置
 *
 */
function showUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const userMSG = yield options.getAllUID();
        const uidArray = userMSG.data;
        const df = document.createDocumentFragment();
        for (const uid of uidArray) {
            const userDataMSG = yield options.getUserData(uid);
            const userData = userDataMSG.data;
            const userDF = getUserDF(uid, userData);
            df.appendChild(userDF);
        }
        userDiv.appendChild(df);
    });
}
/**
 * 新建用户模板
 *
 * @param {string} uid
 * @param {userData} userData
 * @returns {DocumentFragment}
 */
function getUserDF(uid, userData) {
    const userTemplate = template.querySelector('#userTemplate');
    const clone = document.importNode(userTemplate.content, true);
    const userDataDiv = clone.querySelector('.userData');
    const userConfigDiv = clone.querySelector('.userConfig');
    const saveUserButton = clone.querySelector('.saveUser');
    const deleteUserButton = clone.querySelector('.deleteUser');
    const userConfigDF = getConfigTemplate(userData);
    userConfigDiv.appendChild(userConfigDF);
    // 保存用户设置
    let captcha = undefined;
    saveUserButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
        modal();
        const userDataMSG = yield options.setUserData(uid, userData, captcha);
        captcha = undefined;
        if (userDataMSG.msg == null) {
            modal({ body: '保存成功' });
            userData = userDataMSG.data;
            const userConfigDF = getConfigTemplate(userData);
            userConfigDiv.innerText = '';
            userConfigDiv.appendChild(userConfigDF);
        }
        else if (userDataMSG.msg === 'captcha' && userDataMSG.captcha != null) {
            const captchaTemplate = template.querySelector('#captchaTemplate');
            const clone = document.importNode(captchaTemplate.content, true);
            const captchaImg = clone.querySelector('img');
            const captchaInput = clone.querySelector('input');
            captchaImg.src = userDataMSG.captcha;
            modal({
                body: clone,
                showOK: true,
                onOK: () => {
                    captcha = captchaInput.value;
                    saveUserButton.click();
                }
            });
        }
        else
            modal({ body: userDataMSG.msg });
    });
    // 删除用户设置
    deleteUserButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
        modal();
        const userDataMSG = yield options.delUserData(uid);
        if (userDataMSG.msg != null)
            modal({ body: userDataMSG.msg });
        else {
            modal({ body: '删除成功' });
            userDataDiv.remove();
        }
    });
    return clone;
}
/**
 * 设置模板
 *
 * @param {(config | userData)} config
 * @returns {DocumentFragment}
 */
function getConfigTemplate(config) {
    const df = document.createDocumentFragment();
    for (const key in config) {
        const info = optionsInfo[key];
        if (info == null)
            continue;
        const configValue = config[key];
        let configTemplate;
        if (info.type === 'boolean')
            configTemplate = template.querySelector('#configCheckboxTemplate');
        else
            configTemplate = template.querySelector('#configTextTemplate');
        const clone = document.importNode(configTemplate.content, true);
        const descriptionDiv = clone.querySelector('._description');
        const inputInput = clone.querySelector('.form-control');
        const checkboxInput = clone.querySelector('.form-check-input');
        switch (info.type) {
            case 'number':
                inputInput.value = configValue.toString();
                inputInput.oninput = () => config[key] = parseInt(inputInput.value);
                break;
            case 'numberArray':
                inputInput.value = configValue.join(',');
                inputInput.oninput = () => config[key] = inputInput.value.split(',').map(value => parseInt(value));
                break;
            case 'string':
                inputInput.value = configValue;
                inputInput.oninput = () => config[key] = inputInput.value;
                break;
            case 'stringArray':
                inputInput.value = configValue.join(',');
                inputInput.oninput = () => config[key] = inputInput.value.split(',');
                break;
            case 'boolean':
                checkboxInput.checked = configValue;
                checkboxInput.onchange = () => config[key] = checkboxInput.checked;
                break;
            default:
                break;
        }
        descriptionDiv.innerText = info.description;
        descriptionDiv.title = info.tip;
        $(descriptionDiv).tooltip();
        df.appendChild(clone);
    }
    return df;
}
/**
 * 处理连接中断
 *
 * @param {string} data
 */
function wsClose(data) {
    const connectSpan = loginDiv.querySelector('#connect span');
    configDiv.innerText = '';
    logDiv.innerText = '';
    userDiv.innerText = '';
    connectSpan.innerText = data;
    danimation(loginDiv);
}
/**
 * 弹窗提示
 * 无参数时只显示遮罩
 *
 * @param {modalOPtions} [options]
 */
function modal(options) {
    if (options != null) {
        const modalDialogDiv = modalDiv.querySelector('.modal-dialog');
        const modalTemplate = template.querySelector('#modalContentTemplate');
        const clone = document.importNode(modalTemplate.content, true);
        const headerTitle = clone.querySelector('.modal-header .modal-title');
        const headerClose = clone.querySelector('.modal-header .close');
        const modalBody = clone.querySelector('.modal-body');
        const footerClose = clone.querySelector('.modal-footer .btn-secondary');
        const footerOK = clone.querySelector('.modal-footer .btn-primary');
        headerClose.onclick = footerClose.onclick = () => {
            $(modalDiv).one('hidden.bs.modal', () => {
                modalDialogDiv.innerText = '';
                if (typeof options.onClose === 'function')
                    options.onClose(options.body);
            });
            $(modalDiv).modal('hide');
        };
        footerOK.onclick = () => {
            $(modalDiv).one('hidden.bs.modal', () => {
                modalDialogDiv.innerText = '';
                if (typeof options.onOK === 'function')
                    options.onOK(options.body);
            });
            $(modalDiv).modal('hide');
        };
        if (options.body instanceof DocumentFragment)
            modalBody.appendChild(options.body);
        else
            modalBody.innerText = options.body;
        if (options.title != null)
            headerTitle.innerText = options.title;
        if (options.close != null)
            footerClose.innerText = options.close;
        if (options.ok != null)
            footerOK.innerText = options.ok;
        if (options.showOK)
            footerOK.classList.remove('d-none');
        modalDialogDiv.appendChild(clone);
    }
    $(modalDiv).modal({ backdrop: 'static', keyboard: false });
}
showLogin();
