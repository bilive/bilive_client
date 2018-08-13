# bilive_client

此分支是一个次分支，特别感谢主分支所有参与者的基础奠定

## 使用releases
不存在的，不存在的，永远也不会发release的

## 自行编译
1. 安装[git](https://git-scm.com/downloads)
2. 安装[Node.js](https://nodejs.org/)
3. `git clone https://github.com/Vector000/bilive_client.git` (第一次使用先clone，或直接使用GitHub的Download ZIP)
4. `cd bilive_client`
5. `git pull` (获取项目更新)
6. `npm install`
7. `npm run build`
8. `npm start`

[点此进行设置](http://github.halaal.win/bilive_client/)\
[国内设置地址](http://lzoczr.gitee.io/bilive_client_view/)
可使用/doc/index.html进行本地设置，推荐

## 增添功能
* 整点查询挂机用户个人/勋章信息（默认开启，可自定义）
* 领取总督开通奖励
* 根据亲密度赠送礼物
* ~~硬币兑换银瓜子~~ （已删除，目测破站已经关闭此接口）
* 添加entry_action以部分规避封禁
* 利用entry_action回显来部分规避钓鱼房间（加密房间）
* 多分区监听，每个分区默认监听3个房间以减少漏抽
* 定时查询用户礼物包裹，便于管理
* 检测到用户被封禁后发送MSG通知

## 吐槽
* 这破站什么鬼啊封号封这个不封那个，气
