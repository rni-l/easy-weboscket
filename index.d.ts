import { websocket } from './src/easy-ws'

export default class EasyWs {
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

export interface EasyWsInstant extends EasyWs{
  options: websocket.options
  // open: websocket.open
  // send: websocket.send
  // close: websocket.close
  // start: websocket.start
  // reconnection: websocket.reconnection
  // on: websocket.on
}
