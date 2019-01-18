import Websocket from './easy-ws'

const obj = new Websocket('ws://localhost:3000', {
  maxRestartNumber: 3, // 最大可试重连接数
  heartOptions: {
    intervalTime: 5000,
    checkNumber: 3,
    sendContent: 'ping',
    responseContent: 'pong',
    enable: true
  },
  reconnectOptions: {
    intervalTime: 5000,
    checkNumber: 3
  }
})

;(async () => {
  obj.on('message', (data: any) => {
    console.log(data)
  })
  await obj.open()
})()
