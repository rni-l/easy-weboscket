class Websocket {
  public wsUrl: string
  public options: websocket.options
  public restartNumber: number // 连接次数
  public webSocketObj!: websocket.WebSocket
  public eventArray: Array<websocket.eventObj>
  public heartTimeObj: any
  public reconnetTimeObj: any
  public heartBeatNumber: number // 心脏检测次数
  public isStopHeartBeat: boolean // 是否停止心脏检测
  public isOpen: boolean // 是否开启状态
  public isReconnection: boolean // 是否正则重连中
  public isInit: boolean // 是否初始
  public restart?: Function // 重连回调函数
  public exceedConnect?: Function // 超出连接次数回调

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
    this.isInit = true
    this.isReconnection = false
  }

  async open(): Promise<any> {
    return new Promise(resolve => {
      this.webSocketObj = new WebSocket(this.wsUrl)
      this.isOpen = true
      this.handleError()
      this.webSocketObj.onopen = () => {
        if (this.isInit) {
          this.isInit = false
          this.initHandle()
          this.heartBeat()
        } else {
          this.restartNumber = 0
          this.reset()
          this.initHandle()
          this.heartBeat()
          if (this.isReconnection) {
            this.isReconnection = false
            this.restart && this.restart()
          }
          console.log('restart success')
        }
        resolve()
      }
    })
  }

  /**
   * 相当于 WebSocket 的 send 方法
   */
  public send(data: string | ArrayBuffer | Blob | ArrayBufferView): void {
    if (!this.isOpen) {
      // 关闭状态
    } else {
      this.webSocketObj.send(data)
    }
  }

  /**
   * 相当于 WebSocket 的 close 方法
   */
  public close(): void {
    this.isOpen = false
    this.webSocketObj.close()
  }

  /**
   * 重新生成一个 WebSocket 对象
   */
  public async start(): Promise<any> {
    this.restartNumber += 1
    await this.open()
  }

  /**
   * 重启
   */
  public reconnection(): void {
    if (this.reconnetTimeObj) {
      clearTimeout(this.reconnetTimeObj)
    }
    if (this.restartNumber >= this.options.maxRestartNumber) {
      this.isReconnection = false
      console.log('max connect')
      this.exceedConnect && this.exceedConnect()
      return
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
  public on(type: string, callback: Function, middleware?: Function): void {
    this.eventArray.push({
      type,
      callback,
      middleware: middleware || undefined
    })
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
  private messageMiddleware(event: MessageEvent): any {
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
  public heartBeat(): any {
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
      this.heartBeat()
    }, heartOptions.intervalTime)
  }

  /**
   * 重设方法
   */
  public initHandle(): void {
    this.eventArray.forEach(v => {
      this._on(v.type, v.callback, v.middleware || undefined)
    })
  }

  /**
   * 重设属性
   */
  reset(): void {
    this.clearTime()
  }

  /**
   * 清除时间对象的值
   */
  clearTime(): void {
    clearTimeout(this.heartTimeObj)
    this.isStopHeartBeat = false
    this.heartBeatNumber = 0
  }

  handleError(): void {
    this.webSocketObj.addEventListener('error', (event: MessageEvent) => {
      const readyState = this.webSocketObj.readyState
      if (readyState === 2 || readyState === 3) {
        if (this.isReconnection) {
          // 在重连状态下，不需要 error 进行触发重连
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
    middleware?: Function
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

  export interface on {
    (type: string, callback: Function, middleware?: Function): void
  }

  export interface send {
    (data: string | ArrayBuffer | Blob | ArrayBufferView): void
  }

  export interface open {
    (): Promise<any>
  }

  export interface start {
    (): Promise<any>
  }

  export interface close {
    (): void
  }

  export interface reconnection {
    (): void
  }
}

export default Websocket
