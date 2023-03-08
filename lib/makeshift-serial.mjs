import{SerialPort as e}from"serialport";import t from"stream";import{inspect as o}from"node:util";import r from"node:process";import n from"node:os";import i from"node:tty";import{EventEmitter as s}from"node:events";import{Buffer as l}from"node:buffer";import{randomFillSync as a}from"crypto";var c="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},h={},u={};Object.defineProperty(u,"__esModule",{value:!0}),u.SlipDecoder=void 0;const f=t;class g extends f.Transform{constructor(e={}){super(e);const{START:t,ESC:o=219,END:r=192,ESC_START:n,ESC_END:i=220,ESC_ESC:s=221}=e;this.opts={START:t,ESC:o,END:r,ESC_START:n,ESC_END:i,ESC_ESC:s},this.buffer=Buffer.alloc(0),this.escape=!1,this.start=!1}_transform(e,t,o){for(let t=0;t<e.length;t++){let o=e[t];if(o!==this.opts.START){if(null==this.opts.START&&(this.start=!0),this.escape)o===this.opts.ESC_START&&this.opts.START?o=this.opts.START:o===this.opts.ESC_ESC?o=this.opts.ESC:o===this.opts.ESC_END?o=this.opts.END:(this.escape=!1,this.push(this.buffer),this.buffer=Buffer.alloc(0));else{if(o===this.opts.ESC){this.escape=!0;continue}if(o===this.opts.END){this.push(this.buffer),this.buffer=Buffer.alloc(0),this.escape=!1,this.start=!1;continue}}this.escape=!1,this.start&&(this.buffer=Buffer.concat([this.buffer,Buffer.from([o])]))}else this.start=!0}o()}_flush(e){this.push(this.buffer),this.buffer=Buffer.alloc(0),e()}}u.SlipDecoder=g;var d={};Object.defineProperty(d,"__esModule",{value:!0}),d.SlipEncoder=void 0;const E=t;class b extends E.Transform{constructor(e={}){super(e);const{START:t,ESC:o=219,END:r=192,ESC_START:n,ESC_END:i=220,ESC_ESC:s=221,bluetoothQuirk:l=!1}=e;this.opts={START:t,ESC:o,END:r,ESC_START:n,ESC_END:i,ESC_ESC:s,bluetoothQuirk:l}}_transform(e,t,o){const r=e.length;if(this.opts.bluetoothQuirk&&0===r)return o();const n=Buffer.alloc(2*r+2);let i=0;1==this.opts.bluetoothQuirk&&(n[i++]=this.opts.END),void 0!==this.opts.START&&(n[i++]=this.opts.START);for(let t=0;t<r;t++){let o=e[t];o===this.opts.START&&this.opts.ESC_START?(n[i++]=this.opts.ESC,o=this.opts.ESC_START):o===this.opts.END?(n[i++]=this.opts.ESC,o=this.opts.ESC_END):o===this.opts.ESC&&(n[i++]=this.opts.ESC,o=this.opts.ESC_ESC),n[i++]=o}n[i++]=this.opts.END,o(null,n.slice(0,i))}}var p,m,T;function v(e){return null!==e&&"object"==typeof e}function S(e,t,o=".",r){if(!v(t))return S(e,{},o,r);const n=Object.assign({},t);for(const t in e){if("__proto__"===t||"constructor"===t)continue;const i=e[t];null!=i&&(r&&r(n,t,i,o)||(Array.isArray(i)&&Array.isArray(n[t])?n[t]=[...i,...n[t]]:v(i)&&v(n[t])?n[t]=S(i,n[t],(o?`${o}.`:"")+t.toString(),r):n[t]=i))}return n}d.SlipEncoder=b,p=h,m=c&&c.__createBinding||(Object.create?function(e,t,o,r){void 0===r&&(r=o),Object.defineProperty(e,r,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,r){void 0===r&&(r=o),e[r]=t[o]}),T=c&&c.__exportStar||function(e,t){for(var o in e)"default"===o||Object.prototype.hasOwnProperty.call(t,o)||m(t,e,o)},Object.defineProperty(p,"__esModule",{value:!0}),T(u,p),T(d,p);const R=(...e)=>e.reduce(((e,t)=>S(e,t,"",undefined)),{});const A=(e=0)=>t=>`[${t+e}m`,C=(e=0)=>t=>`[${38+e};5;${t}m`,O=(e=0)=>(t,o,r)=>`[${38+e};2;${t};${o};${r}m`,_={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};Object.keys(_.modifier),Object.keys(_.color),Object.keys(_.bgColor);const y=function(){const e=new Map;for(const[t,o]of Object.entries(_)){for(const[t,r]of Object.entries(o))_[t]={open:`[${r[0]}m`,close:`[${r[1]}m`},o[t]=_[t],e.set(r[0],r[1]);Object.defineProperty(_,t,{value:o,enumerable:!1})}return Object.defineProperty(_,"codes",{value:e,enumerable:!1}),_.color.close="[39m",_.bgColor.close="[49m",_.color.ansi=A(),_.color.ansi256=C(),_.color.ansi16m=O(),_.bgColor.ansi=A(10),_.bgColor.ansi256=C(10),_.bgColor.ansi16m=O(10),Object.defineProperties(_,{rgbToAnsi256:{value:(e,t,o)=>e===t&&t===o?e<8?16:e>248?231:Math.round((e-8)/247*24)+232:16+36*Math.round(e/255*5)+6*Math.round(t/255*5)+Math.round(o/255*5),enumerable:!1},hexToRgb:{value(e){const t=/[a-f\d]{6}|[a-f\d]{3}/i.exec(e.toString(16));if(!t)return[0,0,0];let[o]=t;3===o.length&&(o=[...o].map((e=>e+e)).join(""));const r=Number.parseInt(o,16);return[r>>16&255,r>>8&255,255&r]},enumerable:!1},hexToAnsi256:{value:e=>_.rgbToAnsi256(..._.hexToRgb(e)),enumerable:!1},ansi256ToAnsi:{value(e){if(e<8)return 30+e;if(e<16)return e-8+90;let t,o,r;if(e>=232)t=(10*(e-232)+8)/255,o=t,r=t;else{const n=(e-=16)%36;t=Math.floor(e/36)/5,o=Math.floor(n/6)/5,r=n%6/5}const n=2*Math.max(t,o,r);if(0===n)return 30;let i=30+(Math.round(r)<<2|Math.round(o)<<1|Math.round(t));return 2===n&&(i+=60),i},enumerable:!1},rgbToAnsi:{value:(e,t,o)=>_.ansi256ToAnsi(_.rgbToAnsi256(e,t,o)),enumerable:!1},hexToAnsi:{value:e=>_.ansi256ToAnsi(_.hexToAnsi256(e)),enumerable:!1}}),_}();function D(e,t=(globalThis.Deno?globalThis.Deno.args:r.argv)){const o=e.startsWith("-")?"":1===e.length?"-":"--",n=t.indexOf(o+e),i=t.indexOf("--");return-1!==n&&(-1===i||n<i)}const{env:N}=r;let I;function P(e,{streamIsTTY:t,sniffFlags:o=!0}={}){const i=function(){if("FORCE_COLOR"in N)return"true"===N.FORCE_COLOR?1:"false"===N.FORCE_COLOR?0:0===N.FORCE_COLOR.length?1:Math.min(Number.parseInt(N.FORCE_COLOR,10),3)}();void 0!==i&&(I=i);const s=o?I:i;if(0===s)return 0;if(o){if(D("color=16m")||D("color=full")||D("color=truecolor"))return 3;if(D("color=256"))return 2}if("TF_BUILD"in N&&"AGENT_NAME"in N)return 1;if(e&&!t&&void 0===s)return 0;const l=s||0;if("dumb"===N.TERM)return l;if("win32"===r.platform){const e=n.release().split(".");return Number(e[0])>=10&&Number(e[2])>=10586?Number(e[2])>=14931?3:2:1}if("CI"in N)return"GITHUB_ACTIONS"in N?3:["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","BUILDKITE","DRONE"].some((e=>e in N))||"codeship"===N.CI_NAME?1:l;if("TEAMCITY_VERSION"in N)return/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(N.TEAMCITY_VERSION)?1:0;if("truecolor"===N.COLORTERM)return 3;if("xterm-kitty"===N.TERM)return 3;if("TERM_PROGRAM"in N){const e=Number.parseInt((N.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(N.TERM_PROGRAM){case"iTerm.app":return e>=3?3:2;case"Apple_Terminal":return 2}}return/-256(color)?$/i.test(N.TERM)?2:/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(N.TERM)||"COLORTERM"in N?1:l}function w(e,t={}){return function(e){return 0!==e&&{level:e,hasBasic:!0,has256:e>=2,has16m:e>=3}}(P(e,{streamIsTTY:e&&e.isTTY,...t}))}D("no-color")||D("no-colors")||D("color=false")||D("color=never")?I=0:(D("color")||D("colors")||D("color=true")||D("color=always"))&&(I=1);const M={stdout:w({isTTY:i.isatty(1)}),stderr:w({isTTY:i.isatty(2)})};function L(e,t,o){let r=e.indexOf(t);if(-1===r)return e;const n=t.length;let i=0,s="";do{s+=e.slice(i,r)+t+o,i=r+n,r=e.indexOf(t,i)}while(-1!==r);return s+=e.slice(i),s}const{stdout:B,stderr:k}=M,G=Symbol("GENERATOR"),j=Symbol("STYLER"),x=Symbol("IS_EMPTY"),$=["ansi","ansi","ansi256","ansi16m"],Y=Object.create(null);function H(e){return(e=>{const t=(...e)=>e.join(" ");return((e,t={})=>{if(t.level&&!(Number.isInteger(t.level)&&t.level>=0&&t.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");const o=B?B.level:0;e.level=void 0===t.level?o:t.level})(t,e),Object.setPrototypeOf(t,H.prototype),t})(e)}Object.setPrototypeOf(H.prototype,Function.prototype);for(const[e,t]of Object.entries(y))Y[e]={get(){const o=W(this,K(t.open,t.close,this[j]),this[x]);return Object.defineProperty(this,e,{value:o}),o}};Y.visible={get(){const e=W(this,this[j],!0);return Object.defineProperty(this,"visible",{value:e}),e}};const F=(e,t,o,...r)=>"rgb"===e?"ansi16m"===t?y[o].ansi16m(...r):"ansi256"===t?y[o].ansi256(y.rgbToAnsi256(...r)):y[o].ansi(y.rgbToAnsi(...r)):"hex"===e?F("rgb",t,o,...y.hexToRgb(...r)):y[o][e](...r),U=["rgb","hex","ansi256"];for(const e of U)Y[e]={get(){const{level:t}=this;return function(...o){const r=K(F(e,$[t],"color",...o),y.color.close,this[j]);return W(this,r,this[x])}}},Y["bg"+e[0].toUpperCase()+e.slice(1)]={get(){const{level:t}=this;return function(...o){const r=K(F(e,$[t],"bgColor",...o),y.bgColor.close,this[j]);return W(this,r,this[x])}}};const V=Object.defineProperties((()=>{}),{...Y,level:{enumerable:!0,get(){return this[G].level},set(e){this[G].level=e}}}),K=(e,t,o)=>{let r,n;return void 0===o?(r=e,n=t):(r=o.openAll+e,n=t+o.closeAll),{open:e,close:t,openAll:r,closeAll:n,parent:o}},W=(e,t,o)=>{const r=(...e)=>Q(r,1===e.length?""+e[0]:e.join(" "));return Object.setPrototypeOf(r,V),r[G]=e,r[j]=t,r[x]=o,r},Q=(e,t)=>{if(e.level<=0||!t)return e[x]?"":t;let o=e[j];if(void 0===o)return t;const{openAll:r,closeAll:n}=o;if(t.includes(""))for(;void 0!==o;)t=L(t,o.close,o.open),o=o.parent;const i=t.indexOf("\n");return-1!==i&&(t=function(e,t,o,r){let n=0,i="";do{const s="\r"===e[r-1];i+=e.slice(n,s?r-1:r)+t+(s?"\r\n":"\n")+o,n=r+1,r=e.indexOf("\n",n)}while(-1!==r);return i+=e.slice(n),i}(t,n,r,i)),r+t+n};Object.defineProperties(H.prototype,Y);const X=H();H({level:k?k.level:0});const q={all:0,debug:1,deviceEvent:2,info:3,warn:4,error:5,fatal:98,none:99},z={host:"",logLevel:"all",prompt:" => ",showTime:!1,symbol:{debug:"dbg",info:"",deviceEvent:"",warn:"(!)",error:"[!]",fatal:"{x_X}"},terminal:!0},J={debug:X.gray,info:X.white,deviceEvent:X.green,warn:X.yellow,error:X.red,fatal:X.redBright};function Z(e,t){return o(e,{colors:!0,depth:t})}function ee(e){return o(e,{colors:!0,depth:2})}class te{_debug=()=>{};_info=()=>{};_deviceEvent=()=>{};_warn=()=>{};_error=()=>{};_fatal=()=>{};_defaultLogger(e,t){console.log(e)}prompt=" => ";host="";logLevel="all";terminal=!0;showTime=!1;showMillis=!1;get time(){const e=new Date;let t="",o="",r="";e.getHours()<10&&(t="0"),e.getMinutes()<10&&(o="0"),e.getSeconds()<10&&(r="0"),t+=e.getHours(),o+=e.getMinutes(),r+=e.getSeconds();let n=t+":"+o+":"+r;return this.showMillis&&(n+=":"+e.getMilliseconds()),X.grey(n)}ps(e){let t="";return!0===this.showTime&&(t+=this.time+" "),""!==this.symbol[e]&&(t+=J[e](this.symbol[e])+" "),t+=J[e](this.host)+this.prompt,t}symbol;assignOptions(e,t){for(const o in t)"object"!=typeof e[o]?e[o]=t[o]||e[o]:this.assignOptions(e[o],t[o])}getLevelLoggers(){return{debug:this._debug,info:this._info,deviceEvent:this._deviceEvent,warn:this._warn,error:this._error,fatal:this._fatal}}logger=this._defaultLogger;resetLogger(){this.logger=this._defaultLogger}constructor(e=z){const t=R(e,z);this.assignOptions(this,t),this.spawnLevelLoggers()}spawnLevelLoggers(){for(let e in this.symbol){let t=e;this["_"+e]=e=>{let o=`${this.ps(t)}${r=e,"string"==typeof r?r:ee(r)}`;var r;return q[this.logLevel]<=q[t]&&this.logger(o,t),o}}}}const oe=/(^|[\\/])([^\\/]+?)(?=(\.[^.]+)?$)/;let re,ne,ie=(e=21)=>{var t;t=e-=0,!re||re.length<t?(re=Buffer.allocUnsafe(128*t),a(re),ne=0):ne+t>re.length&&(a(re),ne=0),ne+=t;let o="";for(let t=ne-e;t<ne;t++)o+="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"[63&re[t]];return o};const se=(e=0)=>t=>`[${t+e}m`,le=(e=0)=>t=>`[${38+e};5;${t}m`,ae=(e=0)=>(t,o,r)=>`[${38+e};2;${t};${o};${r}m`,ce={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};Object.keys(ce.modifier);Object.keys(ce.color),Object.keys(ce.bgColor);const he=function(){const e=new Map;for(const[t,o]of Object.entries(ce)){for(const[t,r]of Object.entries(o))ce[t]={open:`[${r[0]}m`,close:`[${r[1]}m`},o[t]=ce[t],e.set(r[0],r[1]);Object.defineProperty(ce,t,{value:o,enumerable:!1})}return Object.defineProperty(ce,"codes",{value:e,enumerable:!1}),ce.color.close="[39m",ce.bgColor.close="[49m",ce.color.ansi=se(),ce.color.ansi256=le(),ce.color.ansi16m=ae(),ce.bgColor.ansi=se(10),ce.bgColor.ansi256=le(10),ce.bgColor.ansi16m=ae(10),Object.defineProperties(ce,{rgbToAnsi256:{value:(e,t,o)=>e===t&&t===o?e<8?16:e>248?231:Math.round((e-8)/247*24)+232:16+36*Math.round(e/255*5)+6*Math.round(t/255*5)+Math.round(o/255*5),enumerable:!1},hexToRgb:{value(e){const t=/[a-f\d]{6}|[a-f\d]{3}/i.exec(e.toString(16));if(!t)return[0,0,0];let[o]=t;3===o.length&&(o=[...o].map((e=>e+e)).join(""));const r=Number.parseInt(o,16);return[r>>16&255,r>>8&255,255&r]},enumerable:!1},hexToAnsi256:{value:e=>ce.rgbToAnsi256(...ce.hexToRgb(e)),enumerable:!1},ansi256ToAnsi:{value(e){if(e<8)return 30+e;if(e<16)return e-8+90;let t,o,r;if(e>=232)t=(10*(e-232)+8)/255,o=t,r=t;else{const n=(e-=16)%36;t=Math.floor(e/36)/5,o=Math.floor(n/6)/5,r=n%6/5}const n=2*Math.max(t,o,r);if(0===n)return 30;let i=30+(Math.round(r)<<2|Math.round(o)<<1|Math.round(t));return 2===n&&(i+=60),i},enumerable:!1},rgbToAnsi:{value:(e,t,o)=>ce.ansi256ToAnsi(ce.rgbToAnsi256(e,t,o)),enumerable:!1},hexToAnsi:{value:e=>ce.ansi256ToAnsi(ce.hexToAnsi256(e)),enumerable:!1}}),ce}();function ue(e,t=(globalThis.Deno?globalThis.Deno.args:r.argv)){const o=e.startsWith("-")?"":1===e.length?"-":"--",n=t.indexOf(o+e),i=t.indexOf("--");return-1!==n&&(-1===i||n<i)}const{env:fe}=r;let ge;function de(e,{streamIsTTY:t,sniffFlags:o=!0}={}){const i=function(){if("FORCE_COLOR"in fe)return"true"===fe.FORCE_COLOR?1:"false"===fe.FORCE_COLOR?0:0===fe.FORCE_COLOR.length?1:Math.min(Number.parseInt(fe.FORCE_COLOR,10),3)}();void 0!==i&&(ge=i);const s=o?ge:i;if(0===s)return 0;if(o){if(ue("color=16m")||ue("color=full")||ue("color=truecolor"))return 3;if(ue("color=256"))return 2}if("TF_BUILD"in fe&&"AGENT_NAME"in fe)return 1;if(e&&!t&&void 0===s)return 0;const l=s||0;if("dumb"===fe.TERM)return l;if("win32"===r.platform){const e=n.release().split(".");return Number(e[0])>=10&&Number(e[2])>=10586?Number(e[2])>=14931?3:2:1}if("CI"in fe)return"GITHUB_ACTIONS"in fe?3:["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","BUILDKITE","DRONE"].some((e=>e in fe))||"codeship"===fe.CI_NAME?1:l;if("TEAMCITY_VERSION"in fe)return/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(fe.TEAMCITY_VERSION)?1:0;if("truecolor"===fe.COLORTERM)return 3;if("xterm-kitty"===fe.TERM)return 3;if("TERM_PROGRAM"in fe){const e=Number.parseInt((fe.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(fe.TERM_PROGRAM){case"iTerm.app":return e>=3?3:2;case"Apple_Terminal":return 2}}return/-256(color)?$/i.test(fe.TERM)?2:/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(fe.TERM)||"COLORTERM"in fe?1:l}function Ee(e,t={}){return function(e){return 0!==e&&{level:e,hasBasic:!0,has256:e>=2,has16m:e>=3}}(de(e,{streamIsTTY:e&&e.isTTY,...t}))}ue("no-color")||ue("no-colors")||ue("color=false")||ue("color=never")?ge=0:(ue("color")||ue("colors")||ue("color=true")||ue("color=always"))&&(ge=1);const be={stdout:Ee({isTTY:i.isatty(1)}),stderr:Ee({isTTY:i.isatty(2)})};function pe(e,t,o){let r=e.indexOf(t);if(-1===r)return e;const n=t.length;let i=0,s="";do{s+=e.slice(i,r)+t+o,i=r+n,r=e.indexOf(t,i)}while(-1!==r);return s+=e.slice(i),s}const{stdout:me,stderr:Te}=be,ve=Symbol("GENERATOR"),Se=Symbol("STYLER"),Re=Symbol("IS_EMPTY"),Ae=["ansi","ansi","ansi256","ansi16m"],Ce=Object.create(null),Oe=e=>{const t=(...e)=>e.join(" ");return((e,t={})=>{if(t.level&&!(Number.isInteger(t.level)&&t.level>=0&&t.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");const o=me?me.level:0;e.level=void 0===t.level?o:t.level})(t,e),Object.setPrototypeOf(t,_e.prototype),t};function _e(e){return Oe(e)}Object.setPrototypeOf(_e.prototype,Function.prototype);for(const[e,t]of Object.entries(he))Ce[e]={get(){const o=Pe(this,Ie(t.open,t.close,this[Se]),this[Re]);return Object.defineProperty(this,e,{value:o}),o}};Ce.visible={get(){const e=Pe(this,this[Se],!0);return Object.defineProperty(this,"visible",{value:e}),e}};const ye=(e,t,o,...r)=>"rgb"===e?"ansi16m"===t?he[o].ansi16m(...r):"ansi256"===t?he[o].ansi256(he.rgbToAnsi256(...r)):he[o].ansi(he.rgbToAnsi(...r)):"hex"===e?ye("rgb",t,o,...he.hexToRgb(...r)):he[o][e](...r),De=["rgb","hex","ansi256"];for(const e of De){Ce[e]={get(){const{level:t}=this;return function(...o){const r=Ie(ye(e,Ae[t],"color",...o),he.color.close,this[Se]);return Pe(this,r,this[Re])}}};Ce["bg"+e[0].toUpperCase()+e.slice(1)]={get(){const{level:t}=this;return function(...o){const r=Ie(ye(e,Ae[t],"bgColor",...o),he.bgColor.close,this[Se]);return Pe(this,r,this[Re])}}}}const Ne=Object.defineProperties((()=>{}),{...Ce,level:{enumerable:!0,get(){return this[ve].level},set(e){this[ve].level=e}}}),Ie=(e,t,o)=>{let r,n;return void 0===o?(r=e,n=t):(r=o.openAll+e,n=t+o.closeAll),{open:e,close:t,openAll:r,closeAll:n,parent:o}},Pe=(e,t,o)=>{const r=(...e)=>we(r,1===e.length?""+e[0]:e.join(" "));return Object.setPrototypeOf(r,Ne),r[ve]=e,r[Se]=t,r[Re]=o,r},we=(e,t)=>{if(e.level<=0||!t)return e[Re]?"":t;let o=e[Se];if(void 0===o)return t;const{openAll:r,closeAll:n}=o;if(t.includes(""))for(;void 0!==o;)t=pe(t,o.close,o.open),o=o.parent;const i=t.indexOf("\n");return-1!==i&&(t=function(e,t,o,r){let n=0,i="";do{const s="\r"===e[r-1];i+=e.slice(n,s?r-1:r)+t+(s?"\r\n":"\n")+o,n=r+1,r=e.indexOf("\n",n)}while(-1!==r);return i+=e.slice(n),i}(t,n,r,i)),r+t+n};Object.defineProperties(_e.prototype,Ce);const Me=_e();function Le(e){return null!==e&&"object"==typeof e}function Be(e,t,o=".",r){if(!Le(t))return Be(e,{},o,r);const n=Object.assign({},t);for(const t in e){if("__proto__"===t||"constructor"===t)continue;const i=e[t];null!=i&&(r&&r(n,t,i,o)||(Array.isArray(i)&&Array.isArray(n[t])?n[t]=[...i,...n[t]]:Le(i)&&Le(n[t])?n[t]=Be(i,n[t],(o?`${o}.`:"")+t.toString(),r):n[t]=i))}return n}_e({level:Te?Te.level:0});const ke=(...e)=>e.reduce(((e,t)=>Be(e,t,"",Ge)),{});var Ge;let je=0;var xe;!function(e){e[e.PING=0]="PING",e[e.ACK=1]="ACK",e[e.READY=2]="READY",e[e.STATE_UPDATE=3]="STATE_UPDATE",e[e.ERROR=4]="ERROR",e[e.STRING=5]="STRING",e[e.DISCONNECT=6]="DISCONNECT"}(xe||(xe={}));const $e={portInfo:{},logLevel:"all",id:"",showTime:!1};class Ye extends s{serialPort;slipEncoder=new h.SlipEncoder(Ke);slipDecoder=new h.SlipDecoder(Ke);_prevAckTime=0;prevState={buttons:[!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1],dials:[0,0,0,0]};_deviceReady=!1;_id="";_portInfo=null;_msger;keepAliveTimer;get prevAckTime(){return this._prevAckTime}get isOpen(){return void 0!==this.serialPort&&this.serialPort.isOpen}static get connectedDevices(){return je}get devicePath(){return null!==this._portInfo?this._portInfo.path:""}get deviceSerial(){return null!==this._portInfo?this._portInfo.serialNumber:""}get fingerPrint(){return{devicePath:this.devicePath,deviceSerial:this.deviceSerial,portId:this.portId}}get portInfo(){return this._portInfo}get portId(){return this._id}log;debug;deviceEvent;info;warn;error;fatal;get host(){let e=`Port:${Me.magenta(this.deviceSerial.slice(0,4))}|`;return this.isOpen?e+=Me.green(this.devicePath.match(oe)?.[2]):e+=Me.yellow("D/C"),e}_logLevel="all";get showTime(){return this._msger.showTime}set showTime(e){this._msger.showTime=e}get logLevel(){return this._logLevel}set logLevel(e){this._logLevel=e,this._msger.logLevel=e}get logTermFormat(){return this._msger.terminal}set logTermFormat(e){this._msger.terminal=e}emitLog=(e,t)=>{this.emit(He.Terminal.Log[t],{level:t,message:e,buffer:l.from(e)})};constructor(e){super();const t=ke(e,$e);this._id=""===t.id?ie(23):t.id,this._portInfo=t.portInfo,this._msger=new te,this._msger.host=this.host,this._msger.showTime=t.showTime,this.log=this._msger.getLevelLoggers(),this.logLevel=t.logLevel;for(const e in this.log)this[e]=t=>{const o=this.log[e](t);this.emitLog(o,e)};this.debug("Creating new MakeShiftPort with options: "+ee(t)),this.slipDecoder.on("data",(e=>{this.onSlipDecoderData(e)})),this.open()}onSlipDecoderData(e){this._prevAckTime=Date.now();const t=e.slice(0,1).at(0),o=e.slice(1);switch(this.debug(e),t){case xe.STATE_UPDATE:{let e=Ye.parseStateFromBuffer(o);this.emit(He.DEVICE.STATE_UPDATE,e),this.handleStateUpdate(e);break}case xe.ACK:this.debug("Got ACK from MakeShift");break;case xe.STRING:this.debug(o.toString());break;case xe.PING:this.debug("Got PING from MakeShift, responding with ACK"),this.sendByte(xe.ACK);break;case xe.ERROR:this.debug("Got ERROR from MakeShift");break;case xe.READY:this.debug("Got READY from MakeShift"),this.debug(o.toString()),je++,this._deviceReady=!0,this._prevAckTime=Date.now(),this.deviceEvent("Device connection established"),this.emit(He.DEVICE.CONNECTED,this.fingerPrint);break;default:this.debug(t),this.debug(e.toString())}}ping(){this.sendByte(xe.PING)}handleStateUpdate(e){for(let t=0;t<Ue;t++)if(e.buttons[t]!=this.prevState.buttons[t]){let o;o=!0===e.buttons[t]?He.BUTTON[t].PRESSED:He.BUTTON[t].RELEASED,this.emit(o,{state:e.buttons[t],event:o}),this.deviceEvent(`${o} with state ${e.buttons[t]}`)}let t;for(let o=0;o<Ve;o++)if(t=e.dials[o]-this.prevState.dials[o],0!==t){let r;this.emit(He.DIAL[o].CHANGE,{state:e.dials[o],event:r}),r=t>0?He.DIAL[o].INCREMENT:He.DIAL[o].DECREMENT,this.emit(r,{state:e.dials[o],event:r}),this.deviceEvent(`${r} with state ${e.dials[o]}`)}this.prevState=e}sendByte(e){if(this.isOpen)try{this.serialPort.flush();let t=l.from([e]);this.debug(`Sending byte: ${ee(t)}`),this.slipEncoder.write(t)}catch(e){this.error(e)}}send(e,t){if(this.isOpen)try{this.serialPort.flush();let o=l.from([e]),r=l.from(t);const n=l.concat([o,r]);this.debug(`Sending buffer: ${ee(n)}`),this.slipEncoder.write(n)}catch(e){this.error(e)}}static parseStateFromBuffer(e){let t={buttons:[],dials:[]};const o=e.slice(0,2).reverse(),r=e.slice(2,18);function n(e,o){0!==o&&(e%2?t.buttons.push(!0):t.buttons.push(!1),n(Math.floor(e/2),o-1))}return o.forEach((e=>n(e,8))),t.dials.push(r.readInt32BE(0)),t.dials.push(r.readInt32BE(4)),t.dials.push(r.readInt32BE(8)),t.dials.push(r.readInt32BE(12)),t}async open(){this.serialPort=await new e({path:this.devicePath,baudRate:42069},(e=>{null!=e?(this.error("Something happened while opening port: "),this.error(e)):(this._msger.host=this.host,this.info("SerialPort opened, attaching SLIP translators"),this.slipEncoder.pipe(this.serialPort),this.serialPort.pipe(this.slipDecoder),this.info("Translators ready, sending READY to MakeShift"),this.sendByte(xe.READY))}))}close(){this.info("Closing MakeShift port..."),this.info("Unpiping encoders"),this.slipEncoder.unpipe(),this.serialPort.unpipe(),this.isOpen&&(this.info("Port object found open"),this.info("Sending disconnect packet"),this.sendByte(xe.DISCONNECT),this.info("Closing port"),this.serialPort.close()),this._msger.host=this.host,je--,this._deviceReady=!1,this.warn("Port closed, sending disconnect signal"),this.emit(He.DEVICE.DISCONNECTED,this.fingerPrint)}write=e=>{this._deviceReady?this.send(xe.STRING,e):this.info("MakeShift not ready, line not sent")}}const He={DIAL:[{INCREMENT:"dial-01-increment",DECREMENT:"dial-01-decrement",CHANGE:"dial-01-change"},{INCREMENT:"dial-02-increment",DECREMENT:"dial-02-decrement",CHANGE:"dial-02-change"},{INCREMENT:"dial-03-increment",DECREMENT:"dial-03-decrement",CHANGE:"dial-03-change"},{INCREMENT:"dial-04-increment",DECREMENT:"dial-04-decrement",CHANGE:"dial-04-change"}],BUTTON:[{PRESSED:"button-01-rise",RELEASED:"button-01-fall",CHANGE:"button-01-change"},{PRESSED:"button-02-rise",RELEASED:"button-02-fall",CHANGE:"button-02-change"},{PRESSED:"button-03-rise",RELEASED:"button-03-fall",CHANGE:"button-03-change"},{PRESSED:"button-04-rise",RELEASED:"button-04-fall",CHANGE:"button-04-change"},{PRESSED:"button-05-rise",RELEASED:"button-05-fall",CHANGE:"button-05-change"},{PRESSED:"button-06-rise",RELEASED:"button-06-fall",CHANGE:"button-06-change"},{PRESSED:"button-07-rise",RELEASED:"button-07-fall",CHANGE:"button-07-change"},{PRESSED:"button-08-rise",RELEASED:"button-08-fall",CHANGE:"button-08-change"},{PRESSED:"button-09-rise",RELEASED:"button-09-fall",CHANGE:"button-09-change"},{PRESSED:"button-10-rise",RELEASED:"button-10-fall",CHANGE:"button-10-change"},{PRESSED:"button-11-rise",RELEASED:"button-11-fall",CHANGE:"button-11-change"},{PRESSED:"button-12-rise",RELEASED:"button-12-fall",CHANGE:"button-12-change"},{PRESSED:"button-13-rise",RELEASED:"button-13-fall",CHANGE:"button-13-change"},{PRESSED:"button-14-rise",RELEASED:"button-14-fall",CHANGE:"button-14-change"},{PRESSED:"button-15-rise",RELEASED:"button-15-fall",CHANGE:"button-15-change"},{PRESSED:"button-16-rise",RELEASED:"button-16-fall",CHANGE:"button-16-change"}],DEVICE:{DISCONNECTED:"makeshift-disconnect",CONNECTED:"makeshift-connect",STATE_UPDATE:"state-update"},Terminal:{Log:{fatal:"makeshift-serial-log-fatal",error:"makeshift-serial-log-error",warn:"makeshift-serial-log-warn",deviceEvent:"makeshift-serial-log-event",info:"makeshift-serial-log-info",debug:"makeshift-serial-log-debug",all:"makeshift-serial-log-any"}}};const Fe=function e(t){const o=[];for(const r in t){if("string"==typeof t[r])return t[r];{const n=e(t[r]);Array.isArray(n)?o.push(...n):o.push(n)}}return o}(He),Ue=He.BUTTON.length,Ve=He.DIAL.length,Ke={ESC:219,END:192,ESC_END:220,ESC_ESC:221},We={};let Qe=[];const Xe=new s;let qe="info",ze=!1,Je=!0,Ze=1e3,et=5e3,tt=1500;const ot={},rt=new te({host:"PortAuthority",logLevel:"info",showTime:!1});rt.logLevel=qe,rt.showTime=ze;const nt=rt.getLevelLoggers();function it(){Je=!0,gt()}function st(){Je=!1}function lt(){Je=!1,Et()}function at(){return Qe}function ct(e){ze=e,rt.showTime=e;for(const t in We)We[t].showTime=e}function ht(e){qe=e,rt.logLevel=e;for(const t in We)We[t].logLevel=e}function ut(e,t){void 0!==We[e]&&(We[e].logLevel=t)}function ft(e){rt.logLevel=e}function gt(){setTimeout((()=>{Et()}),1e3),Xe.emit(bt.scan.started)}function dt(e){ot[e]=setTimeout((()=>{!function(e){const t=Date.now()-We[e].prevAckTime;nt.debug(`elapsedTime since prevAckTime: ${t}`),t>et?(clearTimeout(ot[e]),nt.debug(`Timer handle - ${ot[e]}`),nt.warn(`Device ${e}::${We[e].devicePath} unresponsive for 5000ms, disconnecting`),function(e){if(void 0===We[e])return;const t=We[e].fingerPrint;Qe=Qe.filter((e=>t.devicePath!==e.devicePath&&t.deviceSerial!==e.deviceSerial)),We[e].close(),delete We[e],Xe.emit(bt.port.closed,t)}(e)):(t>=1460&&We[e].ping(),dt(e))}(e)}),tt)}async function Et(){nt.debug(`scanForDevice called with autoscan set to ${Je}`);try{const t=await e.list();t.forEach((e=>{nt.debug(Z(e,1))}));const o=t.filter((e=>("16c0"===e.vendorId||"16C0"===e.vendorId)&&"0483"===e.productId));nt.debug(`Found MakeShift devices: ${ee(o)}`),o.length>0&&o.forEach((e=>{!function(e){const t=e.path;for(const e in We)if(We[e].devicePath===t)return;const o=e.serialNumber,r={portInfo:e,id:o,logLevel:qe,showTime:ze};nt.info(`Opening device with options: '${Z(r,1)}'`),We[o]=new Ye(r);const n=We[o].fingerPrint;Qe.push(n),We[o].ping(),dt(o),nt.deviceEvent(`Opened port: ${n.deviceSerial} | ${n.devicePath}`),Xe.emit(bt.port.opened,n)}(e)})),Je?gt():Xe.emit(bt.scan.stopped)}catch(e){nt.error(e)}}const bt={port:{opened:"makeshift-pa-port-opened",closed:"makeshift-pa-port-closed"},scan:{started:"makeshift-pa-scan-started",stopped:"makeshift-pa-scan-stopped"}};export{He as DeviceEvents,Fe as DeviceEventsFlat,Ye as MakeShiftPort,te as Msg,xe as PacketType,Xe as PortAuthority,bt as PortAuthorityEvents,We as Ports,$e as defaultMakeShiftPortOptions,at as getPortFingerPrintSnapShot,ee as nspct2,Z as nspect,Ze as scanDelayMs,lt as scanOnce,ht as setLogLevel,ft as setPortAuthorityLogLevel,ut as setPortLogLevel,ct as setShowTime,it as startAutoScan,st as stopAutoScan};
