import { websocket } from './src/easy-websocket'

export default class EasyWebsocket {
  open: websocket.open
  send: websocket.send
  close: websocket.close
  start: websocket.start
  reconnection: websocket.reconnection
  on: websocket.on
  _on(type: string, callback: Function, middleware?: Function): any
  messageMiddleware(event: MessageEvent): any
  heartBeat(): any
  initHandle(): void
  reset(): void
  clearTime(): void
  handleError(): void
}

export interface EasyWebsocketInstant extends EasyWebsocket {
  options: websocket.options
  // open: websocket.open
  // send: websocket.send
  // close: websocket.close
  // start: websocket.start
  // reconnection: websocket.reconnection
  // on: websocket.on
}
