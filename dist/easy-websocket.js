!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["easy-websocket"]=t():e["easy-websocket"]=t()}(window,function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";n.r(t);var r=function(e,t,n,r){return new(n||(n=Promise))(function(o,i){function a(e){try{c(r.next(e))}catch(e){i(e)}}function s(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){e.done?o(e.value):new n(function(t){t(e.value)}).then(a,s)}c((r=r.apply(e,t||[])).next())})},o=function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(i){return function(s){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,s])}}},i=function(){function e(e,t){this.wsUrl=e||"",this.options=t||{maxRestartNumber:3,heartOptions:{intervalTime:5e3,checkNumber:3,sendContent:"ping",responseContent:"pong",enable:!0},reconnectOptions:{intervalTime:5e3,checkNumber:3}},this.heartTimeObj=null,this.eventArray=[],this.restartNumber=0,this.heartBeatNumber=0,this.isStopHeartBeat=!1,this.isOpen=!1,this.isInit=!0,this.isReconnection=!1}return e.prototype.open=function(){return r(this,void 0,void 0,function(){var e=this;return o(this,function(t){return[2,new Promise(function(t){e.webSocketObj=new WebSocket(e.wsUrl),e.isOpen=!0,e.handleError(),e.webSocketObj.onopen=function(){e.isInit?(e.isInit=!1,e.initHandle(),e.heartBeat()):(e.restartNumber=0,e.reset(),e.initHandle(),e.heartBeat(),e.isReconnection&&(e.isReconnection=!1,e.restart&&e.restart()),console.log("restart success")),t()}})]})})},e.prototype.send=function(e){this.isOpen&&this.webSocketObj.send(e)},e.prototype.close=function(){this.isOpen=!1,this.webSocketObj.close()},e.prototype.start=function(){return r(this,void 0,void 0,function(){return o(this,function(e){switch(e.label){case 0:return this.restartNumber+=1,[4,this.open()];case 1:return e.sent(),[2]}})})},e.prototype.reconnection=function(){var e=this;if(this.reconnetTimeObj&&clearTimeout(this.reconnetTimeObj),this.restartNumber>=this.options.maxRestartNumber)return this.isReconnection=!1,console.log("max connect"),void(this.exceedConnect&&this.exceedConnect());this.reconnetTimeObj=setTimeout(function(){e.start()},this.options.reconnectOptions.intervalTime)},e.prototype.on=function(e,t,n){this.eventArray.push({type:e,callback:t,middleware:n||void 0})},e.prototype._on=function(e,t,n){var r=this;this.webSocketObj["on"+e]=function(o){var i;i=n?n(o):"message"===e?r.messageMiddleware(o):{type:e,data:o.data,event:o},"message"===e&&(r.clearTime(),r.heartBeat()),t(i)}},e.prototype.messageMiddleware=function(e){var t={},n={},r="";try{t=JSON.parse(e.data),"[Object object]"===Object.prototype.toString.call(t)?(r=t.type,n=e.data):n=t}catch(t){n=e.data}return{type:r,data:n,event:e}},e.prototype.heartBeat=function(){var e=this,t=this.options.heartOptions;if(clearTimeout(this.heartTimeObj),this.heartBeatNumber>=t.checkNumber&&(this.isStopHeartBeat=!0,this.isReconnection=!0,this.reconnection()),this.isStopHeartBeat)return!1;this.heartTimeObj=setTimeout(function(){e.heartBeatNumber+=1,e.send(t.sendContent),e.heartBeat()},t.intervalTime)},e.prototype.initHandle=function(){var e=this;this.eventArray.forEach(function(t){e._on(t.type,t.callback,t.middleware||void 0)})},e.prototype.reset=function(){this.clearTime()},e.prototype.clearTime=function(){clearTimeout(this.heartTimeObj),this.isStopHeartBeat=!1,this.heartBeatNumber=0},e.prototype.handleError=function(){var e=this;this.webSocketObj.addEventListener("error",function(t){var n=e.webSocketObj.readyState;2!==n&&3!==n||e.isReconnection||e.reconnection()}),this.webSocketObj.addEventListener("close",function(t){e.isOpen&&(e.isOpen=!1,e.isReconnection&&e.reconnection())})},e}();t.default=i}])});