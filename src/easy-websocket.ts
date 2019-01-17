class Websocket {
  public wsUrl: string
  public options: websocket.options
  public restartNumber: number // 连接次数
  public webSocketObj!: websocket.WebSocket
  public eventArray: Array<websocket.eventObj>
  public heartTimeObj: any
  public reconnetTimeObj: any
  public isStopHeartBeat: boolean // 是否停止心脏检测
  public heartBeatNumber: number // 心脏检测次数
  public isOpen: boolean // 是否开启状态
  public isReconnection: boolean // 是否正则重连中
  public restart?: Function // 重连回调函数

  constructor(wsUrl: string, options?: websocket.options) {
    this.wsUrl = wsUrl || ''
    this.options = options || {
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
    }
    this.heartTimeObj = null
    this.eventArray = []
    this.restartNumber = 0
    this.heartBeatNumber = 0
    this.isStopHeartBeat = false
    this.isOpen = false
    this.isReconnection = false
  }

  async open(): Promise<any> {
    return new Promise((resolve) => {
      this.webSocketObj = new WebSocket(this.wsUrl)
      this.isOpen = true
      this.handleError()
      this.webSocketObj.onopen = () => {
        this.restartNumber = 0
        this.isReconnection = false
        this.initHandle()
        resolve()
      }
    })
  }

  /**
   * 相当于 WebSocket 的 send 方法
   */
  public send(data: string | ArrayBuffer | Blob | ArrayBufferView): any {
    if (!this.isOpen) {
      // 关闭状态，
      return false
    }
    this.webSocketObj.send(data)
  }

  /**
   * 相当于 WebSocket 的 close 方法
   */
  public close() {
    this.isOpen = false
    this.webSocketObj.close()
  }

  /**
   * 重新生成一个 WebSocket 对象
   */
  public async start() {
    this.restartNumber += 1
    await this.open()
    if (this.isReconnection) {
      this.isReconnection = false
      this.restart && this.restart()
    }
    console.log('restart success')
    this.reset()
    // this.initHandle()
    this.heartBeat()
  }

  /**
   * 重启
   */
  public reconnection() {
    if (this.reconnetTimeObj) {
      clearTimeout(this.reconnetTimeObj)
    }
    if (this.restartNumber >= this.options.maxRestartNumber) {
      this.isReconnection = false
      throw new Error('max connect')
    }
    this.reconnetTimeObj = setTimeout(() => {
      this.start()
    }, this.options.reconnectOptions.intervalTime)
  }

  /**
   * 相当于 WebSocket 的 on 方法
   * @param {string} type 监听的方法
   * @param {Function?} callback 回调方法
   * @param {Function?} middleware 中间件处理方法
   */
  public on(type: string, callback: Function, middleware?: Function): any {
    this.eventArray.push({
      type,
      callback
    })
    // if (!this.webSocketObj) return false
  }

  public _on(type: string, callback: Function, middleware?: Function): any {
    this.webSocketObj[`on${type}`] = (event: MessageEvent) => {
      let callbackData = {}
      if (middleware) {
        callbackData = middleware(event)
      } else {
        if (type === 'message') {
          callbackData = this.messageMiddleware(event)
        } else {
          callbackData = {
            type,
            data: event.data,
            event
          }
        }
      }
      if (type === 'message') {
        // 是否需要判断是心脏检测的回应，才重设心脏检测
        this.clearTime()
        this.heartBeat()
      }
      callback(callbackData)
    }
  }

  /**
   * message 处理的中间件
   */
  private messageMiddleware(event: MessageEvent) {
    let resultData: any = {}
    let _data: any = {}
    let type = ''
    try {
      resultData = JSON.parse(event.data)
      if (Object.prototype.toString.call(resultData) === '[Object object]') {
        type = resultData.type
        _data = event.data
      } else {
        _data = resultData
      }
    } catch (error) {
      _data = event.data
    }
    return {
      type,
      data: _data,
      event
    }
  }

  /**
   * 心跳检测
   */
  public heartBeat() {
    const heartOptions = this.options.heartOptions
    clearTimeout(this.heartTimeObj)
    // 如果连续 n 次心跳没收到回复，重连
    if (this.heartBeatNumber >= heartOptions.checkNumber) {
      this.isStopHeartBeat = true
      this.isReconnection = true
      this.reconnection()
    }
    if (this.isStopHeartBeat) return false
    this.heartTimeObj = setTimeout(() => {
      this.heartBeatNumber += 1
      this.send(heartOptions.sendContent)
      console.log('heartbeat')
      this.heartBeat()
    }, heartOptions.intervalTime)
  }

  /**
   * 重设方法
   */
  public initHandle() {
    console.log(this.eventArray)
    this.eventArray.forEach(v => {
      this._on(v.type, v.callback)
    })
  }

  /**
   * 重设属性
   */
  reset() {
    this.clearTime()
  }

  /**
   * 清除时间对象的值
   */
  clearTime() {
    clearTimeout(this.heartTimeObj)
    this.isStopHeartBeat = false
    this.heartBeatNumber = 0
  }

  handleError() {
    this.webSocketObj.addEventListener('error', (event: MessageEvent) => {
      console.log('weboscket error:', event)
      // if (event)
      const readyState = this.webSocketObj.readyState
      if (readyState === 2 || readyState === 3) {
        if (this.isReconnection) {
          // 在重连状态下，不需要 error 进行触发重连
          console.log('isReconnection')
        } else {
          this.reconnection()
        }
      }
    })
    this.webSocketObj.addEventListener('close', (event: MessageEvent) => {
      if (this.isOpen) {
        // 如果在 isOpen 是 true 的状态下，触发了 close 回调
        // 代表是异常错误导致 close，而不是手动触发 close
        this.isOpen = false
        if (this.isReconnection) {
          // 进行重连
          this.reconnection()
        }
      }
      console.log('weboscket close:', event, this.isOpen)
    })
  }
}

export namespace websocket {
  export interface heartOptions {
    intervalTime: number
    checkNumber: number
    sendContent: string
    responseContent: string
    enable: boolean
  }
  export interface reconnectOptions {
    intervalTime: number
    checkNumber: number
  }
  export interface eventObj {
    type: string
    callback: Function
  }
  export interface options {
    maxRestartNumber: number
    heartOptions: heartOptions
    reconnectOptions: reconnectOptions
  }
  export interface result {
    type: string
    data: any
    event: MessageEvent
  }
  export interface WebSocket {
    [key: string]: any
  }
}

export default Websocket
