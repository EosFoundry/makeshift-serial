import{SerialPort as e}from"serialport";import t from"stream";import{inspect as o}from"node:util";import i from"node:process";import s from"node:os";import n from"node:tty";import{EventEmitter as r}from"node:events";import{Buffer as l}from"node:buffer";import{randomFillSync as a}from"crypto";var h="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},c={},u={};Object.defineProperty(u,"__esModule",{value:!0}),u.SlipDecoder=void 0;const f=t;class g extends f.Transform{constructor(e={}){super(e);const{START:t,ESC:o=219,END:i=192,ESC_START:s,ESC_END:n=220,ESC_ESC:r=221}=e;this.opts={START:t,ESC:o,END:i,ESC_START:s,ESC_END:n,ESC_ESC:r},this.buffer=Buffer.alloc(0),this.escape=!1,this.start=!1}_transform(e,t,o){for(let t=0;t<e.length;t++){let o=e[t];if(o!==this.opts.START){if(null==this.opts.START&&(this.start=!0),this.escape)o===this.opts.ESC_START&&this.opts.START?o=this.opts.START:o===this.opts.ESC_ESC?o=this.opts.ESC:o===this.opts.ESC_END?o=this.opts.END:(this.escape=!1,this.push(this.buffer),this.buffer=Buffer.alloc(0));else{if(o===this.opts.ESC){this.escape=!0;continue}if(o===this.opts.END){this.push(this.buffer),this.buffer=Buffer.alloc(0),this.escape=!1,this.start=!1;continue}}this.escape=!1,this.start&&(this.buffer=Buffer.concat([this.buffer,Buffer.from([o])]))}else this.start=!0}o()}_flush(e){this.push(this.buffer),this.buffer=Buffer.alloc(0),e()}}u.SlipDecoder=g;var E={};Object.defineProperty(E,"__esModule",{value:!0}),E.SlipEncoder=void 0;const d=t;class p extends d.Transform{constructor(e={}){super(e);const{START:t,ESC:o=219,END:i=192,ESC_START:s,ESC_END:n=220,ESC_ESC:r=221,bluetoothQuirk:l=!1}=e;this.opts={START:t,ESC:o,END:i,ESC_START:s,ESC_END:n,ESC_ESC:r,bluetoothQuirk:l}}_transform(e,t,o){const i=e.length;if(this.opts.bluetoothQuirk&&0===i)return o();const s=Buffer.alloc(2*i+2);let n=0;1==this.opts.bluetoothQuirk&&(s[n++]=this.opts.END),void 0!==this.opts.START&&(s[n++]=this.opts.START);for(let t=0;t<i;t++){let o=e[t];o===this.opts.START&&this.opts.ESC_START?(s[n++]=this.opts.ESC,o=this.opts.ESC_START):o===this.opts.END?(s[n++]=this.opts.ESC,o=this.opts.ESC_END):o===this.opts.ESC&&(s[n++]=this.opts.ESC,o=this.opts.ESC_ESC),s[n++]=o}s[n++]=this.opts.END,o(null,s.slice(0,n))}}var b,m,S;function T(e){return null!==e&&"object"==typeof e}function v(e,t,o=".",i){if(!T(t))return v(e,{},o,i);const s=Object.assign({},t);for(const t in e){if("__proto__"===t||"constructor"===t)continue;const n=e[t];null!=n&&(i&&i(s,t,n,o)||(Array.isArray(n)&&Array.isArray(s[t])?s[t]=n.concat(s[t]):T(n)&&T(s[t])?s[t]=v(n,s[t],(o?`${o}.`:"")+t.toString(),i):s[t]=n))}return s}E.SlipEncoder=p,b=c,m=h&&h.__createBinding||(Object.create?function(e,t,o,i){void 0===i&&(i=o),Object.defineProperty(e,i,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,i){void 0===i&&(i=o),e[i]=t[o]}),S=h&&h.__exportStar||function(e,t){for(var o in e)"default"===o||Object.prototype.hasOwnProperty.call(t,o)||m(t,e,o)},Object.defineProperty(b,"__esModule",{value:!0}),S(u,b),S(E,b);const C=(...e)=>e.reduce(((e,t)=>v(e,t,"",R)),{});var R;const A=(e=0)=>t=>`[${t+e}m`,_=(e=0)=>t=>`[${38+e};5;${t}m`,D=(e=0)=>(t,o,i)=>`[${38+e};2;${t};${o};${i}m`,N={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};Object.keys(N.modifier);Object.keys(N.color),Object.keys(N.bgColor);const O=function(){const e=new Map;for(const[t,o]of Object.entries(N)){for(const[t,i]of Object.entries(o))N[t]={open:`[${i[0]}m`,close:`[${i[1]}m`},o[t]=N[t],e.set(i[0],i[1]);Object.defineProperty(N,t,{value:o,enumerable:!1})}return Object.defineProperty(N,"codes",{value:e,enumerable:!1}),N.color.close="[39m",N.bgColor.close="[49m",N.color.ansi=A(),N.color.ansi256=_(),N.color.ansi16m=D(),N.bgColor.ansi=A(10),N.bgColor.ansi256=_(10),N.bgColor.ansi16m=D(10),Object.defineProperties(N,{rgbToAnsi256:{value:(e,t,o)=>e===t&&t===o?e<8?16:e>248?231:Math.round((e-8)/247*24)+232:16+36*Math.round(e/255*5)+6*Math.round(t/255*5)+Math.round(o/255*5),enumerable:!1},hexToRgb:{value(e){const t=/[a-f\d]{6}|[a-f\d]{3}/i.exec(e.toString(16));if(!t)return[0,0,0];let[o]=t;3===o.length&&(o=[...o].map((e=>e+e)).join(""));const i=Number.parseInt(o,16);return[i>>16&255,i>>8&255,255&i]},enumerable:!1},hexToAnsi256:{value:e=>N.rgbToAnsi256(...N.hexToRgb(e)),enumerable:!1},ansi256ToAnsi:{value(e){if(e<8)return 30+e;if(e<16)return e-8+90;let t,o,i;if(e>=232)t=(10*(e-232)+8)/255,o=t,i=t;else{const s=(e-=16)%36;t=Math.floor(e/36)/5,o=Math.floor(s/6)/5,i=s%6/5}const s=2*Math.max(t,o,i);if(0===s)return 30;let n=30+(Math.round(i)<<2|Math.round(o)<<1|Math.round(t));return 2===s&&(n+=60),n},enumerable:!1},rgbToAnsi:{value:(e,t,o)=>N.ansi256ToAnsi(N.rgbToAnsi256(e,t,o)),enumerable:!1},hexToAnsi:{value:e=>N.ansi256ToAnsi(N.hexToAnsi256(e)),enumerable:!1}}),N}();function w(e,t=i.argv){const o=e.startsWith("-")?"":1===e.length?"-":"--",s=t.indexOf(o+e),n=t.indexOf("--");return-1!==s&&(-1===n||s<n)}const{env:y}=i;let P;function I(e,{streamIsTTY:t,sniffFlags:o=!0}={}){const n=function(){if("FORCE_COLOR"in y)return"true"===y.FORCE_COLOR?1:"false"===y.FORCE_COLOR?0:0===y.FORCE_COLOR.length?1:Math.min(Number.parseInt(y.FORCE_COLOR,10),3)}();void 0!==n&&(P=n);const r=o?P:n;if(0===r)return 0;if(o){if(w("color=16m")||w("color=full")||w("color=truecolor"))return 3;if(w("color=256"))return 2}if(e&&!t&&void 0===r)return 0;const l=r||0;if("dumb"===y.TERM)return l;if("win32"===i.platform){const e=s.release().split(".");return Number(e[0])>=10&&Number(e[2])>=10586?Number(e[2])>=14931?3:2:1}if("CI"in y)return["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","GITHUB_ACTIONS","BUILDKITE","DRONE"].some((e=>e in y))||"codeship"===y.CI_NAME?1:l;if("TEAMCITY_VERSION"in y)return/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(y.TEAMCITY_VERSION)?1:0;if("TF_BUILD"in y&&"AGENT_NAME"in y)return 1;if("truecolor"===y.COLORTERM)return 3;if("TERM_PROGRAM"in y){const e=Number.parseInt((y.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(y.TERM_PROGRAM){case"iTerm.app":return e>=3?3:2;case"Apple_Terminal":return 2}}return/-256(color)?$/i.test(y.TERM)?2:/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(y.TERM)||"COLORTERM"in y?1:l}function L(e,t={}){return function(e){return 0!==e&&{level:e,hasBasic:!0,has256:e>=2,has16m:e>=3}}(I(e,{streamIsTTY:e&&e.isTTY,...t}))}w("no-color")||w("no-colors")||w("color=false")||w("color=never")?P=0:(w("color")||w("colors")||w("color=true")||w("color=always"))&&(P=1);const M={stdout:L({isTTY:n.isatty(1)}),stderr:L({isTTY:n.isatty(2)})};function B(e,t,o){let i=e.indexOf(t);if(-1===i)return e;const s=t.length;let n=0,r="";do{r+=e.slice(n,i)+t+o,n=i+s,i=e.indexOf(t,n)}while(-1!==i);return r+=e.slice(n),r}const{stdout:k,stderr:G}=M,j=Symbol("GENERATOR"),$=Symbol("STYLER"),x=Symbol("IS_EMPTY"),H=["ansi","ansi","ansi256","ansi16m"],U=Object.create(null),Y=e=>{const t=(...e)=>e.join(" ");return((e,t={})=>{if(t.level&&!(Number.isInteger(t.level)&&t.level>=0&&t.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");const o=k?k.level:0;e.level=void 0===t.level?o:t.level})(t,e),Object.setPrototypeOf(t,F.prototype),t};function F(e){return Y(e)}Object.setPrototypeOf(F.prototype,Function.prototype);for(const[e,t]of Object.entries(O))U[e]={get(){const o=z(this,W(t.open,t.close,this[$]),this[x]);return Object.defineProperty(this,e,{value:o}),o}};U.visible={get(){const e=z(this,this[$],!0);return Object.defineProperty(this,"visible",{value:e}),e}};const V=(e,t,o,...i)=>"rgb"===e?"ansi16m"===t?O[o].ansi16m(...i):"ansi256"===t?O[o].ansi256(O.rgbToAnsi256(...i)):O[o].ansi(O.rgbToAnsi(...i)):"hex"===e?V("rgb",t,o,...O.hexToRgb(...i)):O[o][e](...i),K=["rgb","hex","ansi256"];for(const e of K){U[e]={get(){const{level:t}=this;return function(...o){const i=W(V(e,H[t],"color",...o),O.color.close,this[$]);return z(this,i,this[x])}}};U["bg"+e[0].toUpperCase()+e.slice(1)]={get(){const{level:t}=this;return function(...o){const i=W(V(e,H[t],"bgColor",...o),O.bgColor.close,this[$]);return z(this,i,this[x])}}}}const Q=Object.defineProperties((()=>{}),{...U,level:{enumerable:!0,get(){return this[j].level},set(e){this[j].level=e}}}),W=(e,t,o)=>{let i,s;return void 0===o?(i=e,s=t):(i=o.openAll+e,s=t+o.closeAll),{open:e,close:t,openAll:i,closeAll:s,parent:o}},z=(e,t,o)=>{const i=(...e)=>J(i,1===e.length?""+e[0]:e.join(" "));return Object.setPrototypeOf(i,Q),i[j]=e,i[$]=t,i[x]=o,i},J=(e,t)=>{if(e.level<=0||!t)return e[x]?"":t;let o=e[$];if(void 0===o)return t;const{openAll:i,closeAll:s}=o;if(t.includes(""))for(;void 0!==o;)t=B(t,o.close,o.open),o=o.parent;const n=t.indexOf("\n");return-1!==n&&(t=function(e,t,o,i){let s=0,n="";do{const r="\r"===e[i-1];n+=e.slice(s,r?i-1:i)+t+(r?"\r\n":"\n")+o,s=i+1,i=e.indexOf("\n",s)}while(-1!==i);return n+=e.slice(s),n}(t,s,i,n)),i+t+s};Object.defineProperties(F.prototype,U);const X=F();function Z(e){return e.replace(/[^A-Za-z0-9]/g,"").toLowerCase().replace(/-(.)/g,(function(e,t){return t.toUpperCase()}))}F({level:G?G.level:0});const q={all:0,debug:1,info:2,event:3,warn:4,error:5,fatal:98,none:99},ee={host:"",logLevel:"all",prompt:" => ",showTime:!0,symbol:{debug:"dbg",info:"",event:"",warn:"(!)",error:"[!]",fatal:"{x_X}"},terminal:!0},te={debug:X.gray,info:X.white,event:X.green,warn:X.yellow,error:X.red,fatal:X.redBright};function oe(e,t){te[e]=t}function ie(e){te.warn=e}function se(e){return JSON.stringify(e,null,2)}function ne(e,t){return o(e,{colors:!0,depth:t})}function re(e){return o(e,{colors:!0,depth:2})}class le{_debug=()=>{};_info=()=>{};_event=()=>{};_warn=()=>{};_error=()=>{};_fatal=()=>{};_defaultLogger(e,t){console.log(e)}prompt=" => ";host="";logLevel="all";terminal=!0;showTime=!0;showMillis=!1;get time(){const e=new Date;let t="",o="",i="";e.getHours()<10&&(t="0"),e.getMinutes()<10&&(o="0"),e.getSeconds()<10&&(i="0"),t+=e.getHours(),o+=e.getMinutes(),i+=e.getSeconds();let s=t+":"+o+":"+i;return this.showMillis&&(s+=":"+e.getMilliseconds()),X.grey(s)}ps(e){let t="";return this.showTime&&(t+=this.time+" "),""!==this.symbol[e]&&(t+=te[e](this.symbol[e])+" "),t+=te[e](this.host)+this.prompt,t}symbol;assignOptions(e,t){for(const o in t)"object"!=typeof e[o]?e[o]=t[o]||e[o]:this.assignOptions(e[o],t[o])}getLevelLoggers(){return{debug:this._debug,info:this._info,event:this._event,warn:this._warn,error:this._error,fatal:this._fatal}}logger=this._defaultLogger;resetLogger(){this.logger=this._defaultLogger}constructor(e=ee){const t=C(e,ee);this.assignOptions(this,t),this.spawnLevelLoggers()}spawnLevelLoggers(){for(let e in this.symbol){let t=e;this["_"+e]=e=>{const o=`${this.ps(t)}${e}`;return q[this.logLevel]<=q[t]&&this.logger(o,t),o}}}}const ae=/(^|[\\/])([^\\/]+?)(?=(\.[^.]+)?$)/;let he,ce,ue=(e=21)=>{var t;t=e-=0,!he||he.length<t?(he=Buffer.allocUnsafe(128*t),a(he),ce=0):ce+t>he.length&&(a(he),ce=0),ce+=t;let o="";for(let t=ce-e;t<ce;t++)o+="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"[63&he[t]];return o},fe=0;var ge;!function(e){e[e.PING=0]="PING",e[e.ACK=1]="ACK",e[e.READY=2]="READY",e[e.STATE_UPDATE=3]="STATE_UPDATE",e[e.ERROR=4]="ERROR",e[e.STRING=5]="STRING",e[e.DISCONNECT=6]="DISCONNECT"}(ge||(ge={}));const Ee={portInfo:{},logLevel:"all",id:"",showTime:!1};class de extends r{serialPort;slipEncoder=new c.SlipEncoder(Se);slipDecoder=new c.SlipDecoder(Se);_prevAckTime=0;prevState={buttons:[!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1],dials:[0,0,0,0]};_deviceReady=!1;_id="";_portInfo=null;_msger;keepAliveTimer;get prevAckTime(){return this._prevAckTime}get isOpen(){return void 0!==this.serialPort&&this.serialPort.isOpen}static get connectedDevices(){return fe}get devicePath(){return null!==this._portInfo?this._portInfo.path:""}get deviceSerial(){return null!==this._portInfo?this._portInfo.serialNumber:""}get fingerPrint(){return{time:Date.now(),devicePath:this.devicePath,deviceSerial:this.deviceSerial,portId:this.portId}}get portInfo(){return this._portInfo}get portId(){return this._id}log;debug;info;warn;error;fatal;get host(){let e=`Port:${X.magenta(this.deviceSerial.slice(0,4))}|`;return this.isOpen?e+=X.green(this.devicePath.match(ae)?.[2]):e+=X.yellow("D/C"),e}_logLevel="all";get showTime(){return this._msger.showTime}set showTime(e){this._msger.showTime=e}get logLevel(){return this._logLevel}set logLevel(e){this._logLevel=e,this._msger.logLevel=e}get logTermFormat(){return this._msger.terminal}set logTermFormat(e){this._msger.terminal=e}emitLog=(e,t)=>{this.emit(pe.Terminal.Log[t],{level:t,message:e,buffer:l.from(e)})};constructor(e){super();const t=C(e,Ee);this._id=""===t.id?ue(23):t.id,this._portInfo=t.portInfo,this._msger=new le,this._msger.host=this.host,this._msger.showTime=t.showTime,this.log=this._msger.getLevelLoggers(),this.logLevel=t.logLevel;for(const e in this.log)this[e]=t=>{const o=this.log[e](t);this.emitLog(o,e)};this.debug("Creating new MakeShiftPort with options: "+re(t)),this.slipDecoder.on("data",(e=>{this.onSlipDecoderData(e)})),this.open()}onSlipDecoderData(e){this._prevAckTime=Date.now();const t=e.slice(0,1).at(0),o=e.slice(1);switch(this.debug(re(e)),t){case ge.STATE_UPDATE:{let e=de.parseStateFromBuffer(o);this.emit(pe.DEVICE.STATE_UPDATE,e),this.onStateUpdate(e);break}case ge.ACK:this.debug("Got ACK from MakeShift");break;case ge.STRING:this.debug(o.toString());break;case ge.PING:this.debug("Got PING from MakeShift, responding with ACK"),this.sendByte(ge.ACK);break;case ge.ERROR:this.debug("Got ERROR from MakeShift");break;case ge.READY:this.debug("Got READY from MakeShift"),this.debug(o.toString()),fe++,this._deviceReady=!0,this._prevAckTime=Date.now(),this.log.event("Device connection established"),this.emit(pe.DEVICE.CONNECTED,this.fingerPrint);break;default:this.debug(t),this.debug(e.toString())}}ping(){this.sendByte(ge.PING)}onStateUpdate(e){for(let t=0;t<be;t++)if(e.buttons[t]!=this.prevState.buttons[t]){let o;o=!0===e.buttons[t]?pe.BUTTON[t].PRESSED:pe.BUTTON[t].RELEASED,this.emit(o,e.buttons[t]),this.log.event(`${o} with state ${e.buttons[t]}`)}let t;for(let o=0;o<me;o++)if(t=this.prevState.dials[o]-e.dials[o],0!==t){let i;this.emit(pe.DIAL[o].CHANGE,e.dials[o]),i=t>0?pe.DIAL[o].INCREMENT:pe.DIAL[o].DECREMENT,this.emit(i,e.dials[o]),this.log.event(`${i} with state ${e.dials[o]}`)}this.prevState=e}sendByte(e){if(this.isOpen)try{this.serialPort.flush();let t=l.from([e]);this.debug(`Sending byte: ${re(t)}`),this.slipEncoder.write(t)}catch(e){this.error(e)}}send(e,t){if(this.isOpen)try{this.serialPort.flush();let o=l.from([e]),i=l.from(t);const s=l.concat([o,i]);this.debug(`Sending buffer: ${re(s)}`),this.slipEncoder.write(s)}catch(e){this.error(e)}}static parseStateFromBuffer(e){let t={buttons:[],dials:[]};const o=e.slice(0,2).reverse(),i=e.slice(2,18);function s(e,o){0!==o&&(e%2?t.buttons.push(!0):t.buttons.push(!1),s(Math.floor(e/2),o-1))}return o.forEach((e=>s(e,8))),t.dials.push(i.readInt32BE(0)),t.dials.push(i.readInt32BE(4)),t.dials.push(i.readInt32BE(8)),t.dials.push(i.readInt32BE(12)),t}async open(){this.serialPort=await new e({path:this.devicePath,baudRate:42069},(e=>{null!=e?(this.error("Something happened while opening port: "),this.error(e)):(this._msger.host=this.host,this.info("SerialPort opened, attaching SLIP translators"),this.slipEncoder.pipe(this.serialPort),this.serialPort.pipe(this.slipDecoder),this.info("Translators ready, sending READY to MakeShift"),this.sendByte(ge.READY))}))}close(){this.info("Closing MakeShift port..."),this.info("Unpiping encoders"),this.slipEncoder.unpipe(),this.serialPort.unpipe(),this.isOpen&&(this.info("Port object found open"),this.info("Sending disconnect packet"),this.sendByte(ge.DISCONNECT),this.info("Closing port"),this.serialPort.close()),this._msger.host=this.host,fe--,this._deviceReady=!1,this.log.event("Port closed, sending disconnect signal"),this.emit(pe.DEVICE.DISCONNECTED,this.fingerPrint)}write=e=>{this._deviceReady?this.send(ge.STRING,e):this.info("MakeShift not ready, line not sent")}}const pe={DIAL:[{INCREMENT:"dial-01-increment",DECREMENT:"dial-01-decrement",CHANGE:"dial-01-change"},{INCREMENT:"dial-02-increment",DECREMENT:"dial-02-decrement",CHANGE:"dial-02-change"},{INCREMENT:"dial-03-increment",DECREMENT:"dial-03-decrement",CHANGE:"dial-03-change"},{INCREMENT:"dial-04-increment",DECREMENT:"dial-04-decrement",CHANGE:"dial-04-change"}],BUTTON:[{PRESSED:"button-01-rise",RELEASED:"button-01-fall",CHANGE:"button-01-change"},{PRESSED:"button-02-rise",RELEASED:"button-02-fall",CHANGE:"button-02-change"},{PRESSED:"button-03-rise",RELEASED:"button-03-fall",CHANGE:"button-03-change"},{PRESSED:"button-04-rise",RELEASED:"button-04-fall",CHANGE:"button-04-change"},{PRESSED:"button-05-rise",RELEASED:"button-05-fall",CHANGE:"button-05-change"},{PRESSED:"button-06-rise",RELEASED:"button-06-fall",CHANGE:"button-06-change"},{PRESSED:"button-07-rise",RELEASED:"button-07-fall",CHANGE:"button-07-change"},{PRESSED:"button-08-rise",RELEASED:"button-08-fall",CHANGE:"button-08-change"},{PRESSED:"button-09-rise",RELEASED:"button-09-fall",CHANGE:"button-09-change"},{PRESSED:"button-10-rise",RELEASED:"button-10-fall",CHANGE:"button-10-change"},{PRESSED:"button-11-rise",RELEASED:"button-11-fall",CHANGE:"button-11-change"},{PRESSED:"button-12-rise",RELEASED:"button-12-fall",CHANGE:"button-12-change"},{PRESSED:"button-13-rise",RELEASED:"button-13-fall",CHANGE:"button-13-change"},{PRESSED:"button-14-rise",RELEASED:"button-14-fall",CHANGE:"button-14-change"},{PRESSED:"button-15-rise",RELEASED:"button-15-fall",CHANGE:"button-15-change"},{PRESSED:"button-16-rise",RELEASED:"button-16-fall",CHANGE:"button-16-change"}],DEVICE:{DISCONNECTED:"makeshift-disconnect",CONNECTED:"makeshift-connect",STATE_UPDATE:"state-update"},Terminal:{Log:{fatal:"makeshift-serial-log-fatal",error:"makeshift-serial-log-error",warn:"makeshift-serial-log-warn",event:"makeshift-serial-log-event",info:"makeshift-serial-log-info",debug:"makeshift-serial-log-debug",all:"makeshift-serial-log-any"}}},be=pe.BUTTON.length,me=pe.DIAL.length,Se={ESC:219,END:192,ESC_END:220,ESC_ESC:221},Te={};let ve="info",Ce=!1,Re=!0;const Ae={},_e=new r,De=new le({host:"PortAuthority",logLevel:"info"});De.logLevel=ve,De.showTime=Ce;const Ne=De.getLevelLoggers();function Oe(e){Ce=e,De.showTime=e;for(const t in Te)Te[t].showTime=e}function we(e){ve=e;for(const t in Te)Te[t].logLevel=e}function ye(e){De.logLevel=e}function Pe(){Re=!1}function Ie(){Re=!0,Le()}function Le(){setTimeout((()=>{!async function(){Ne.debug(`scanForDevice called with scan set to ${Re}`);try{const t=await e.list();t.forEach((e=>{Ne.debug(ne(e,1))}));const o=t.filter((e=>("16c0"===e.vendorId||"16C0"===e.vendorId)&&"0483"===e.productId));Ne.debug(`Found MakeShift devices: ${re(o)}`),o.length>0?o.forEach((e=>function(e){const t=e.path;for(const e in Te)if(Te[e].devicePath===t)return;const o=ue(23),i={portInfo:e,id:o,logLevel:ve,showTime:Ce};Ne.info(`Opening device with options: '${ne(i,1)}'`),Te[o]=new de(i),Te[o].ping(),Me(o)}(e))):Re?Le():_e.emit(Be.scan.stopped)}catch(e){Ne.error(e)}}()}),1e3),_e.emit(Be.scan.started)}function Me(e){Ae[e]=setTimeout((()=>{!function(e){const t=Date.now()-Te[e].prevAckTime;Ne.debug(`elapsedTime since prevAckTime: ${t}`),t>5e3?(clearTimeout(Ae[e]),Ne.debug(`Timer handle - ${Ae[e]}`),Ne.warn(`Device ${e}::${Te[e].devicePath} unresponsive for 5000ms, disconnecting`),function(e){if(void 0!==Te[e]){const t=Te[e].fingerPrint;Te[e].close(),delete Te[e],_e.emit(Be.port.closed,t),Re&&0===Object.keys(Te).length&&Le()}}(e)):(t>=1460&&Te[e].ping(),Me(e))}(e)}),1500)}const Be={port:{opened:"makeshift-pa-port-opened",closed:"makeshift-pa-port-closed"},scan:{started:"makeshift-pa-scan-started",stopped:"makeshift-pa-scan-stopped"}};export{pe as DeviceEvents,Te as Devices,de as MakeShiftPort,le as Msg,ge as PacketType,Be as PortAuthorityEvents,Ee as defaultMakeShiftPortOptions,ee as defaultMsgOptions,Z as filterName,q as logRank,re as nspct2,ne as nspect,oe as setColorize,we as setLogLevel,ye as setPortAuthorityLogLevel,Oe as setShowTime,ie as setWarn,Ie as startScan,Pe as stopScan,se as strfy};
