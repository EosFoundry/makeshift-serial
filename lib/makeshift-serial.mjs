import{SerialPort as e}from"serialport";import t from"stream";import{inspect as r}from"node:util";import o from"node:process";import i from"node:os";import s from"node:tty";import{EventEmitter as n}from"node:events";import{Buffer as l}from"node:buffer";import{readFileSync as a}from"fs";var c="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},h={},u={};Object.defineProperty(u,"__esModule",{value:!0}),u.SlipDecoder=void 0;const f=t;class g extends f.Transform{constructor(e={}){super(e);const{START:t,ESC:r=219,END:o=192,ESC_START:i,ESC_END:s=220,ESC_ESC:n=221}=e;this.opts={START:t,ESC:r,END:o,ESC_START:i,ESC_END:s,ESC_ESC:n},this.buffer=Buffer.alloc(0),this.escape=!1,this.start=!1}_transform(e,t,r){for(let t=0;t<e.length;t++){let r=e[t];if(r!==this.opts.START){if(null==this.opts.START&&(this.start=!0),this.escape)r===this.opts.ESC_START&&this.opts.START?r=this.opts.START:r===this.opts.ESC_ESC?r=this.opts.ESC:r===this.opts.ESC_END?r=this.opts.END:(this.escape=!1,this.push(this.buffer),this.buffer=Buffer.alloc(0));else{if(r===this.opts.ESC){this.escape=!0;continue}if(r===this.opts.END){this.push(this.buffer),this.buffer=Buffer.alloc(0),this.escape=!1,this.start=!1;continue}}this.escape=!1,this.start&&(this.buffer=Buffer.concat([this.buffer,Buffer.from([r])]))}else this.start=!0}r()}_flush(e){this.push(this.buffer),this.buffer=Buffer.alloc(0),e()}}u.SlipDecoder=g;var d={};Object.defineProperty(d,"__esModule",{value:!0}),d.SlipEncoder=void 0;const p=t;class b extends p.Transform{constructor(e={}){super(e);const{START:t,ESC:r=219,END:o=192,ESC_START:i,ESC_END:s=220,ESC_ESC:n=221,bluetoothQuirk:l=!1}=e;this.opts={START:t,ESC:r,END:o,ESC_START:i,ESC_END:s,ESC_ESC:n,bluetoothQuirk:l}}_transform(e,t,r){const o=e.length;if(this.opts.bluetoothQuirk&&0===o)return r();const i=Buffer.alloc(2*o+2);let s=0;1==this.opts.bluetoothQuirk&&(i[s++]=this.opts.END),void 0!==this.opts.START&&(i[s++]=this.opts.START);for(let t=0;t<o;t++){let r=e[t];r===this.opts.START&&this.opts.ESC_START?(i[s++]=this.opts.ESC,r=this.opts.ESC_START):r===this.opts.END?(i[s++]=this.opts.ESC,r=this.opts.ESC_END):r===this.opts.ESC&&(i[s++]=this.opts.ESC,r=this.opts.ESC_ESC),i[s++]=r}i[s++]=this.opts.END,r(null,i.slice(0,s))}}var m,T,v;function E(e){return null!==e&&"object"==typeof e}function O(e,t,r=".",o){if(!E(t))return O(e,{},r,o);const i=Object.assign({},t);for(const t in e){if("__proto__"===t||"constructor"===t)continue;const s=e[t];null!=s&&(o&&o(i,t,s,r)||(Array.isArray(s)&&Array.isArray(i[t])?i[t]=[...s,...i[t]]:E(s)&&E(i[t])?i[t]=O(s,i[t],(r?`${r}.`:"")+t.toString(),o):i[t]=s))}return i}d.SlipEncoder=b,m=h,T=c&&c.__createBinding||(Object.create?function(e,t,r,o){void 0===o&&(o=r),Object.defineProperty(e,o,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,o){void 0===o&&(o=r),e[o]=t[r]}),v=c&&c.__exportStar||function(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||T(t,e,r)},Object.defineProperty(m,"__esModule",{value:!0}),v(u,m),v(d,m);const R=(...e)=>e.reduce(((e,t)=>O(e,t,"",undefined)),{});const C=(e=0)=>t=>`[${t+e}m`,S=(e=0)=>t=>`[${38+e};5;${t}m`,_=(e=0)=>(t,r,o)=>`[${38+e};2;${t};${r};${o}m`,A={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};Object.keys(A.modifier),Object.keys(A.color),Object.keys(A.bgColor);const y=function(){const e=new Map;for(const[t,r]of Object.entries(A)){for(const[t,o]of Object.entries(r))A[t]={open:`[${o[0]}m`,close:`[${o[1]}m`},r[t]=A[t],e.set(o[0],o[1]);Object.defineProperty(A,t,{value:r,enumerable:!1})}return Object.defineProperty(A,"codes",{value:e,enumerable:!1}),A.color.close="[39m",A.bgColor.close="[49m",A.color.ansi=C(),A.color.ansi256=S(),A.color.ansi16m=_(),A.bgColor.ansi=C(10),A.bgColor.ansi256=S(10),A.bgColor.ansi16m=_(10),Object.defineProperties(A,{rgbToAnsi256:{value:(e,t,r)=>e===t&&t===r?e<8?16:e>248?231:Math.round((e-8)/247*24)+232:16+36*Math.round(e/255*5)+6*Math.round(t/255*5)+Math.round(r/255*5),enumerable:!1},hexToRgb:{value(e){const t=/[a-f\d]{6}|[a-f\d]{3}/i.exec(e.toString(16));if(!t)return[0,0,0];let[r]=t;3===r.length&&(r=[...r].map((e=>e+e)).join(""));const o=Number.parseInt(r,16);return[o>>16&255,o>>8&255,255&o]},enumerable:!1},hexToAnsi256:{value:e=>A.rgbToAnsi256(...A.hexToRgb(e)),enumerable:!1},ansi256ToAnsi:{value(e){if(e<8)return 30+e;if(e<16)return e-8+90;let t,r,o;if(e>=232)t=(10*(e-232)+8)/255,r=t,o=t;else{const i=(e-=16)%36;t=Math.floor(e/36)/5,r=Math.floor(i/6)/5,o=i%6/5}const i=2*Math.max(t,r,o);if(0===i)return 30;let s=30+(Math.round(o)<<2|Math.round(r)<<1|Math.round(t));return 2===i&&(s+=60),s},enumerable:!1},rgbToAnsi:{value:(e,t,r)=>A.ansi256ToAnsi(A.rgbToAnsi256(e,t,r)),enumerable:!1},hexToAnsi:{value:e=>A.ansi256ToAnsi(A.hexToAnsi256(e)),enumerable:!1}}),A}();function I(e,t=(globalThis.Deno?globalThis.Deno.args:o.argv)){const r=e.startsWith("-")?"":1===e.length?"-":"--",i=t.indexOf(r+e),s=t.indexOf("--");return-1!==i&&(-1===s||i<s)}const{env:w}=o;let N;function M(e,{streamIsTTY:t,sniffFlags:r=!0}={}){const s=function(){if("FORCE_COLOR"in w)return"true"===w.FORCE_COLOR?1:"false"===w.FORCE_COLOR?0:0===w.FORCE_COLOR.length?1:Math.min(Number.parseInt(w.FORCE_COLOR,10),3)}();void 0!==s&&(N=s);const n=r?N:s;if(0===n)return 0;if(r){if(I("color=16m")||I("color=full")||I("color=truecolor"))return 3;if(I("color=256"))return 2}if("TF_BUILD"in w&&"AGENT_NAME"in w)return 1;if(e&&!t&&void 0===n)return 0;const l=n||0;if("dumb"===w.TERM)return l;if("win32"===o.platform){const e=i.release().split(".");return Number(e[0])>=10&&Number(e[2])>=10586?Number(e[2])>=14931?3:2:1}if("CI"in w)return"GITHUB_ACTIONS"in w?3:["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","BUILDKITE","DRONE"].some((e=>e in w))||"codeship"===w.CI_NAME?1:l;if("TEAMCITY_VERSION"in w)return/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(w.TEAMCITY_VERSION)?1:0;if("truecolor"===w.COLORTERM)return 3;if("xterm-kitty"===w.TERM)return 3;if("TERM_PROGRAM"in w){const e=Number.parseInt((w.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(w.TERM_PROGRAM){case"iTerm.app":return e>=3?3:2;case"Apple_Terminal":return 2}}return/-256(color)?$/i.test(w.TERM)?2:/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(w.TERM)||"COLORTERM"in w?1:l}function P(e,t={}){return function(e){return 0!==e&&{level:e,hasBasic:!0,has256:e>=2,has16m:e>=3}}(M(e,{streamIsTTY:e&&e.isTTY,...t}))}I("no-color")||I("no-colors")||I("color=false")||I("color=never")?N=0:(I("color")||I("colors")||I("color=true")||I("color=always"))&&(N=1);const D={stdout:P({isTTY:s.isatty(1)}),stderr:P({isTTY:s.isatty(2)})};function B(e,t,r){let o=e.indexOf(t);if(-1===o)return e;const i=t.length;let s=0,n="";do{n+=e.slice(s,o)+t+r,s=o+i,o=e.indexOf(t,s)}while(-1!==o);return n+=e.slice(s),n}const{stdout:L,stderr:k}=D,j=Symbol("GENERATOR"),x=Symbol("STYLER"),$=Symbol("IS_EMPTY"),G=["ansi","ansi","ansi256","ansi16m"],Y=Object.create(null);function F(e){return(e=>{const t=(...e)=>e.join(" ");return((e,t={})=>{if(t.level&&!(Number.isInteger(t.level)&&t.level>=0&&t.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");const r=L?L.level:0;e.level=void 0===t.level?r:t.level})(t,e),Object.setPrototypeOf(t,F.prototype),t})(e)}Object.setPrototypeOf(F.prototype,Function.prototype);for(const[e,t]of Object.entries(y))Y[e]={get(){const r=W(this,K(t.open,t.close,this[x]),this[$]);return Object.defineProperty(this,e,{value:r}),r}};Y.visible={get(){const e=W(this,this[x],!0);return Object.defineProperty(this,"visible",{value:e}),e}};const U=(e,t,r,...o)=>"rgb"===e?"ansi16m"===t?y[r].ansi16m(...o):"ansi256"===t?y[r].ansi256(y.rgbToAnsi256(...o)):y[r].ansi(y.rgbToAnsi(...o)):"hex"===e?U("rgb",t,r,...y.hexToRgb(...o)):y[r][e](...o),V=["rgb","hex","ansi256"];for(const e of V)Y[e]={get(){const{level:t}=this;return function(...r){const o=K(U(e,G[t],"color",...r),y.color.close,this[x]);return W(this,o,this[$])}}},Y["bg"+e[0].toUpperCase()+e.slice(1)]={get(){const{level:t}=this;return function(...r){const o=K(U(e,G[t],"bgColor",...r),y.bgColor.close,this[x]);return W(this,o,this[$])}}};const H=Object.defineProperties((()=>{}),{...Y,level:{enumerable:!0,get(){return this[j].level},set(e){this[j].level=e}}}),K=(e,t,r)=>{let o,i;return void 0===r?(o=e,i=t):(o=r.openAll+e,i=t+r.closeAll),{open:e,close:t,openAll:o,closeAll:i,parent:r}},W=(e,t,r)=>{const o=(...e)=>Q(o,1===e.length?""+e[0]:e.join(" "));return Object.setPrototypeOf(o,H),o[j]=e,o[x]=t,o[$]=r,o},Q=(e,t)=>{if(e.level<=0||!t)return e[$]?"":t;let r=e[x];if(void 0===r)return t;const{openAll:o,closeAll:i}=r;if(t.includes(""))for(;void 0!==r;)t=B(t,r.close,r.open),r=r.parent;const s=t.indexOf("\n");return-1!==s&&(t=function(e,t,r,o){let i=0,s="";do{const n="\r"===e[o-1];s+=e.slice(i,n?o-1:o)+t+(n?"\r\n":"\n")+r,i=o+1,o=e.indexOf("\n",i)}while(-1!==o);return s+=e.slice(i),s}(t,i,o,s)),o+t+i};Object.defineProperties(F.prototype,Y);const J=F();F({level:k?k.level:0});const X={all:0,debug:1,deviceEvent:2,info:3,warn:4,error:5,fatal:98,none:99},q={host:"",logLevel:"all",prompt:" => ",showTime:!1,symbol:{debug:"dbg",info:"",deviceEvent:"",warn:"(!)",error:"[!]",fatal:"{x_X}"},terminal:!0},z={debug:J.gray,info:J.white,deviceEvent:J.green,warn:J.yellow,error:J.red,fatal:J.redBright};function Z(e,t){return r(e,{colors:!0,depth:t})}function ee(e){return r(e,{colors:!0,depth:2})}class te{_debug=()=>{};_info=()=>{};_deviceEvent=()=>{};_warn=()=>{};_error=()=>{};_fatal=()=>{};_defaultLogger(e,t){console.log(e)}prompt=" => ";host="";logLevel="all";terminal=!0;showTime=!1;showMillis=!1;get time(){const e=new Date;let t="",r="",o="";e.getHours()<10&&(t="0"),e.getMinutes()<10&&(r="0"),e.getSeconds()<10&&(o="0"),t+=e.getHours(),r+=e.getMinutes(),o+=e.getSeconds();let i=t+":"+r+":"+o;return this.showMillis&&(i+=":"+e.getMilliseconds()),J.grey(i)}ps(e){let t="";return!0===this.showTime&&(t+=this.time+" "),""!==this.symbol[e]&&(t+=z[e](this.symbol[e])+" "),t+=z[e](this.host)+this.prompt,t}symbol;assignOptions(e,t){for(const r in t)"object"!=typeof e[r]?e[r]=t[r]||e[r]:this.assignOptions(e[r],t[r])}getLevelLoggers(){return{debug:this._debug,info:this._info,deviceEvent:this._deviceEvent,warn:this._warn,error:this._error,fatal:this._fatal}}logger=this._defaultLogger;resetLogger(){this.logger=this._defaultLogger}constructor(e=q){const t=R(e,q);this.assignOptions(this,t),this.spawnLevelLoggers()}spawnLevelLoggers(){for(let e in this.symbol){let t=e;this["_"+e]=e=>{let r=`${this.ps(t)}${o=e,"string"==typeof o?o:ee(o)}`;var o;return X[this.logLevel]<=X[t]&&this.logger(r,t),r}}}}const re=/(^|[/\\])([^/\\]+?)(?=(\.[^.]+)?$)/;const oe=(e=0)=>t=>`[${t+e}m`,ie=(e=0)=>t=>`[${38+e};5;${t}m`,se=(e=0)=>(t,r,o)=>`[${38+e};2;${t};${r};${o}m`,ne={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};Object.keys(ne.modifier);Object.keys(ne.color),Object.keys(ne.bgColor);const le=function(){const e=new Map;for(const[t,r]of Object.entries(ne)){for(const[t,o]of Object.entries(r))ne[t]={open:`[${o[0]}m`,close:`[${o[1]}m`},r[t]=ne[t],e.set(o[0],o[1]);Object.defineProperty(ne,t,{value:r,enumerable:!1})}return Object.defineProperty(ne,"codes",{value:e,enumerable:!1}),ne.color.close="[39m",ne.bgColor.close="[49m",ne.color.ansi=oe(),ne.color.ansi256=ie(),ne.color.ansi16m=se(),ne.bgColor.ansi=oe(10),ne.bgColor.ansi256=ie(10),ne.bgColor.ansi16m=se(10),Object.defineProperties(ne,{rgbToAnsi256:{value:(e,t,r)=>e===t&&t===r?e<8?16:e>248?231:Math.round((e-8)/247*24)+232:16+36*Math.round(e/255*5)+6*Math.round(t/255*5)+Math.round(r/255*5),enumerable:!1},hexToRgb:{value(e){const t=/[a-f\d]{6}|[a-f\d]{3}/i.exec(e.toString(16));if(!t)return[0,0,0];let[r]=t;3===r.length&&(r=[...r].map((e=>e+e)).join(""));const o=Number.parseInt(r,16);return[o>>16&255,o>>8&255,255&o]},enumerable:!1},hexToAnsi256:{value:e=>ne.rgbToAnsi256(...ne.hexToRgb(e)),enumerable:!1},ansi256ToAnsi:{value(e){if(e<8)return 30+e;if(e<16)return e-8+90;let t,r,o;if(e>=232)t=(10*(e-232)+8)/255,r=t,o=t;else{const i=(e-=16)%36;t=Math.floor(e/36)/5,r=Math.floor(i/6)/5,o=i%6/5}const i=2*Math.max(t,r,o);if(0===i)return 30;let s=30+(Math.round(o)<<2|Math.round(r)<<1|Math.round(t));return 2===i&&(s+=60),s},enumerable:!1},rgbToAnsi:{value:(e,t,r)=>ne.ansi256ToAnsi(ne.rgbToAnsi256(e,t,r)),enumerable:!1},hexToAnsi:{value:e=>ne.ansi256ToAnsi(ne.hexToAnsi256(e)),enumerable:!1}}),ne}();function ae(e,t=(globalThis.Deno?globalThis.Deno.args:o.argv)){const r=e.startsWith("-")?"":1===e.length?"-":"--",i=t.indexOf(r+e),s=t.indexOf("--");return-1!==i&&(-1===s||i<s)}const{env:ce}=o;let he;function ue(e,{streamIsTTY:t,sniffFlags:r=!0}={}){const s=function(){if("FORCE_COLOR"in ce)return"true"===ce.FORCE_COLOR?1:"false"===ce.FORCE_COLOR?0:0===ce.FORCE_COLOR.length?1:Math.min(Number.parseInt(ce.FORCE_COLOR,10),3)}();void 0!==s&&(he=s);const n=r?he:s;if(0===n)return 0;if(r){if(ae("color=16m")||ae("color=full")||ae("color=truecolor"))return 3;if(ae("color=256"))return 2}if("TF_BUILD"in ce&&"AGENT_NAME"in ce)return 1;if(e&&!t&&void 0===n)return 0;const l=n||0;if("dumb"===ce.TERM)return l;if("win32"===o.platform){const e=i.release().split(".");return Number(e[0])>=10&&Number(e[2])>=10586?Number(e[2])>=14931?3:2:1}if("CI"in ce)return"GITHUB_ACTIONS"in ce?3:["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","BUILDKITE","DRONE"].some((e=>e in ce))||"codeship"===ce.CI_NAME?1:l;if("TEAMCITY_VERSION"in ce)return/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(ce.TEAMCITY_VERSION)?1:0;if("truecolor"===ce.COLORTERM)return 3;if("xterm-kitty"===ce.TERM)return 3;if("TERM_PROGRAM"in ce){const e=Number.parseInt((ce.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(ce.TERM_PROGRAM){case"iTerm.app":return e>=3?3:2;case"Apple_Terminal":return 2}}return/-256(color)?$/i.test(ce.TERM)?2:/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(ce.TERM)||"COLORTERM"in ce?1:l}function fe(e,t={}){return function(e){return 0!==e&&{level:e,hasBasic:!0,has256:e>=2,has16m:e>=3}}(ue(e,{streamIsTTY:e&&e.isTTY,...t}))}ae("no-color")||ae("no-colors")||ae("color=false")||ae("color=never")?he=0:(ae("color")||ae("colors")||ae("color=true")||ae("color=always"))&&(he=1);const ge={stdout:fe({isTTY:s.isatty(1)}),stderr:fe({isTTY:s.isatty(2)})};function de(e,t,r){let o=e.indexOf(t);if(-1===o)return e;const i=t.length;let s=0,n="";do{n+=e.slice(s,o)+t+r,s=o+i,o=e.indexOf(t,s)}while(-1!==o);return n+=e.slice(s),n}const{stdout:pe,stderr:be}=ge,me=Symbol("GENERATOR"),Te=Symbol("STYLER"),ve=Symbol("IS_EMPTY"),Ee=["ansi","ansi","ansi256","ansi16m"],Oe=Object.create(null),Re=e=>{const t=(...e)=>e.join(" ");return((e,t={})=>{if(t.level&&!(Number.isInteger(t.level)&&t.level>=0&&t.level<=3))throw new Error("The `level` option should be an integer from 0 to 3");const r=pe?pe.level:0;e.level=void 0===t.level?r:t.level})(t,e),Object.setPrototypeOf(t,Ce.prototype),t};function Ce(e){return Re(e)}Object.setPrototypeOf(Ce.prototype,Function.prototype);for(const[e,t]of Object.entries(le))Oe[e]={get(){const r=Ie(this,ye(t.open,t.close,this[Te]),this[ve]);return Object.defineProperty(this,e,{value:r}),r}};Oe.visible={get(){const e=Ie(this,this[Te],!0);return Object.defineProperty(this,"visible",{value:e}),e}};const Se=(e,t,r,...o)=>"rgb"===e?"ansi16m"===t?le[r].ansi16m(...o):"ansi256"===t?le[r].ansi256(le.rgbToAnsi256(...o)):le[r].ansi(le.rgbToAnsi(...o)):"hex"===e?Se("rgb",t,r,...le.hexToRgb(...o)):le[r][e](...o),_e=["rgb","hex","ansi256"];for(const e of _e){Oe[e]={get(){const{level:t}=this;return function(...r){const o=ye(Se(e,Ee[t],"color",...r),le.color.close,this[Te]);return Ie(this,o,this[ve])}}};Oe["bg"+e[0].toUpperCase()+e.slice(1)]={get(){const{level:t}=this;return function(...r){const o=ye(Se(e,Ee[t],"bgColor",...r),le.bgColor.close,this[Te]);return Ie(this,o,this[ve])}}}}const Ae=Object.defineProperties((()=>{}),{...Oe,level:{enumerable:!0,get(){return this[me].level},set(e){this[me].level=e}}}),ye=(e,t,r)=>{let o,i;return void 0===r?(o=e,i=t):(o=r.openAll+e,i=t+r.closeAll),{open:e,close:t,openAll:o,closeAll:i,parent:r}},Ie=(e,t,r)=>{const o=(...e)=>we(o,1===e.length?""+e[0]:e.join(" "));return Object.setPrototypeOf(o,Ae),o[me]=e,o[Te]=t,o[ve]=r,o},we=(e,t)=>{if(e.level<=0||!t)return e[ve]?"":t;let r=e[Te];if(void 0===r)return t;const{openAll:o,closeAll:i}=r;if(t.includes(""))for(;void 0!==r;)t=de(t,r.close,r.open),r=r.parent;const s=t.indexOf("\n");return-1!==s&&(t=function(e,t,r,o){let i=0,s="";do{const n="\r"===e[o-1];s+=e.slice(i,n?o-1:o)+t+(n?"\r\n":"\n")+r,i=o+1,o=e.indexOf("\n",i)}while(-1!==o);return s+=e.slice(i),s}(t,i,o,s)),o+t+i};Object.defineProperties(Ce.prototype,Oe);const Ne=Ce();function Me(e){return null!==e&&"object"==typeof e}function Pe(e,t,r=".",o){if(!Me(t))return Pe(e,{},r,o);const i=Object.assign({},t);for(const t in e){if("__proto__"===t||"constructor"===t)continue;const s=e[t];null!=s&&(o&&o(i,t,s,r)||(Array.isArray(s)&&Array.isArray(i[t])?i[t]=[...s,...i[t]]:Me(s)&&Me(i[t])?i[t]=Pe(s,i[t],(r?`${r}.`:"")+t.toString(),o):i[t]=s))}return i}Ce({level:be?be.level:0});const De=(...e)=>e.reduce(((e,t)=>Pe(e,t,"",Be)),{});var Be;const Le=JSON.parse(a("src/hardware-descriptors/generated/makeshift-events.json","utf8")),ke={Log:{fatal:"makeshift-serial-log-fatal",error:"makeshift-serial-log-error",warn:"makeshift-serial-log-warn",deviceEvent:"makeshift-serial-log-event",info:"makeshift-serial-log-info",debug:"makeshift-serial-log-debug",all:"makeshift-serial-log-any"}},je={...Le,DEVICE:{CONNECTION_ERROR:"makeshift-connection-error",DISCONNECTED:"makeshift-disconnect",CONNECTED:"makeshift-connect",STATE_UPDATE:"state-update"}};let xe=0;var $e;!function(e){e[e.PING=0]="PING",e[e.ACK=1]="ACK",e[e.READY=2]="READY",e[e.STATE_UPDATE=3]="STATE_UPDATE",e[e.ERROR=4]="ERROR",e[e.STRING=5]="STRING",e[e.DISCONNECT=6]="DISCONNECT"}($e||($e={}));const Ge={portInfo:{},logLevel:"all",id:"",showTime:!1};class Ye extends n{serialPort;slipEncoder=new h.SlipEncoder(Ve);slipDecoder=new h.SlipDecoder(Ve);_prevAckTime=0;prevState={buttons:[!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1,!1],dials:[0,0,0,0],dialsRelative:[0,0,0,0]};_deviceReady=!1;_id="";_portInfo=null;_msger;keepAliveTimer;static get connectedDevices(){return xe}get prevAckTime(){return this._prevAckTime}get isOpen(){return void 0!==this.serialPort&&this.serialPort.isOpen}get devicePath(){return null!==this._portInfo?this._portInfo.path:""}get deviceSerial(){return this._id}get fingerPrint(){return{devicePath:this.devicePath,deviceSerial:this.deviceSerial,portId:this.portId}}get portInfo(){return this._portInfo}get portId(){return null!==this._portInfo?this._portInfo.serialNumber:""}log;debug;deviceEvent;info;warn;error;fatal;get host(){let e="Port:"+Ne.green((t=this.devicePath,t.match(re)?.[2]))+"|";var t;return this._deviceReady?e+=Ne.magenta(this.deviceSerial.slice(0,4)):e+=Ne.yellow("D/C"),e}_logLevel="all";get showTime(){return this._msger.showTime}set showTime(e){this._msger.showTime=e}get logLevel(){return this._logLevel}set logLevel(e){this._logLevel=e,this._msger.logLevel=e}get logTermFormat(){return this._msger.terminal}set logTermFormat(e){this._msger.terminal=e}emitLog=(e,t)=>{this.emit(ke.Log[t],{level:t,message:e,buffer:l.from(e)})};constructor(e){super();const t=De(e,Ge);this._portInfo=t.portInfo,this._msger=new te,this._msger.host=this.host,this._msger.showTime=t.showTime,this.log=this._msger.getLevelLoggers(),this.logLevel=t.logLevel;for(const e in this.log)this[e]=t=>{const r=this.log[e](t);this.emitLog(r,e)};this.debug("Creating new MakeShiftPort with options: "+ee(t)),this.slipDecoder.on("data",(e=>{this.parseSlipPacketHeader(e)})),this.open()}parseSlipPacketHeader(e){this._prevAckTime=Date.now();const t=e.subarray(0,1).at(0),r=e.subarray(1);switch(this.debug(e),t){case $e.STATE_UPDATE:{let e=Ye.parseStateFromBuffer(r);this.emit(je.DEVICE.STATE_UPDATE,e),this.debug("state updating"),this.handleStateUpdate(e);break}case $e.ACK:this.debug("Got ACK from MakeShift");break;case $e.STRING:this.debug(r.toString());break;case $e.PING:this.debug("Got PING from MakeShift, responding with ACK"),this.sendByte($e.ACK);break;case $e.ERROR:this.debug("Got ERROR from MakeShift");break;case $e.READY:this.debug("Got READY from MakeShift"),this.debug(r.toString()),xe++,this._deviceReady=!0,this._id=r.toString().replaceAll("-",""),this._msger.host=this.host,this._prevAckTime=Date.now(),this.deviceEvent("Device connection established"),this.emit(je.DEVICE.CONNECTED,this.fingerPrint);break;default:this.debug(t),this.debug(e.toString())}}ping(){this.sendByte($e.PING)}handleStateUpdate(e){this.debug("Handling state update");for(let t=0;t<Fe;t++)if(e.buttons[t]!=this.prevState.buttons[t]){let r;r=!0===e.buttons[t]?je.BUTTON[t].PRESSED:je.BUTTON[t].RELEASED,this.emit(r,{state:e,event:r}),this.deviceEvent(`${r} with state ${e.buttons[t]}`)}for(let t=0;t<Ue;t++)if(e.dials[t],this.prevState.dials[t],0!==e.dialsRelative[t]){let r;this.emit(je.DIAL[t].CHANGED,{state:e,event:r}),r=e.dialsRelative[t]>0?je.DIAL[t].INCREMENT:je.DIAL[t].DECREMENT,this.emit(r,{state:e,event:r}),this.deviceEvent(`${r} with state ${e.dials[t]}`)}this.prevState=e}sendByte(e){if(this.isOpen)try{this.serialPort.flush();let t=l.from([e]);this.debug(`Sending byte: ${ee(t)}`),this.slipEncoder.write(t)}catch(e){this.error(e)}}send(e,t){if(this.isOpen)try{this.serialPort.flush();let r=l.from([e]),o=l.from(t);const i=l.concat([r,o]);this.debug(`Sending buffer: ${ee(i)}`),this.slipEncoder.write(i)}catch(e){this.error(e)}}static parseStateFromBuffer(e){let t={buttons:[],dials:[],dialsRelative:[]};const r=e.subarray(0,2).reverse(),o=e.subarray(2,6),i=e.subarray(6);function s(e,r){0!==r&&(e%2?t.buttons.push(!0):t.buttons.push(!1),s(Math.floor(e/2),r-1))}r.forEach((e=>s(e,8)));for(let e=0;e<4;e++)t.dialsRelative.push(o.readInt8(e));return t.dials.push(i.readInt32BE(0)),t.dials.push(i.readInt32BE(4)),t.dials.push(i.readInt32BE(8)),t.dials.push(i.readInt32BE(12)),t}async open(){this.serialPort=await new e({path:this.devicePath,baudRate:42069},(e=>{null!=e?(this.error("Something happened while opening port: "),this.error(e),this.emit(je.DEVICE.CONNECTION_ERROR,e)):(this._msger.host=this.host,this.info("SerialPort opened, attaching SLIP translators"),this.slipEncoder.pipe(this.serialPort),this.serialPort.pipe(this.slipDecoder),this.info("Translators ready, sending READY to MakeShift"),this.sendByte($e.READY))}))}close(){this.info("Closing MakeShift port..."),this.info("Unpiping encoders"),this.slipEncoder.unpipe(),this.serialPort.unpipe(),this.isOpen&&(this.info("Port object found open"),this.info("Sending disconnect packet"),this.sendByte($e.DISCONNECT),this.info("Closing port"),this.serialPort.close()),this._msger.host=this.host,xe--,this._deviceReady=!1,this.warn("Port closed, sending disconnect signal"),this.emit(je.DEVICE.DISCONNECTED,this.fingerPrint)}write=e=>{this._deviceReady?this.send($e.STRING,e):this.info("MakeShift not ready, line not sent")}}const Fe=je.BUTTON.length,Ue=je.DIAL.length,Ve={ESC:219,END:192,ESC_END:220,ESC_ESC:221},He={};let Ke=[];const We=new n;let Qe="info",Je=!1,Xe=!0,qe=1e3,ze=5e3,Ze=1500;const et={},tt=new te({host:"PortAuthority",logLevel:"info",showTime:!1});tt.logLevel=Qe,tt.showTime=Je;const rt=tt.getLevelLoggers();function ot(){Xe=!0,ut()}function it(){Xe=!1}function st(){Xe=!1,gt()}function nt(){return Ke}function lt(e){Je=e,tt.showTime=e;for(const t in He)He[t].showTime=e}function at(e){Qe=e,tt.logLevel=e;for(const t in He)He[t].logLevel=e}function ct(e,t){void 0!==He[e]&&(He[e].logLevel=t)}function ht(e){tt.logLevel=e}function ut(){setTimeout((()=>{gt()}),qe),We.emit(dt.scan.started)}function ft(e){et[e]=setTimeout((()=>{!function(e){const t=Date.now()-He[e].prevAckTime;rt.debug(`elapsedTime since prevAckTime: ${t}`),t>ze?(clearTimeout(et[e]),rt.debug(`Timer handle - ${et[e]}`),rt.warn(`Device ${e}::${He[e].devicePath} unresponsive for ${ze}ms, disconnecting`),function(e){if(void 0===He[e])return;const t=He[e].fingerPrint;Ke=Ke.filter((e=>t.devicePath!==e.devicePath&&t.deviceSerial!==e.deviceSerial)),He[e].close(),delete He[e],We.emit(dt.port.closed,t)}(e)):(t>=Ze-40&&He[e].ping(),ft(e))}(e)}),Ze)}async function gt(){rt.debug(`scanForDevice called with autoscan set to ${Xe}`);try{const t=await e.list();t.forEach((e=>{rt.debug(Z(e,1))}));const r=t.filter((e=>("16c0"===e.vendorId||"16C0"===e.vendorId)&&"0483"===e.productId));rt.debug(`Found MakeShift devices: ${ee(r)}`),r.length>0&&r.forEach((e=>{!function(e){const t=e.path;for(const e in He)if(He[e].devicePath===t)return;const r={portInfo:e,logLevel:Qe,showTime:Je};rt.info(`Opening device with options: '${Z(r,1)}'`);let o=new Ye(r);o.once(je.DEVICE.CONNECTED,(e=>{const t=e.deviceSerial;He[t]=o,Ke.push(e),He[t].ping(),ft(t),rt.deviceEvent(`Opened port ${e.devicePath}, with deviceSerial ${Ne.magenta(e.deviceSerial)}`),We.emit(dt.port.opened,e)})),o.once(je.DEVICE.CONNECTION_ERROR,(e=>{rt.error(`Error opening device on port ${t}: ${e.message}`)}))}(e)})),Xe?ut():We.emit(dt.scan.stopped)}catch(e){rt.error(e)}}const dt={port:{opened:"makeshift-pa-port-opened",closed:"makeshift-pa-port-closed"},scan:{started:"makeshift-pa-scan-started",stopped:"makeshift-pa-scan-stopped"}};export{je as DeviceEvents,Ye as MakeShiftPort,$e as PacketType,We as PortAuthority,dt as PortAuthorityEvents,He as Ports,ke as SerialEvents,Ge as defaultMakeShiftPortOptions,nt as getPortFingerPrintSnapShot,qe as scanDelayMs,st as scanOnce,at as setLogLevel,ht as setPortAuthorityLogLevel,ct as setPortLogLevel,lt as setShowTime,ot as startAutoScan,it as stopAutoScan};
