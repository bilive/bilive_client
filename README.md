[![Paypal.me donate](https://img.shields.io/badge/Paypal.me-donate-yellow.svg)](https://www.paypal.me/lzppzr)

### 使用releases
* 通用
  * 第一次使用
    1. 安装[Node.js](https://nodejs.org/)
    2. 下载[bilive_client.zip](https://github.com/lzghzr/bilive_client/releases/latest)
    3. 解压并定位到目录
    4. 命令行 `npm install`
    5. 命令行 `npm start`
  * 版本更新
    1. 下载[bilive_client.zip](https://github.com/lzghzr/bilive_client/releases/latest)
    2. 解压并覆盖原目录
    3. 命令行 `npm install`
    4. 命令行 `npm start`
* Windows 64位系统
  * 第一次使用
    1. 下载[bilive_client_win64.zip](https://github.com/lzghzr/bilive_client/releases/latest)
    2. 解压并打开文件夹
    3. 双击cmd文件
  * 版本更新
    1. 下载[bilive_client_win64.zip](https://github.com/lzghzr/bilive_client/releases/latest)
    2. 解压并打开文件夹
    3. 复制原options文件夹到此文件夹
    4. 双击cmd文件

### Docker
  * 可避免执行环境问题
    1. 安装[Git](https://git-scm.com/downloads) `// 务必添加到环境变量, 不然建立Docker镜像时候报错`
    2. 安装[Docker](https://docs.docker-cn.com/engine/installation/)
    3. 建立Docker镜像 `docker build https://github.com/lzghzr/bilive_client.git -t bilive_client`
    4. 启动容器 `docker run -itd -p 10080:10080 bilive_client`

### 自行编译
  * 第一次使用
    1. 安装[Git](https://git-scm.com/downloads)
    2. 安装[Node.js](https://nodejs.org/)
    3. 命令行 `git clone https://github.com/lzghzr/bilive_client.git`
    4. 命令行 `cd bilive_client`
    5. 命令行 `npm install`
    6. 命令行 `npm run build`
    7. 命令行 `npm start`
  * 版本更新
    1. 定位到目录
    2. 命令行 `git pull`
    3. 命令行 `npm install`
    4. 命令行 `npm run build`
    5. 命令行 `npm start`

[点此进行设置](http://github.halaal.win/bilive_client/#path=ws://localhost:10080&protocol=admin)

值得推荐的分支
* [Vector000/bilive_client](https://github.com/Vector000/bilive_client)

此为客户端, 更多功能需配合服务端使用
[服务端](https://github.com/lzghzr/bilive_server)

```TypeScript
const 支付宝红包码 = `
█▀▀▀▀▀█ ▄▄█  ▄▀█  ▀▀▄ █▀▀▀▀▀█
█ ███ █ ▀▄  ▄ ▄  ▀▄▀▀ █ ███ █
█ ▀▀▀ █ █▀█ █▄███  ▄▀ █ ▀▀▀ █
▀▀▀▀▀▀▀ █ █▄▀ █▄▀▄▀ █ ▀▀▀▀▀▀▀
██▄▀▄▄▀▀▄▄ ████   ▄▀▄▄█▀▀▄▀▀▄
▀▄▄ ▄▄▀▀▀▄▄████   ▀▀ █▀▀▀▀██ 
▄▄▄█ ▄▀  ▄▀█ ▀▄ ▀█████▀  ▀ ▀▀
█▀▄▄▄█▀ ▄▀ █ ▄█ ▀█▀ ▀  ▀▄█▀█▀
▀███▀▀▀▀▄ ▀ █  ▀█▀█▀▀▀▄  ▄ ▀▄
▀   █▀▀▀▄▀▀▀█ █  █ ▄█▄█▄   ██
▀  ▀▀ ▀▀▄▄█▄▀▀▀▀█ ███▀▀▀█ █▄▄
█▀▀▀▀▀█ ▀▀▄  █▀▄▀ ▀▄█ ▀ █▄▄▀ 
█ ███ █ ▄▀▄▀ █ ▀▄██▄▀▀█▀█▄▄█ 
█ ▀▀▀ █ ▄▀ ▀██▄▄ ██ █▄  ▀▀▀▄▀
▀▀▀▀▀▀▀ ▀ ▀ ▀   ▀▀▀ ▀▀  ▀  ▀ `
const 支付宝付款码 = `
█▀▀▀▀▀█  ▄▀  ▀▀█ ▄▄█▄ █▀▀▀▀▀█
█ ███ █ ▀▄ ▀▄ ▄▀  █▀  █ ███ █
█ ▀▀▀ █  ▀▄▄██ █▄  ██ █ ▀▀▀ █
▀▀▀▀▀▀▀ █ ▀▄▀▄█ ▀▄█▄█ ▀▀▀▀▀▀▀
▀█▀▄▀█▀▀█▄ ▄██▄  ▀▄▀███  ▄▀ ▄
 ▄▄▄▄█▀█▄▄█▀███  ▄▀ ▄█ █▀ ▀█▀
█▀▀▀▀ ▀▄█ ██ █   ██▀███  █ ▀█
█▀▄▄█▄▀  ██▄ ██ ▀▄▀     ▄█ █▀
 █▄ █▄▀█▄▄▀▄██▄ ▄██ █▀█▄ █▄▀█
▀▄  ▀▀▀▄▀█ ▀█▄▄ █▄  █▄▀▄ ▄ █▀
▀  ▀▀▀▀▀█ ▄█▀▀   ████▀▀▀█ ▄▄▄
█▀▀▀▀▀█ █▀  ███▄▄█▀██ ▀ ██ ▀▀
█ ███ █ ▀█▀  █ ▀█▀█ ▀▀▀▀█ ▄█▄
█ ▀▀▀ █ ██▀▄▀█▄▄█▄█ ▄▄ ▀▀▀ ▄▀
▀▀▀▀▀▀▀ ▀ ▀  ▀▀  ▀▀▀▀▀▀ ▀▀ ▀▀`
const 微信收钱码 = `
█▀▀▀▀▀█ ███ ▀▄▀ █▀█▄  █▀▀▀▀▀█
█ ███ █ █▄▀█  █▄ ▀▄██ █ ███ █
█ ▀▀▀ █ ▄  ▄▄ ▄▀█▄ █  █ ▀▀▀ █
▀▀▀▀▀▀▀ ▀▄▀ █ ▀ ▀▄█▄█ ▀▀▀▀▀▀▀
▀▀ ▄▀▀▀▄ ▄▄▀▄█▄▀█▀ ▄   █▄█▀██
█▀█  █▀▄▄ ▄█▀▀▄█ ▄▀▄█ ▀▀▀ ▀██
 ▀▄ ▄▄▀ █ ▀ ▀█ █ █▀█ █ █▄▀ ▄▄
▄█▄▀▀ ▀█▄█▄ ▄ ██▀█  ██▄▄ ▀▀▄█
█▀█▀█▄▀▀▄▄█▀▄▄▄▀▄   ▀▀▄▀▄▀ ▄█
  ▀▄▄▀▀█▄▄▀█▀▀ ▀▀█▀ ▄█▄█ █▀ ▀
▀▀▀ ▀ ▀▀▄▀█ ▀ ▄▄▄▀▀██▀▀▀█▀▄█▄
█▀▀▀▀▀█ ▄██ ▄▀▀▀ █▄▄█ ▀ █ ▀▄▀
█ ███ █ ▀██▀▄▀██▄▄▄▀▀█▀█▀▄▄ █
█ ▀▀▀ █ ▄▄▄█▀█▀▀██▄▀██▀█▄▄▀██
▀▀▀▀▀▀▀ ▀   ▀▀  ▀▀  ▀▀▀▀▀▀ ▀ `
```