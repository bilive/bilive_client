"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var options = new Options();
var optionsInfo;
var dDiv = document.querySelector('#ddd');
var loginDiv = document.querySelector('#login');
var optionDiv = document.querySelector('#option');
var configDiv = document.querySelector('#config');
var userDiv = document.querySelector('#user');
var logDiv = document.querySelector('#log');
var returnButton = document.querySelector('#logreturn');
var modalDiv = document.querySelector('.modal');
var template = document.querySelector('#template');
// 3D效果
var firstDiv = loginDiv;
var secondDiv;
var dddArray = ['top', 'bottom', 'left', 'right'];
var dddString;
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
    secondDiv.classList.add("d_" + dddString + "2");
    secondDiv.classList.remove('d-none');
    firstDiv.classList.add("d_" + dddString + "1");
    dDiv.className = "ddd_" + dddString;
}
dDiv.addEventListener('animationend', function () {
    dDiv.className = '';
    firstDiv.classList.remove("d_" + dddString + "1");
    firstDiv.classList.add('d-none');
    secondDiv.classList.remove("d_" + dddString + "2");
    firstDiv = secondDiv;
    if (firstDiv === logDiv)
        returnButton.classList.remove('d-none');
});
/**
 * 显示登录界面
 *
 */
function showLogin() {
    var _this = this;
    var pathInput = loginDiv.querySelector('#path input');
    var protocolInput = loginDiv.querySelector('#protocol input[type="text"]');
    var keepInput = loginDiv.querySelector('#protocol input[type="checkbox"]');
    var connectButton = loginDiv.querySelector('#connect button');
    var connectSpan = loginDiv.querySelector('#connect span');
    if (location.hash !== '') {
        var loginInfo = location.hash.match(/path=(.*)&protocol=(.*)/);
        if (loginInfo !== null) {
            pathInput.value = loginInfo[1];
            protocolInput.value = loginInfo[2];
        }
    }
    connectButton.onclick = function () { return __awaiter(_this, void 0, void 0, function () {
        var protocols, connected;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    protocols = [protocolInput.value];
                    if (keepInput.checked)
                        protocols.push('keep');
                    return [4 /*yield*/, options.connect(pathInput.value, protocols)];
                case 1:
                    connected = _a.sent();
                    if (connected)
                        login();
                    else
                        connectSpan.innerText = '连接失败';
                    return [2 /*return*/];
            }
        });
    }); };
    loginDiv.classList.remove('d-none');
}
/**
 * 登录成功
 *
 */
function login() {
    return __awaiter(this, void 0, void 0, function () {
        var infoMSG;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, options.getInfo()];
                case 1:
                    infoMSG = _a.sent();
                    optionsInfo = infoMSG.data;
                    // 处理错误信息
                    options.onerror = function (event) {
                        modal({ body: event.data });
                    };
                    options.onwserror = function () { return wsClose('连接发生错误'); };
                    options.onwsclose = function (event) {
                        try {
                            var msg = JSON.parse(event.reason);
                            wsClose('连接已关闭 ' + msg.msg);
                        }
                        catch (error) {
                            wsClose('连接已关闭');
                        }
                    };
                    danimation(optionDiv);
                    return [4 /*yield*/, showConfig()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, showUser()];
                case 3:
                    _a.sent();
                    showLog();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * 加载全局设置
 *
 */
function showConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var saveConfigButton, addUserButton, showLogButton, configMSG, config, configDF;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    saveConfigButton = document.querySelector('#saveConfig');
                    addUserButton = document.querySelector('#addUser');
                    showLogButton = document.querySelector('#showLog');
                    return [4 /*yield*/, options.getConfig()];
                case 1:
                    configMSG = _a.sent();
                    config = configMSG.data;
                    configDF = getConfigTemplate(config);
                    // 保存全局设置
                    saveConfigButton.onclick = function () { return __awaiter(_this, void 0, void 0, function () {
                        var configMSG, configDF_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    modal();
                                    return [4 /*yield*/, options.setConfig(config)];
                                case 1:
                                    configMSG = _a.sent();
                                    if (configMSG.msg != null)
                                        modal({ body: configMSG.msg });
                                    else {
                                        config = configMSG.data;
                                        configDF_1 = getConfigTemplate(config);
                                        configDiv.innerText = '';
                                        configDiv.appendChild(configDF_1);
                                        modal({ body: '保存成功' });
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    // 添加新用户
                    addUserButton.onclick = function () { return __awaiter(_this, void 0, void 0, function () {
                        var userDataMSG, uid, userData, userDF;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    modal();
                                    return [4 /*yield*/, options.newUserData()];
                                case 1:
                                    userDataMSG = _a.sent();
                                    uid = userDataMSG.uid;
                                    userData = userDataMSG.data;
                                    userDF = getUserDF(uid, userData);
                                    userDiv.appendChild(userDF);
                                    modal({ body: '添加成功' });
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    // 显示日志
                    showLogButton.onclick = function () {
                        danimation(logDiv);
                    };
                    configDiv.appendChild(configDF);
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * 加载Log
 *
 */
function showLog() {
    return __awaiter(this, void 0, void 0, function () {
        var logMSG, logs, logDF;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, options.getLog()];
                case 1:
                    logMSG = _a.sent();
                    logs = logMSG.data;
                    logDF = document.createDocumentFragment();
                    logs.forEach(function (log) {
                        var div = document.createElement('div');
                        div.innerHTML = log.replace(/房间 (\d+) /, '房间 <a href="https://live.bilibili.com/$1" target="_blank" rel="noreferrer">$1</a> ');
                        logDF.appendChild(div);
                    });
                    options.onlog = function (data) {
                        var div = document.createElement('div');
                        div.innerHTML = data.replace(/房间 (\d+) /, '房间 <a href="https://live.bilibili.com/$1" target="_blank" rel="noreferrer">$1</a> ');
                        logDiv.appendChild(div);
                        if (logDiv.scrollHeight - logDiv.clientHeight - logDiv.scrollTop < 2 * div.offsetHeight)
                            logDiv.scrollTop = logDiv.scrollHeight;
                    };
                    returnButton.onclick = function () {
                        danimation(optionDiv);
                    };
                    logDiv.appendChild(logDF);
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * 加载用户设置
 *
 */
function showUser() {
    return __awaiter(this, void 0, void 0, function () {
        var userMSG, uidArray, df, _i, uidArray_1, uid, userDataMSG, userData, userDF;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, options.getAllUID()];
                case 1:
                    userMSG = _a.sent();
                    uidArray = userMSG.data;
                    df = document.createDocumentFragment();
                    _i = 0, uidArray_1 = uidArray;
                    _a.label = 2;
                case 2:
                    if (!(_i < uidArray_1.length)) return [3 /*break*/, 5];
                    uid = uidArray_1[_i];
                    return [4 /*yield*/, options.getUserData(uid)];
                case 3:
                    userDataMSG = _a.sent();
                    userData = userDataMSG.data;
                    userDF = getUserDF(uid, userData);
                    df.appendChild(userDF);
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    userDiv.appendChild(df);
                    return [2 /*return*/];
            }
        });
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
    var _this = this;
    var userTemplate = template.querySelector('#userTemplate');
    var clone = document.importNode(userTemplate.content, true);
    var userDataDiv = clone.querySelector('.userData');
    var userConfigDiv = clone.querySelector('.userConfig');
    var saveUserButton = clone.querySelector('.saveUser');
    var deleteUserButton = clone.querySelector('.deleteUser');
    var userConfigDF = getConfigTemplate(userData);
    userConfigDiv.appendChild(userConfigDF);
    // 保存用户设置
    var captcha = undefined;
    saveUserButton.onclick = function () { return __awaiter(_this, void 0, void 0, function () {
        var userDataMSG, userConfigDF_1, captchaTemplate, clone_1, captchaImg, captchaInput_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    modal();
                    return [4 /*yield*/, options.setUserData(uid, userData, captcha)];
                case 1:
                    userDataMSG = _a.sent();
                    captcha = undefined;
                    if (userDataMSG.msg == null) {
                        modal({ body: '保存成功' });
                        userData = userDataMSG.data;
                        userConfigDF_1 = getConfigTemplate(userData);
                        userConfigDiv.innerText = '';
                        userConfigDiv.appendChild(userConfigDF_1);
                    }
                    else if (userDataMSG.msg === 'captcha' && userDataMSG.captcha != null) {
                        captchaTemplate = template.querySelector('#captchaTemplate');
                        clone_1 = document.importNode(captchaTemplate.content, true);
                        captchaImg = clone_1.querySelector('img');
                        captchaInput_1 = clone_1.querySelector('input');
                        captchaImg.src = userDataMSG.captcha;
                        modal({
                            body: clone_1,
                            showOK: true,
                            onOK: function () {
                                captcha = captchaInput_1.value;
                                saveUserButton.click();
                            }
                        });
                    }
                    else
                        modal({ body: userDataMSG.msg });
                    return [2 /*return*/];
            }
        });
    }); };
    // 删除用户设置
    deleteUserButton.onclick = function () { return __awaiter(_this, void 0, void 0, function () {
        var userDataMSG;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    modal();
                    return [4 /*yield*/, options.delUserData(uid)];
                case 1:
                    userDataMSG = _a.sent();
                    if (userDataMSG.msg != null)
                        modal({ body: userDataMSG.msg });
                    else {
                        modal({ body: '删除成功' });
                        userDataDiv.remove();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return clone;
}
/**
 * 设置模板
 *
 * @param {(config | userData)} config
 * @returns {DocumentFragment}
 */
function getConfigTemplate(config) {
    var df = document.createDocumentFragment();
    var _loop_1 = function (key) {
        var info = optionsInfo[key];
        if (info == null)
            return "continue";
        var configValue = config[key];
        var configTemplate = void 0;
        if (info.type === 'boolean')
            configTemplate = template.querySelector('#configCheckboxTemplate');
        else
            configTemplate = template.querySelector('#configTextTemplate');
        var clone = document.importNode(configTemplate.content, true);
        var descriptionDiv = clone.querySelector('._description');
        var inputInput = clone.querySelector('.form-control');
        var checkboxInput = clone.querySelector('.form-check-input');
        switch (info.type) {
            case 'number':
                inputInput.value = configValue.toString();
                inputInput.oninput = function () { return config[key] = parseInt(inputInput.value); };
                break;
            case 'numberArray':
                inputInput.value = configValue.join(',');
                inputInput.oninput = function () { return config[key] = inputInput.value.split(',').map(function (value) { return parseInt(value); }); };
                break;
            case 'string':
                inputInput.value = configValue;
                inputInput.oninput = function () { return config[key] = inputInput.value; };
                break;
            case 'boolean':
                checkboxInput.checked = configValue;
                checkboxInput.onchange = function () { return config[key] = checkboxInput.checked; };
                break;
            default:
                break;
        }
        descriptionDiv.innerText = info.description;
        descriptionDiv.title = info.tip;
        $(descriptionDiv).tooltip();
        df.appendChild(clone);
    };
    for (var key in config) {
        _loop_1(key);
    }
    return df;
}
/**
 * 处理连接中断
 *
 * @param {string} data
 */
function wsClose(data) {
    var connectSpan = loginDiv.querySelector('#connect span');
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
        var modalDialogDiv_1 = modalDiv.querySelector('.modal-dialog');
        var modalTemplate = template.querySelector('#modalContentTemplate');
        var clone = document.importNode(modalTemplate.content, true);
        var headerTitle = clone.querySelector('.modal-header .modal-title');
        var headerClose = clone.querySelector('.modal-header .close');
        var modalBody = clone.querySelector('.modal-body');
        var footerClose = clone.querySelector('.modal-footer .btn-secondary');
        var footerOK = clone.querySelector('.modal-footer .btn-primary');
        headerClose.onclick = footerClose.onclick = function () {
            $(modalDiv).one('hidden.bs.modal', function () {
                modalDialogDiv_1.innerText = '';
                if (typeof options.onClose === 'function')
                    options.onClose(options.body);
            });
            $(modalDiv).modal('hide');
        };
        footerOK.onclick = function () {
            $(modalDiv).one('hidden.bs.modal', function () {
                modalDialogDiv_1.innerText = '';
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
        modalDialogDiv_1.appendChild(clone);
    }
    $(modalDiv).modal({ backdrop: 'static', keyboard: false });
}
showLogin();
