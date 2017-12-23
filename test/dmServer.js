const wsServer = require('ws').Server
const createServer = require('net').createServer

let msg = Buffer.from('{"info":[[0,1,25,16777215,0,0,0,"0",0],"test",[1,"test",0,0,0,10000,1],[],[50,0,1,1],[],0,0],"cmd":"DANMU_MSG"}')
  , test = Buffer.from('{"cmd":"SPECIAL_GIFT","data":{"39":{"id":124500,"time":90,"hadJoin":0,"num":1,"content":"打卡","action":"start"}}}')
  , full = (data) => {
    let leng = data.length + 16
      , head = Buffer.allocUnsafe(16)
    head.writeUInt32BE(leng, 0)
    head.writeUInt16BE(16, 4)
    head.writeUInt16BE(1, 6)
    head.writeUInt32BE(5, 8)
    head.writeUInt32BE(1, 12)
    return Buffer.concat([head, data], leng)
  }
  , _ws = new wsServer({ host: '0.0.0.0', port: 2244 }, console.log('wsServer bound'))
    .on('connection', client => {
      client.send(Buffer.from('AAAAEAAQAAEAAAAIAAAAAQ==', 'base64'))
      setInterval(() => {
        if (client.readyState !== client.OPEN) return
        client.send(full(msg))
        client.send(full(test))
      }, 1e+3)
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
  , _server = createServer(client => {
    client.write(Buffer.from('AAAAEAAQAAEAAAAIAAAAAQ==', 'base64'))
    setInterval(() => {
      if (client.destroyed) return
      client.write(full(msg))
      client.write(full(test))
    }, 1e+3)
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