const wsServer = require('ws').Server
const createServer = require('net').createServer

const msg = Buffer.from('{"info":[[0,1,25,16777215,0,0,0,"0",0],"test",[1,"test",0,0,0,10000,1,""],[],[60,0,3e+9,1],[],0,0,{"uname_color":""}],"cmd":"DANMU_MSG"}')
const beatStorm = Buffer.from('{"cmd":"SPECIAL_GIFT","data":{"39":{"id":124500,"time":90,"hadJoin":0,"num":1,"content":"打卡","action":"start"}}}')
const TVstart = Buffer.from('{"cmd":"TV_START","data":{"id":124500,"dtime":180,"msg":"","raffleId":124500,"type":"small_tv","from":"test","time":180}}')
const raffleStart = Buffer.from('{"cmd":"RAFFLE_START","data":{"raffleId":12450,"type":"newspring","from":"test","time":60}}')
const eventCMD = Buffer.from('{"cmd":"EVENT_CMD","data":{"event_type":"newspring-12450","event_img":"http://s1.hdslb.com/bfs/static/blive/live-assets/mobile/activity/newspring_2018/raffle.png"}}')

const full = (data) => {
  const leng = data.length + 16
  const head = Buffer.allocUnsafe(16)
  head.writeInt32BE(leng, 0)
  head.writeInt16BE(16, 4)
  head.writeInt16BE(1, 6)
  head.writeInt32BE(5, 8)
  head.writeInt32BE(1, 12)
  return Buffer.concat([head, data], leng)
}
new wsServer({ host: '0.0.0.0', port: 2244 }, console.log('wsServer bound'))
  .on('connection', client => {
    client.send(Buffer.from('AAAAEAAQAAEAAAAIAAAAAQ==', 'base64'))
    setInterval(() => {
      if (client.readyState !== client.OPEN) return
      client.send(full(msg))
      client.send(full(beatStorm))
      client.send(full(TVstart))
      client.send(full(raffleStart))
      client.send(full(eventCMD))
    }, 3000)
    client.on('message', data => {
      client.send(Buffer.from('AAAAFAAQAAEAAAADAAAAAQAAAAE=', 'base64'))
      console.log(data.toString('hex'))
    })
    client.on('close', () => {
      console.log('close')
      client.close()
      client.terminate()
    })
    client.on('error', () => {
      console.log('error')
      client.close()
      client.terminate()
    })
  })
createServer(client => {
  client.write(Buffer.from('AAAAEAAQAAEAAAAIAAAAAQ==', 'base64'))
  setInterval(() => {
    if (client.destroyed) return
    client.write(full(msg))
    client.write(full(beatStorm))
    client.write(full(TVstart))
    client.write(full(raffleStart))
    client.write(full(eventCMD))
  }, 3000)
  client.on('data', data => {
    client.write(Buffer.from('AAAAFAAQAAEAAAADAAAAAQAAAAE=', 'base64'))
    console.log(data.toString('hex'))
  })
  client.on('end', () => {
    console.log('end')
    client.end()
    client.destroy()
  })
  client.on('error', () => {
    console.log('error')
    client.end()
    client.destroy()
  })
})
  .listen(2243, '0.0.0.0', console.log('server bound'))