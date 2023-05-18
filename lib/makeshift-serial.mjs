import{SerialPort as e}from"serialport";import t from"stream";import{inspect as r}from"node:util";import o from"node:process";import i from"node:os";import n from"node:tty";import{EventEmitter as s}from"node:events";import{Buffer as l}from"node:buffer";import{randomFillSync as a}from"crypto";var c="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},h={},u={};Object.defineProperty(u,"__esModule",{value:!0}),u.SlipDecoder=void 0;const f=t;class g extends f.Transform{constructor(e={}){super(e);const{START:t,ESC:r=219,END:o=192,ESC_START:i,ESC_END:n=220,ESC_ESC:s=221}=e;this.opts={START:t,ESC:r,END:o,ESC_START:i,ESC_END:n,ESC_ESC:s},this.buffer=Buffer.alloc(0),this.escape=!1,this.start=!1}_transform(e,t,r){for(let t=0;t<e.length;t++){let r=e[t];if(r!==this.opts.START){if(null==this.opts.START&&(this.start=!0),this.escape)r===this.opts.ESC_START&&this.opts.START?r=this.opts.START:r===this.opts.ESC_ESC?r=this.opts.ESC:r===this.opts.ESC_END?r=this.opts.END:(this.escape=!1,this.push(this.buffer),this.buffer=Buffer.alloc(0));else{if(r===this.opts.ESC){this.escape=!0;continue}if(r===this.opts.END){this.push(this.buffer),this.buffer=Buffer.alloc(0),this.escape=!1,this.start=!1;continue}}this.escape=!1,this.start&&(this.buffer=Buffer.concat([this.buffer,Buffer.from([r])]))}else this.start=!0}r()}_flush(e){this.push(this.buffer),this.buffer=Buffer.alloc(0),e()}}u.SlipDecoder=g;var d={};Object.defineProperty(d,"__esModule",{value:!0}),d.SlipEncoder=void 0;const E=t;class b extends E.Transform{constructor(e={}){super(e);const{START:t,ESC:r=219,END:o=192,ESC_START:i,ESC_END:n=220,ESC_ESC:s=221,bluetoothQuirk:l=!1}=e;this.opts={START:t,ESC:r,END:o,ESC_START:i,ESC_END:n,ESC_ESC:s,bluetoothQuirk:l}}_transform(e,t,r){const o=e.length;if(this.opts.bluetoothQuirk&&0===o)return r();const i=Buffer.alloc(2*o+2);let n=0;1==this.opts.bluetoothQuirk&&(i[n++]=this.opts.END),void 0!==this.opts.START&&(i[n++]=this.opts.START);for(let t=0;t<o;t++){let r=e[t];r===this.opts.START&&this.opts.ESC_START?(i[n++]=this.opts.ESC,r=this.opts.ESC_START):r===this.opts.END?(i[n++]=this.opts.ESC,r=this.opts.ESC_END):r===this.opts.ESC&&(i[n++]=this.opts.ESC,r=this.opts.ESC_ESC),i[n++]=r}i[n++]=this.opts.END,r(null,i.slice(0,n))}}var p,m,T;function v(e){return null!==e&&"object"==typeof e}function S(e,t,r=".",o){if(!v(t))return S(e,{},r,o);const i=Object.assign({},t);for(const t in e){if("__proto__"===t||"constructor"===t)continue;const n=e[t];null!=n&&(o&&o(i,t,n,r)||(Array.isArray(n)&&Array.isArray(i[t])?i[t]=[...n,...i[t]]:v(n)&&v(i[t])?i[t]=S(n,i[t],(r?`${r}.`:"")+t.toString(),o):i[t]=n))}return i}d.SlipEncoder=b,p=h,m=c&&c.__createBinding||(Object.create?function(e,t,r,o){void 0===o&&(o=r);var i=Object.getOwnPropertyDescriptor(t,r);i&&!("get"in i?!t.__esModule:i.writable||i.configurable)||(i={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,o,i)}:function(e,t,r,o){void 0===o&&(o=r),e[o]=t[r]}),T=c&&c.__exportStar||function(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||m(t,e,r)},Object.defineProperty(p,"__esModule",{value:!0}),T(u,p),T(d,p);const R=(...e)=>e.reduce(((e,t)=>S(e,t,"",undefined)),{});const A=(e=0)=>t=>`[${t+e}m`,C=(e=0)=>t=>`[${38+e};5;${t}m`,O=(e=0)=>(t,r,o)=>`[${38+e};2;${t};${r};${o}m`,_={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};Object.keys(_.modifier),Object.keys(_.color),Object.keys(_.bgColor);const y=function(){const e=new Map;for(const[t,r]of Object.entries(_)){for(const[t,o]of Object.entries(r))_[t]={open:`[${o[0]}m`,close:`[${o[1]}m`},r[t]=_[t],e.set(o[0],o[1]);Object.defineProperty(_,t,{value:r,enumerable:!1})}return Object.defineProperty(_,"codes",{value:e,enumerable:!1}),_.color.close="[39m",_.bgColor.close="[49m",_.color.ansi=A(),_.color.ansi256=C(),_.color.ansi16m=O(),_.bgColor.ansi=A(10),_.bgColor.ansi256=C(10),_.bgColor.ansi16m=O(10),Object.defineProperties(_,{rgbToAnsi256:{value:(e,t,r)=>e===t&&t===r?e<8?16:e>248?231:Math.round((e-8)/247*24)+232:16+36*Math.round(e/255*5)+6*Math.round(t/255*5)+Math.round(r/255*5),enumerable:!1},hexToRgb:{value(e){const t=/[a-f\d]{6}|[a-f\d]{3}/i.exec(e.toString(16));if(!t)return[0,0,0];let[r]=t;3===r.length&&(r=[...r].map((e=>e+e)).join(""));const o=Number.parseInt(r,16);return[o>>16&255,o>>8&255,255&o]},enumerable:!1},hexToAnsi256:{value:e=>_.rgbToAnsi256(..._.hexToRgb(e)),enumerable:!1},ansi256ToAnsi:{value(e){if(e<8)return 30+e;if(e<16)return e-8+90;let t,r,o;if(e>=232)t=(10*(e-232)+8)/255,r=t,o=t;else{const i=(e-=16)%36;t=Math.floor(e/36)/5,r=Math.floor(i/6)/5,o=i%6/5}const i=2*Math.max(t,r,o);if(0===i)return 30;let n=30+(Math.round(o)<<2|Math.round(r)<<1|Math.round(t));return 2===i&&(n+=60),n},enumerable:!1},rgbToAnsi:{value:(e,t,r)=>_.ansi256ToAnsi(_.rgbToAnsi256(e,t,r)),enumerable:!1},hexToAnsi:{value:e=>_.ansi256ToAnsi(_.hexToAnsi256(e)),enumerable:!1}}),_}();function N(e,t=(globalThis.Deno?globalThis.Deno.args:o.argv)){const r=e.startsWith("-")?"":1===e.length?"-":"--",i=t.indexOf(r+e),n=t.indexOf("--");return-1!==i&&(-1===n||i<n)}const{env:D}=o;let I;function P(e,{streamIsTTY:t,sniffFlags:r=!0}={}){const n=function(){if("FORCE_COLOR"in D)return"true"===D.FORCE_COLOR?1:"false"===D.FORCE_COLOR?0:0===D.FORCE_COLOR.length?1:Math.min(Number.parseInt(D.FORCE_COLOR,10),3)}();void 0!==n&&(I=n);const s=r?I:n;if(0===s)return 0;if(r){if(N("color=16m")||N("color=full")||N("color=truecolor"))return 3;if(N("color=256"))return 2}if("TF_BUILD"in D&&"AGENT_NAME"in D)return 1;if(e&&!t&&void 0===s)return 0;const l=s||0;if("dumb"===D.TERM)return l;if("win32"===o.platform){const e=i.release().split(".");return Number(e[0])>=10&&Number(e[2])>=10586?Number(e[2])>=14931?3:2:1}if("CI"in D)return"GITHUB_ACTIONS"in D?3:["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","BUILDKITE","DRONE"].some((e=>e in D))||"codeship"===D.CI_NAME?1:l;if("TEAMCITY_VERSION"in D)return/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(D.TEAMCITY_VERSION)?1:0;if("truecolor"===D.COLORTERM)return 3;if("xterm-kitty"===D.TERM)return 3;if("TERM_PROGRAM"in D){const e=Number.parseInt((D.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(D.TERM_PROGRAM){case"iTerm.app":return e>=3?3:2;case"Apple_Terminal":return 2}}return/-256(color)?$/i.test(D.TERM)?2:/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(D.TERM)||"COLORTERM"in D?1:l}function w(e,t={}){return function(e){return 0!==e&&{level:e,hasBasic:!0,has256:e>=2,has16m:e>=3}}(P(e,{streamIsTTY:e&&e.isTTY,...t}))}N("no-color")||N("no-colors")||N("color=false")||N("color=never")?I=0:(N("color")||N("colors")||N("color=true")||N("color=always"))&&(I=1);const M={stdout:w({isTTY:n.isatty(1)}),stderr:w({isTTY:n.isatty(2)})};function L(e,t,r){let o=e.indexOf(t);if(-1===o)return e;const i=t.length;let n=0,s="";do{s+=e.slice(n,o)+t+r,n=o+i,o=e.indexOf(t,n)}while(-1!==o);return s+=e.slice(n),s}const{stdout:B,stderr:k}=M,G=Symbol("GENERATOR"),j=Symbol("STYLER"),x=Symbol("IS_EMPTY"),$=["ansi","ansi","ansi256","ansi16m"],Y=Object.create(null);function H(e){return(e=>{const t=(...e)=>e.join(" ");return((e,t={})=>{if(t.level&&!(Number.isInteger(t.level)&&t.level>=0&&t.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");const r=B?B.level:0;e.level=void 0===t.level?r:t.level})(t,e),Object.setPrototypeOf(t,H.prototype),t})(e)}Object.setPrototypeOf(H.prototype,Function.prototype);for(const[e,t]of Object.entries(y))Y[e]={get(){const r=W(this,K(t.open,t.close,this[j]),this[x]);return Object.defineProperty(this,e,{value:r}),r}};Y.visible={get(){const e=W(this,this[j],!0);return Object.defineProperty(this,"visible",{value:e}),e}};const F=(e,t,r,...o)=>"rgb"===e?"ansi16m"===t?y[r].ansi16m(...o):"ansi256"===t?y[r].ansi256(y.rgbToAnsi256(...o)):y[r].ansi(y.rgbToAnsi(...o)):"hex"===e?F("rgb",t,r,...y.hexToRgb(...o)):y[r][e](...o),U=["rgb","hex","ansi256"];for(const e of U)Y[e]={get(){const{level:t}=this;return function(...r){const o=K(F(e,$[t],"color",...r),y.color.close,this[j]);return W(this,o,this[x])}}},Y["bg"+e[0].toUpperCase()+e.slice(1)]={get(){const{level:t}=this;return function(...r){const o=K(F(e,$[t],"bgColor",...r),y.bgColor.close,this[j]);return W(this,o,this[x])}}};const V=Object.defineProperties((()=>{}),{...Y,level:{enumerable:!0,get(){return this[G].level},set(e){this[G].level=e}}}),K=(e,t,r)=>{let o,i;return void 0===r?(o=e,i=t):(o=r.openAll+e,i=t+r.closeAll),{open:e,close:t,openAll:o,closeAll:i,parent:r}},W=(e,t,r)=>{const o=(...e)=>Q(o,1===e.length?""+e[0]:e.join(" "));return Object.setPrototypeOf(o,V),o[G]=e,o[j]=t,o[x]=r,o},Q=(e,t)=>{if(e.level<=0||!t)return e[x]?"":t;let r=e[j];if(void 0===r)return t;const{openAll:o,closeAll:i}=r;if(t.includes(""))for(;void 0!==r;)t=L(t,r.close,r.open),r=r.parent;const n=t.indexOf("\n");return-1!==n&&(t=function(e,t,r,o){let i=0,n="";do{const s="\r"===e[o-1];n+=e.slice(i,s?o-1:o)+t+(s?"\r\n":"\n")+r,i=o+1,o=e.indexOf("\n",i)}while(-1!==o);return n+=e.slice(i),n}(t,i,o,n)),o+t+i};Object.defineProperties(H.prototype,Y);const X=H();H({level:k?k.level:0});const q={all:0,debug:1,deviceEvent:2,info:3,warn:4,error:5,fatal:98,none:99},z={host:"",logLevel:"all",prompt:" => ",showTime:!1,symbol:{debug:"dbg",info:"",deviceEvent:"",warn:"(!)",error:"[!]",fatal:"{x_X}"},terminal:!0},J={debug:X.gray,info:X.white,deviceEvent:X.green,warn:X.yellow,error:X.red,fatal:X.redBright};function Z(e,t){return r(e,{colors:!0,depth:t})}function ee(e){return r(e,{colors:!0,depth:2})}class te{_debug=()=>{};_info=()=>{};_deviceEvent=()=>{};_warn=()=>{};_error=()=>{};_fatal=()=>{};_defaultLogger(e,t){console.log(e)}prompt=" => ";host="";logLevel="all";terminal=!0;showTime=!1;showMillis=!1;get time(){const e=new Date;let t="",r="",o="";e.getHours()<10&&(t="0"),e.getMinutes()<10&&(r="0"),e.getSeconds()<10&&(o="0"),t+=e.getHours(),r+=e.getMinutes(),o+=e.getSeconds();let i=t+":"+r+":"+o;return this.showMillis&&(i+=":"+e.getMilliseconds()),X.grey(i)}ps(e){let t="";return!0===this.showTime&&(t+=this.time+" "),""!==this.symbol[e]&&(t+=J[e](this.symbol[e])+" "),t+=J[e](this.host)+this.prompt,t}symbol;assignOptions(e,t){for(const r in t)"object"!=typeof e[r]?e[r]=t[r]||e[r]:this.assignOptions(e[r],t[r])}getLevelLoggers(){return{debug:this._debug,info:this._info,deviceEvent:this._deviceEvent,warn:this._warn,error:this._error,fatal:this._fatal}}logger=this._defaultLogger;resetLogger(){this.logger=this._defaultLogger}constructor(e=z){const t=R(e,z);this.assignOptions(this,t),this.spawnLevelLoggers()}spawnLevelLoggers(){for(let e in this.symbol){let t=e;this["_"+e]=e=>{let r=`${this.ps(t)}${o=e,"string"==typeof o?o:ee(o)}`;var o;return q[this.logLevel]<=q[t]&&this.logger(r,t),r}}}}const re=/(^|[/\\])([^/\\]+?)(?=(\.[^.]+)?$)/;let oe,ie,ne=(e=21)=>{var t;t=e-=0,!oe||oe.length<t?(oe=Buffer.allocUnsafe(128*t),a(oe),ie=0):ie+t>oe.length&&(a(oe),ie=0),ie+=t;let r="";for(let t=ie-e;t<ie;t++)r+="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"[63&oe[t]];return r};const se=(e=0)=>t=>`[${t+e}m`,le=(e=0)=>t=>`[${38+e};5;${t}m`,ae=(e=0)=>(t,r,o)=>`[${38+e};2;${t};${r};${o}m`,ce={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};Object.keys(ce.modifier);Object.keys(ce.color),Object.keys(ce.bgColor);const he=function(){const e=new Map;for(const[t,r]of Object.entries(ce)){for(const[t,o]of Object.entries(r))ce[t]={open:`[${o[0]}m`,close:`[${o[1]}m`},r[t]=ce[t],e.set(o[0],o[1]);Object.defineProperty(ce,t,{value:r,enumerable:!1})}return Object.defineProperty(ce,"codes",{value:e,enumerable:!1}),ce.color.close="[39m",ce.bgColor.close="[49m",ce.color.ansi=se(),ce.color.ansi256=le(),ce.color.ansi16m=ae(),ce.bgColor.ansi=se(10),ce.bgColor.ansi256=le(10),ce.bgColor.ansi16m=ae(10),Object.defineProperties(ce,{rgbToAnsi256:{value:(e,t,r)=>e===t&&t===r?e<8?16:e>248?231:Math.round((e-8)/247*24)+232:16+36*Math.round(e/255*5)+6*Math.round(t/255*5)+Math.round(r/255*5),enumerable:!1},hexToRgb:{value(e){const t=/[a-f\d]{6}|[a-f\d]{3}/i.exec(e.toString(16));if(!t)return[0,0,0];let[r]=t;3===r.length&&(r=[...r].map((e=>e+e)).join(""));const o=Number.parseInt(r,16);return[o>>16&255,o>>8&255,255&o]},enumerable:!1},hexToAnsi256:{value:e=>ce.rgbToAnsi256(...ce.hexToRgb(e)),enumerable:!1},ansi256ToAnsi:{value(e){if(e<8)return 30+e;if(e<16)return e-8+90;let t,r,o;if(e>=232)t=(10*(e-232)+8)/255,r=t,o=t;else{const i=(e-=16)%36;t=Math.floor(e/36)/5,r=Math.floor(i/6)/5,o=i%6/5}const i=2*Math.max(t,r,o);if(0===i)return 30;let n=30+(Math.round(o)<<2|Math.round(r)<<1|Math.round(t));return 2===i&&(n+=60),n},enumerable:!1},rgbToAnsi:{value:(e,t,r)=>ce.ansi256ToAnsi(ce.rgbToAnsi256(e,t,r)),enumerable:!1},hexToAnsi:{value:e=>ce.ansi256ToAnsi(ce.hexToAnsi256(e)),enumerable:!1}}),ce}();function ue(e,t=(globalThis.Deno?globalThis.Deno.args:o.argv)){const r=e.startsWith("-")?"":1===e.length?"-":"--",i=t.indexOf(r+e),n=t.indexOf("--");return-1!==i&&(-1===n||i<n)}const{env:fe}=o;let ge;function de(e,{streamIsTTY:t,sniffFlags:r=!0}={}){const n=function(){if("FORCE_COLOR"in fe)return"true"===fe.FORCE_COLOR?1:"false"===fe.FORCE_COLOR?0:0===fe.FORCE_COLOR.length?1:Math.min(Number.parseInt(fe.FORCE_COLOR,10),3)}();void 0!==n&&(ge=n);const s=r?ge:n;if(0===s)return 0;if(r){if(ue("color=16m")||ue("color=full")||ue("color=truecolor"))return 3;if(ue("color=256"))return 2}if("TF_BUILD"in fe&&"AGENT_NAME"in fe)return 1;if(e&&!t&&void 0===s)return 0;const l=s||0;if("dumb"===fe.TERM)return l;if("win32"===o.platform){const e=i.release().split(".");return Number(e[0])>=10&&Number(e[2])>=10586?Number(e[2])>=14931?3:2:1}if("CI"in fe)return"GITHUB_ACTIONS"in fe?3:["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","BUILDKITE","DRONE"].some((e=>e in fe))||"codeship"===fe.CI_NAME?1:l;if("TEAMCITY_VERSION"in fe)return/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(fe.TEAMCITY_VERSION)?1:0;if("truecolor"===fe.COLORTERM)return 3;if("xterm-kitty"===fe.TERM)return 3;if("TERM_PROGRAM"in fe){const e=Number.parseInt((fe.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(fe.TERM_PROGRAM){case"iTerm.app":return e>=3?3:2;case"Apple_Terminal":return 2}}return/-256(color)?$/i.test(fe.TERM)?2:/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(fe.TERM)||"COLORTERM"in fe?1:l}function Ee(e,t={}){return function(e){return 0!==e&&{level:e,hasBasic:!0,has256:e>=2,has16m:e>=3}}(de(e,{streamIsTTY:e&&e.isTTY,...t}))}ue("no-color")||ue("no-colors")||ue("color=false")||ue("color=never")?ge=0:(ue("color")||ue("colors")||ue("color=true")||ue("color=always"))&&(ge=1);const be={stdout:Ee({isTTY:n.isatty(1)}),stderr:Ee({isTTY:n.isatty(2)})};function pe(e,t,r){let o=e.indexOf(t);if(-1===o)return e;const i=t.length;let n=0,s="";do{s+=e.slice(n,o)+t+r,n=o+i,o=e.indexOf(t,n)}while(-1!==o);return s+=e.slice(n),s}const{stdout:me,stderr:Te}=be,ve=Symbol("GENERATOR"),Se=Symbol("STYLER"),Re=Symbol("IS_EMPTY"),Ae=["ansi","ansi","ansi256","ansi16m"],Ce=Object.create(null),Oe=e=>{const t=(...e)=>e.join(" ");return((e,t={})=>{if(t.level&&!(Number.isInteger(t.level)&&t.level>=0&&t.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");const r=me?me.level:0;e.level=void 0===t.level?r:t.level})(t,e),Object.setPrototypeOf(t,_e.prototype),t};function _e(e){return Oe(e)}Object.setPrototypeOf(_e.prototype,Function.prototype);for(const[e,t]of Object.entries(he))Ce[e]={get(){const r=Pe(this,Ie(t.open,t.close,this[Se]),this[Re]);return Object.defineProperty(this,e,{value:r}),r}};Ce.visible={get(){const e=Pe(this,this[Se],!0);return Object.defineProperty(this,"visible",{value:e}),e}};const ye=(e,t,r,...o)=>"rgb"===e?"ansi16m"===t?he[r].ansi16m(...o):"ansi256"===t?he[r].ansi256(he.rgbToAnsi256(...o)):he[r].ansi(he.rgbToAnsi(...o)):"hex"===e?ye("rgb",t,r,...he.hexToRgb(...o)):he[r][e](...o),Ne=["rgb","hex","ansi256"];for(const e of Ne){Ce[e]={get(){const{level:t}=this;return function(...r){const o=Ie(ye(e,Ae[t],"color",...r),he.color.close,this[Se]);return Pe(this,o,this[Re])}}};Ce["bg"+e[0].toUpperCase()+e.slice(1)]={get(){const{level:t}=this;return function(...r){const o=Ie(ye(e,Ae[t],"bgColor",...r),he.bgColor.close,this[Se]);return Pe(this,o,this[Re])}}}}const De=Object.defineProperties((()=>{}),{...Ce,level:{enumerable:!0,get(){return this[ve].level},set(e){this[ve].level=e}}}),Ie=(e,t,r)=>{let o,i;return void 0===r?(o=e,i=t):(o=r.openAll+e,i=t+r.closeAll),{open:e,close:t,openAll:o,closeAll:i,parent:r}},Pe=(e,t,r)=>{const o=(...e)=>we(o,1===e.length?""+e[0]:e.join(" "));return Object.setPrototypeOf(o,De),o[ve]=e,o[Se]=t,o[Re]=r,o},we=(e,t)=>{if(e.level<=0||!t)return e[Re]?"":t;let r=e[Se];if(void 0===r)return t;const{openAll:o,closeAll:i}=r;if(t.includes(""))for(;void 0!==r;)t=pe(t,r.close,r.open),r=r.parent;const n=t.indexOf("\n");return-1!==n&&(t=function(e,t,r,o){let i=0,n="";do{const s="\r"===e[o-1];n+=e.slice(i,s?o-1:o)+t+(s?"\r\n":"\n")+r,i=o+1,o=e.indexOf("\n",i)}while(-1!==o);return n+=e.slice(i),n}(t,i,o,n)),o+t+i};Object.defineProperties(_e.prototype,Ce);const Me=_e();function Le(e){return null!==e&&"object"==typeof e}function Be(e,t,r=".",o){if(!Le(t))return Be(e,{},r,o);const i=Object.assign({},t);for(const t in e){if("__proto__"===t||"constructor"===t)continue;const n=e[t];null!=n&&(o&&o(i,t,n,r)||(Array.isArray(n)&&Array.isArray(i[t])?i[t]=[...n,...i[t]]:Le(n)&&Le(i[t])?i[t]=Be(n,i[t],(r?`${r}.`:"")+t.toString(),o):i[t]=n))}return i}_e({level:Te?Te.level:0});const ke=(...e)=>e.reduce(((e,t)=>Be(e,t,"",Ge)),{});var Ge;let je=0;var xe;!function(e){e[e.PING=0]="PING",e[e.ACK=1]="ACK",e[e.READY=2]="READY",e[e.STATE_UPDATE=3]="STATE_UPDATE",e[e.ERROR=4]="ERROR",e[e.STRING=5]="STRING",e[e.DISCONNECT=6]="DISCONNECT"}(xe||(xe={}));const $e={portInfo:{},logLevel:"all",id:"",showTime:!1};class Ye extends s{serialPort;slipEncoder=new h.SlipEncoder(Ke);slipDecoder=new h.SlipDecoder(Ke);_prevAckTime=0;prevState={buttons:[!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1],dials:[0,0,0,0],dialsRelative:[0,0,0,0]};_deviceReady=!1;_id="";_portInfo=null;_msger;keepAliveTimer;get prevAckTime(){return this._prevAckTime}get isOpen(){return void 0!==this.serialPort&&this.serialPort.isOpen}static get connectedDevices(){return je}get devicePath(){return null!==this._portInfo?this._portInfo.path:""}get deviceSerial(){return null!==this._portInfo?this._portInfo.serialNumber:""}get fingerPrint(){return{devicePath:this.devicePath,deviceSerial:this.deviceSerial,portId:this.portId}}get portInfo(){return this._portInfo}get portId(){return this._id}log;debug;deviceEvent;info;warn;error;fatal;get host(){let e=`Port:${Me.magenta(this.deviceSerial.slice(0,4))}|`;var t;return this.isOpen?e+=Me.green((t=this.devicePath,t.match(re)?.[2])):e+=Me.yellow("D/C"),e}_logLevel="all";get showTime(){return this._msger.showTime}set showTime(e){this._msger.showTime=e}get logLevel(){return this._logLevel}set logLevel(e){this._logLevel=e,this._msger.logLevel=e}get logTermFormat(){return this._msger.terminal}set logTermFormat(e){this._msger.terminal=e}emitLog=(e,t)=>{this.emit(He.Terminal.Log[t],{level:t,message:e,buffer:l.from(e)})};constructor(e){super();const t=ke(e,$e);this._id=""===t.id?ne(23):t.id,this._portInfo=t.portInfo,this._msger=new te,this._msger.host=this.host,this._msger.showTime=t.showTime,this.log=this._msger.getLevelLoggers(),this.logLevel=t.logLevel;for(const e in this.log)this[e]=t=>{const r=this.log[e](t);this.emitLog(r,e)};this.debug("Creating new MakeShiftPort with options: "+ee(t)),this.slipDecoder.on("data",(e=>{this.parseSlipPacketHeader(e)})),this.open()}parseSlipPacketHeader(e){this._prevAckTime=Date.now();const t=e.subarray(0,1).at(0),r=e.subarray(1);switch(this.debug(e),t){case xe.STATE_UPDATE:{let e=Ye.parseStateFromBuffer(r);this.emit(He.DEVICE.STATE_UPDATE,e),this.handleStateUpdate(e);break}case xe.ACK:this.debug("Got ACK from MakeShift");break;case xe.STRING:this.debug(r.toString());break;case xe.PING:this.debug("Got PING from MakeShift, responding with ACK"),this.sendByte(xe.ACK);break;case xe.ERROR:this.debug("Got ERROR from MakeShift");break;case xe.READY:this.debug("Got READY from MakeShift"),this.debug(r.toString()),je++,this._deviceReady=!0,this._prevAckTime=Date.now(),this.deviceEvent("Device connection established"),this.emit(He.DEVICE.CONNECTED,this.fingerPrint);break;default:this.debug(t),this.debug(e.toString())}}ping(){this.sendByte(xe.PING)}handleStateUpdate(e){for(let t=0;t<Ue;t++)if(e.buttons[t]!=this.prevState.buttons[t]){let r;r=!0===e.buttons[t]?He.BUTTON[t].PRESSED:He.BUTTON[t].RELEASED,this.emit(r,{state:e,event:r}),this.deviceEvent(`${r} with state ${e.buttons[t]}`)}for(let t=0;t<Ve;t++)if(e.dials[t],this.prevState.dials[t],0!==e.dialsRelative[t]){let r;this.emit(He.DIAL[t].CHANGE,{state:e,event:r}),r=e.dialsRelative[t]>0?He.DIAL[t].INCREMENT:He.DIAL[t].DECREMENT,this.emit(r,{state:e,event:r}),this.deviceEvent(`${r} with state ${e.dials[t]}`)}this.prevState=e}sendByte(e){if(this.isOpen)try{this.serialPort.flush();let t=l.from([e]);this.debug(`Sending byte: ${ee(t)}`),this.slipEncoder.write(t)}catch(e){this.error(e)}}send(e,t){if(this.isOpen)try{this.serialPort.flush();let r=l.from([e]),o=l.from(t);const i=l.concat([r,o]);this.debug(`Sending buffer: ${ee(i)}`),this.slipEncoder.write(i)}catch(e){this.error(e)}}static parseStateFromBuffer(e){let t={buttons:[],dials:[],dialsRelative:[]};const r=e.subarray(0,2).reverse(),o=e.subarray(2,6),i=e.subarray(6);function n(e,r){0!==r&&(e%2?t.buttons.push(!0):t.buttons.push(!1),n(Math.floor(e/2),r-1))}r.forEach((e=>n(e,8)));for(let e=0;e<4;e++)t.dialsRelative.push(o.readInt8(e));return t.dials.push(i.readInt32BE(0)),t.dials.push(i.readInt32BE(4)),t.dials.push(i.readInt32BE(8)),t.dials.push(i.readInt32BE(12)),t}async open(){this.serialPort=await new e({path:this.devicePath,baudRate:42069},(e=>{null!=e?(this.error("Something happened while opening port: "),this.error(e)):(this._msger.host=this.host,this.info("SerialPort opened, attaching SLIP translators"),this.slipEncoder.pipe(this.serialPort),this.serialPort.pipe(this.slipDecoder),this.info("Translators ready, sending READY to MakeShift"),this.sendByte(xe.READY))}))}close(){this.info("Closing MakeShift port..."),this.info("Unpiping encoders"),this.slipEncoder.unpipe(),this.serialPort.unpipe(),this.isOpen&&(this.info("Port object found open"),this.info("Sending disconnect packet"),this.sendByte(xe.DISCONNECT),this.info("Closing port"),this.serialPort.close()),this._msger.host=this.host,je--,this._deviceReady=!1,this.warn("Port closed, sending disconnect signal"),this.emit(He.DEVICE.DISCONNECTED,this.fingerPrint)}write=e=>{this._deviceReady?this.send(xe.STRING,e):this.info("MakeShift not ready, line not sent")}}const He={DIAL:[{INCREMENT:"dial-01-increment",DECREMENT:"dial-01-decrement",CHANGE:"dial-01-change"},{INCREMENT:"dial-02-increment",DECREMENT:"dial-02-decrement",CHANGE:"dial-02-change"},{INCREMENT:"dial-03-increment",DECREMENT:"dial-03-decrement",CHANGE:"dial-03-change"},{INCREMENT:"dial-04-increment",DECREMENT:"dial-04-decrement",CHANGE:"dial-04-change"}],BUTTON:[{PRESSED:"button-01-rise",RELEASED:"button-01-fall",CHANGE:"button-01-change"},{PRESSED:"button-02-rise",RELEASED:"button-02-fall",CHANGE:"button-02-change"},{PRESSED:"button-03-rise",RELEASED:"button-03-fall",CHANGE:"button-03-change"},{PRESSED:"button-04-rise",RELEASED:"button-04-fall",CHANGE:"button-04-change"},{PRESSED:"button-05-rise",RELEASED:"button-05-fall",CHANGE:"button-05-change"},{PRESSED:"button-06-rise",RELEASED:"button-06-fall",CHANGE:"button-06-change"},{PRESSED:"button-07-rise",RELEASED:"button-07-fall",CHANGE:"button-07-change"},{PRESSED:"button-08-rise",RELEASED:"button-08-fall",CHANGE:"button-08-change"},{PRESSED:"button-09-rise",RELEASED:"button-09-fall",CHANGE:"button-09-change"},{PRESSED:"button-10-rise",RELEASED:"button-10-fall",CHANGE:"button-10-change"},{PRESSED:"button-11-rise",RELEASED:"button-11-fall",CHANGE:"button-11-change"},{PRESSED:"button-12-rise",RELEASED:"button-12-fall",CHANGE:"button-12-change"},{PRESSED:"button-13-rise",RELEASED:"button-13-fall",CHANGE:"button-13-change"},{PRESSED:"button-14-rise",RELEASED:"button-14-fall",CHANGE:"button-14-change"},{PRESSED:"button-15-rise",RELEASED:"button-15-fall",CHANGE:"button-15-change"},{PRESSED:"button-16-rise",RELEASED:"button-16-fall",CHANGE:"button-16-change"}],DEVICE:{DISCONNECTED:"makeshift-disconnect",CONNECTED:"makeshift-connect",STATE_UPDATE:"state-update"},Terminal:{Log:{fatal:"makeshift-serial-log-fatal",error:"makeshift-serial-log-error",warn:"makeshift-serial-log-warn",deviceEvent:"makeshift-serial-log-event",info:"makeshift-serial-log-info",debug:"makeshift-serial-log-debug",all:"makeshift-serial-log-any"}}};const Fe=function e(t){const r=[];for(const o in t){if("string"==typeof t[o])return t[o];{const i=e(t[o]);Array.isArray(i)?r.push(...i):r.push(i)}}return r}(He),Ue=He.BUTTON.length,Ve=He.DIAL.length,Ke={ESC:219,END:192,ESC_END:220,ESC_ESC:221},We={};let Qe=[];const Xe=new s;let qe="info",ze=!1,Je=!0,Ze=1e3,et=5e3,tt=1500;const rt={},ot=new te({host:"PortAuthority",logLevel:"info",showTime:!1});ot.logLevel=qe,ot.showTime=ze;const it=ot.getLevelLoggers();function nt(){Je=!0,gt()}function st(){Je=!1}function lt(){Je=!1,Et()}function at(){return Qe}function ct(e){ze=e,ot.showTime=e;for(const t in We)We[t].showTime=e}function ht(e){qe=e,ot.logLevel=e;for(const t in We)We[t].logLevel=e}function ut(e,t){void 0!==We[e]&&(We[e].logLevel=t)}function ft(e){ot.logLevel=e}function gt(){setTimeout((()=>{Et()}),Ze),Xe.emit(bt.scan.started)}function dt(e){rt[e]=setTimeout((()=>{!function(e){const t=Date.now()-We[e].prevAckTime;it.debug(`elapsedTime since prevAckTime: ${t}`),t>et?(clearTimeout(rt[e]),it.debug(`Timer handle - ${rt[e]}`),it.warn(`Device ${e}::${We[e].devicePath} unresponsive for ${et}ms, disconnecting`),function(e){if(void 0===We[e])return;const t=We[e].fingerPrint;Qe=Qe.filter((e=>t.devicePath!==e.devicePath&&t.deviceSerial!==e.deviceSerial)),We[e].close(),delete We[e],Xe.emit(bt.port.closed,t)}(e)):(t>=tt-40&&We[e].ping(),dt(e))}(e)}),tt)}async function Et(){it.debug(`scanForDevice called with autoscan set to ${Je}`);try{const t=await e.list();t.forEach((e=>{it.debug(Z(e,1))}));const r=t.filter((e=>("16c0"===e.vendorId||"16C0"===e.vendorId)&&"0483"===e.productId));it.debug(`Found MakeShift devices: ${ee(r)}`),r.length>0&&r.forEach((e=>{!function(e){const t=e.path;for(const e in We)if(We[e].devicePath===t)return;const r=e.serialNumber,o={portInfo:e,id:r,logLevel:qe,showTime:ze};it.info(`Opening device with options: '${Z(o,1)}'`),We[r]=new Ye(o);const i=We[r].fingerPrint;Qe.push(i),We[r].ping(),dt(r),it.deviceEvent(`Opened port: ${i.deviceSerial} | ${i.devicePath}`),Xe.emit(bt.port.opened,i)}(e)})),Je?gt():Xe.emit(bt.scan.stopped)}catch(e){it.error(e)}}const bt={port:{opened:"makeshift-pa-port-opened",closed:"makeshift-pa-port-closed"},scan:{started:"makeshift-pa-scan-started",stopped:"makeshift-pa-scan-stopped"}};export{He as DeviceEvents,Fe as DeviceEventsFlat,Ye as MakeShiftPort,te as Msg,xe as PacketType,Xe as PortAuthority,bt as PortAuthorityEvents,We as Ports,$e as defaultMakeShiftPortOptions,at as getPortFingerPrintSnapShot,ee as nspct2,Z as nspect,Ze as scanDelayMs,lt as scanOnce,ht as setLogLevel,ft as setPortAuthorityLogLevel,ut as setPortLogLevel,ct as setShowTime,nt as startAutoScan,st as stopAutoScan};
