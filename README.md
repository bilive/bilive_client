[![Paypal.me donate](https://img.shields.io/badge/Paypal.me-donate-yellow.svg)](https://www.paypal.me/lzppzr)

### 使用releases
* 通用
    1. 安装[Node.js](https://nodejs.org/)
    2. 下载[bilive_client.zip](https://github.com/lzghzr/bilive_client/releases/latest)
    3. 解压并定位到目录
    4. 命令行 npm install
    5. 命令行 npm start
* Windows 64位系统
    1. 下载[bilive_client_win64.zip](https://github.com/lzghzr/bilive_client/releases/latest)
    2. 解压并打开文件夹
    3. 双击cmd文件

### 自行编译
1. 安装[git](https://git-scm.com/downloads)
2. 安装[Node.js](https://nodejs.org/)
3. 命令行 git clone https://github.com/lzghzr/bilive_client.git
4. 命令行 cd bilive_client
5. 命令行 npm install
6. 命令行 npm run build
7. 命令行 npm start

[点此进行设置](http://lzghzr.github.io/bilive_client_view/index.html)\
[国内设置地址](http://lzoczr.gitee.io/bilive_client_view/index.html)
```TypeScript
const 支付宝红包码 = `
█▀▀▀▀▀█ ▄▄█   ▄█  ▀▀▄ █▀▀▀▀▀█
█ ███ █ ▀▄  ▄ █  ▀▄▀▀ █ ███ █
█ ▀▀▀ █ █▀█ █▀ ██  ▄▀ █ ▀▀▀ █
▀▀▀▀▀▀▀ █ █▄▀ ▀▄█▄▀ █ ▀▀▀▀▀▀▀
██ ▀  ▀▀▄▄ ███▀ ▄ ▄▀▄▄█▀▀▄▀▀▄
 ▀█ ▄▄▀▀▀▄▄███▄   ▀▀ █▀▀▀▀██ 
█▀▄█▄█▀  ▄▀█ ▀▄▀ █████▀  ▀ ▀▀
▄▀ ▄█ ▀▀ ▄ █ ▄   █▀ ▀  ▀▄█▀█▀
▀▀▄▀██▀▀▀█▀ █ ▄ ▄██▀▀▀▄  ▄ ▀▄
▀ █ ▄█▀▄▄▄▄▀█ █▄▄▄█▄█▄█▄   ██
▀ ▀   ▀ ▄  ▄▀▀█▀▄▄███▀▀▀█ █▄▄
█▀▀▀▀▀█ ▀█▀ ▄▄█▄▀ ▀▄█ ▀ █▄▄▀ 
█ ███ █ ▄▄▀  ▀█ ▄▀█▄▀▀█▀█▄▄█ 
█ ▀▀▀ █ ▄▄█▀▄▄▄▄▀██ █▄  ▀▀▀▄▀
▀▀▀▀▀▀▀ ▀▀    ▀ ▀▀▀ ▀▀  ▀  ▀ `
const 支付宝付款码 = `
█▀▀▀▀▀█ ▀▀▀█▄ ▀  ▀ ▄  █▀▀▀▀▀█
█ ███ █  ▀▄█ █▀▄▀▄▀▄█ █ ███ █
█ ▀▀▀ █  ▄▀█▀█  ▀▀▄▀█ █ ▀▀▀ █
▀▀▀▀▀▀▀ █▄▀ █▄█▄█ ▀▄▀ ▀▀▀▀▀▀▀
██ ▀▀ ▀ ▄▀▄ ▀ ▀█ █ ▄  ▀▄▄ ▄▄▀
 ▄  ▄▀▀▄▄▀  ▀▀█▀███▄▄ █▄█▄▀ ▄
█ ▀▄▀▀▀▀█▀█ ▄▄▄██ ▀ ▀ ██▄▄▄▄█
█  ▀ ▄▀ ██▄ ▄  █▄ ████▄▄  █ █
█ ▄█▀▄▀█▀▀▄█▀▀ █ ▄▀▄█▄ █▄▀▄▄ 
███ █ ▀ ▄▄█▄▀█▄▀▄▀▀▀▀▀▀▀▄█▄ ▀
▀▀ ▀ ▀▀▀█▄ ▀█▄██ ▀▀ █▀▀▀██▀▀ 
█▀▀▀▀▀█   ▄█▄▀▄█▄▄▄▀█ ▀ █▀ ▄▄
█ ███ █ █▄ █▄ ▄▄█ ▀▀██▀█▀▀  ▄
█ ▀▀▀ █ ▄▀▄▄▄ ██▄▀ █▀▀▄██▄█▀█
▀▀▀▀▀▀▀ ▀  ▀▀▀ ▀▀ ▀▀▀  ▀▀▀   `
```

因为B站对弹幕服务器进行了限制, 一般方法已无法监听到节奏相关内容\
所以之前提供的监听服务器已经关闭, 并且开源, 有兴趣的可以自己研究\
[服务端](https://github.com/lzghzr/bilive_server)
