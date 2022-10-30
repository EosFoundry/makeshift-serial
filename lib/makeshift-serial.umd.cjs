'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var serialport = require('serialport');
var require$$0 = require('stream');
var node_events = require('node:events');
var crypto = require('crypto');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var dist = {};

var decoder = {};

Object.defineProperty(decoder, "__esModule", { value: true });
decoder.SlipDecoder = void 0;
const stream_1$1 = require$$0__default["default"];
/**
 * A transform stream that decodes slip encoded data.
 * @extends Transform
 *
 * Runs in O(n) time, stripping out slip encoding and emitting decoded data. Optionally custom slip escape and delimiters can be provided.
 */
class SlipDecoder extends stream_1$1.Transform {
    constructor(options = {}) {
        super(options);
        const { START, ESC = 0xdb, END = 0xc0, ESC_START, ESC_END = 0xdc, ESC_ESC = 0xdd } = options;
        this.opts = {
            START,
            ESC,
            END,
            ESC_START,
            ESC_END,
            ESC_ESC,
        };
        this.buffer = Buffer.alloc(0);
        this.escape = false;
        this.start = false;
    }
    _transform(chunk, encoding, cb) {
        for (let ndx = 0; ndx < chunk.length; ndx++) {
            let byte = chunk[ndx];
            if (byte === this.opts.START) {
                this.start = true;
                continue;
            }
            else if (undefined == this.opts.START) {
                this.start = true;
            }
            if (this.escape) {
                if (byte === this.opts.ESC_START && this.opts.START) {
                    byte = this.opts.START;
                }
                else if (byte === this.opts.ESC_ESC) {
                    byte = this.opts.ESC;
                }
                else if (byte === this.opts.ESC_END) {
                    byte = this.opts.END;
                }
                else {
                    this.escape = false;
                    this.push(this.buffer);
                    this.buffer = Buffer.alloc(0);
                }
            }
            else {
                if (byte === this.opts.ESC) {
                    this.escape = true;
                    continue;
                }
                if (byte === this.opts.END) {
                    this.push(this.buffer);
                    this.buffer = Buffer.alloc(0);
                    this.escape = false;
                    this.start = false;
                    continue;
                }
            }
            this.escape = false;
            if (this.start) {
                this.buffer = Buffer.concat([this.buffer, Buffer.from([byte])]);
            }
        }
        cb();
    }
    _flush(cb) {
        this.push(this.buffer);
        this.buffer = Buffer.alloc(0);
        cb();
    }
}
decoder.SlipDecoder = SlipDecoder;

var encoder = {};

Object.defineProperty(encoder, "__esModule", { value: true });
encoder.SlipEncoder = void 0;
const stream_1 = require$$0__default["default"];
/**
 * A transform stream that emits SLIP-encoded data for each incoming packet.
 *
 * Runs in O(n) time, adding a 0xC0 character at the end of each
 * received packet and escaping characters, according to RFC 1055.
 */
class SlipEncoder extends stream_1.Transform {
    constructor(options = {}) {
        super(options);
        const { START, ESC = 0xdb, END = 0xc0, ESC_START, ESC_END = 0xdc, ESC_ESC = 0xdd, bluetoothQuirk = false } = options;
        this.opts = {
            START,
            ESC,
            END,
            ESC_START,
            ESC_END,
            ESC_ESC,
            bluetoothQuirk,
        };
    }
    _transform(chunk, encoding, cb) {
        const chunkLength = chunk.length;
        if (this.opts.bluetoothQuirk && chunkLength === 0) {
            // Edge case: push no data. Bluetooth-quirky SLIP parsers don't like
            // lots of 0xC0s together.
            return cb();
        }
        // Allocate memory for the worst-case scenario: all bytes are escaped,
        // plus start and end separators.
        const encoded = Buffer.alloc(chunkLength * 2 + 2);
        let j = 0;
        if (this.opts.bluetoothQuirk == true) {
            encoded[j++] = this.opts.END;
        }
        if (this.opts.START !== undefined) {
            encoded[j++] = this.opts.START;
        }
        for (let i = 0; i < chunkLength; i++) {
            let byte = chunk[i];
            if (byte === this.opts.START && this.opts.ESC_START) {
                encoded[j++] = this.opts.ESC;
                byte = this.opts.ESC_START;
            }
            else if (byte === this.opts.END) {
                encoded[j++] = this.opts.ESC;
                byte = this.opts.ESC_END;
            }
            else if (byte === this.opts.ESC) {
                encoded[j++] = this.opts.ESC;
                byte = this.opts.ESC_ESC;
            }
            encoded[j++] = byte;
        }
        encoded[j++] = this.opts.END;
        cb(null, encoded.slice(0, j));
    }
}
encoder.SlipEncoder = SlipEncoder;

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(decoder, exports);
	__exportStar(encoder, exports);
} (dist));

function strfy(o) { return JSON.stringify(o, null, 2); }
function Msg(n) {
    const name = n;
    return (loggable) => {
        {
            console.log(`${name} ==> `);
            console.log(loggable);
        }
    };
}

const urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

const POOL_SIZE_MULTIPLIER = 128;
let pool, poolOffset;
let fillPool = bytes => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    crypto.randomFillSync(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    crypto.randomFillSync(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
};
let nanoid = (size = 21) => {
  fillPool((size -= 0));
  let id = '';
  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }
  return id
};

let _connectedDevices = 0;
exports.PacketType = void 0;
(function (PacketType) {
    PacketType[PacketType["PING"] = 0] = "PING";
    PacketType[PacketType["ACK"] = 1] = "ACK";
    PacketType[PacketType["READY"] = 2] = "READY";
    PacketType[PacketType["STATE_UPDATE"] = 3] = "STATE_UPDATE";
    PacketType[PacketType["ERROR"] = 4] = "ERROR";
    PacketType[PacketType["STRING"] = 5] = "STRING";
    PacketType[PacketType["DISCONNECT"] = 6] = "DISCONNECT";
})(exports.PacketType || (exports.PacketType = {}));
/**
 * Events are organized so they are accessible as:
 *     Events.<EventSource>[?pseudo-id].SubType?
*/
const Events = {
    DIAL: [
        {
            INCREMENT: 'dial-01-increment',
            DECREMENT: 'dial-01-decrement',
            CHANGE: 'dial-01-change',
        },
        {
            INCREMENT: 'dial-02-increment',
            DECREMENT: 'dial-02-decrement',
            CHANGE: 'dial-02-change',
        },
        {
            INCREMENT: 'dial-03-increment',
            DECREMENT: 'dial-03-decrement',
            CHANGE: 'dial-03-change',
        },
        {
            INCREMENT: 'dial-04-increment',
            DECREMENT: 'dial-04-decrement',
            CHANGE: 'dial-04-change',
        },
    ],
    BUTTON: [
        {
            PRESSED: 'button-01-rise',
            RELEASED: 'button-01-fall',
            CHANGE: 'button-01-change',
        },
        {
            PRESSED: 'button-02-rise',
            RELEASED: 'button-02-fall',
            CHANGE: 'button-02-change',
        },
        {
            PRESSED: 'button-03-rise',
            RELEASED: 'button-03-fall',
            CHANGE: 'button-03-change',
        },
        {
            PRESSED: 'button-04-rise',
            RELEASED: 'button-04-fall',
            CHANGE: 'button-04-change',
        },
        {
            PRESSED: 'button-05-rise',
            RELEASED: 'button-05-fall',
            CHANGE: 'button-05-change',
        },
        {
            PRESSED: 'button-06-rise',
            RELEASED: 'button-06-fall',
            CHANGE: 'button-06-change',
        },
        {
            PRESSED: 'button-07-rise',
            RELEASED: 'button-07-fall',
            CHANGE: 'button-07-change',
        },
        {
            PRESSED: 'button-08-rise',
            RELEASED: 'button-08-fall',
            CHANGE: 'button-08-change',
        },
        {
            PRESSED: 'button-09-rise',
            RELEASED: 'button-09-fall',
            CHANGE: 'button-09-change',
        },
        {
            PRESSED: 'button-10-rise',
            RELEASED: 'button-10-fall',
            CHANGE: 'button-10-change',
        },
        {
            PRESSED: 'button-11-rise',
            RELEASED: 'button-11-fall',
            CHANGE: 'button-11-change',
        },
        {
            PRESSED: 'button-12-rise',
            RELEASED: 'button-12-fall',
            CHANGE: 'button-12-change',
        },
        {
            PRESSED: 'button-13-rise',
            RELEASED: 'button-13-fall',
            CHANGE: 'button-13-change',
        },
        {
            PRESSED: 'button-14-rise',
            RELEASED: 'button-14-fall',
            CHANGE: 'button-14-change',
        },
        {
            PRESSED: 'button-15-rise',
            RELEASED: 'button-15-fall',
            CHANGE: 'button-15-change',
        },
        {
            PRESSED: 'button-16-rise',
            RELEASED: 'button-16-fall',
            CHANGE: 'button-16-change',
        },
    ],
    DEVICE: {
        FOUND: 'makeshift-found',
        DISCONNECTED: 'makeshift-disconnect',
        CONNECTED: 'makeshift-connect',
        STATE_UPDATE: 'state-update',
    },
};
const NumOfButtons = Events.BUTTON.length;
const NumOfDials = Events.DIAL.length;
const SLIP_OPTIONS = {
    ESC: 219,
    END: 192,
    ESC_END: 220,
    ESC_ESC: 221,
};
class MakeShiftPort extends node_events.EventEmitter {
    serialPort;
    slipEncoder = new dist.SlipEncoder(SLIP_OPTIONS);
    slipDecoder = new dist.SlipDecoder(SLIP_OPTIONS);
    timeSinceAck = 0;
    prevState = {
        buttons: [
            false, false, false, false,
            false, false, false, false,
            false, false, false, false,
            false, false, false, false,
        ],
        dials: [0, 0, 0, 0],
    };
    deviceReady = false;
    id = '';
    prompt() {
        let deviceID = this.deviceReady ? this.serialPort.port.fd : '';
        return `MSP(${this.id.slice(0, 4)}:${deviceID})`;
    }
    msg;
    _pollDelayMs = 500;
    _keepAliveTimeout = 5000;
    _keepAliveDelayMs = 1500;
    keepAliveTimer;
    constructor() {
        super();
        this.id = nanoid(23);
        this.msg = Msg(this.prompt());
        this.on(Events.DEVICE.STATE_UPDATE, (currState) => {
            for (let id = 0; id < NumOfButtons; id++) {
                if (currState.buttons[id] != this.prevState.buttons[id]) {
                    if (currState.buttons[id] === true) {
                        this.emit(Events.BUTTON[id].PRESSED, currState.buttons[id]);
                    }
                    else {
                        this.emit(Events.BUTTON[id].RELEASED, currState.buttons[id]);
                    }
                }
            }
            let delta;
            for (let id = 0; id < NumOfDials; id++) {
                delta = this.prevState.dials[id] = currState.dials[id];
                if (delta !== 0) {
                    this.emit(Events.DIAL[id].CHANGE, currState.dials[id]);
                    if (delta > 0) {
                        this.emit(Events.DIAL[id].INCREMENT, currState.dials[id]);
                    }
                    else {
                        this.emit(Events.DIAL[id].DECREMENT, currState.dials[id]);
                    }
                }
            }
            this.prevState = currState;
        });
        this.on(Events.DEVICE.CONNECTED, () => {
            this.msg("Device connect event");
            _connectedDevices++;
            this.deviceReady = true;
            this.timeSinceAck = Date.now();
            this.keepAliveTimer = setInterval(() => {
                const elapsedTime = Date.now() - this.timeSinceAck;
                if (elapsedTime >= this._keepAliveDelayMs - 40) {
                    // this.msg(`${this._keepAliveDelayMs}ms keepalive check`)
                    if (elapsedTime > this._keepAliveTimeout) {
                        this.msg(`Device unresponsive for ${this._keepAliveTimeout}ms, disconnecting`);
                        this.closePort();
                    }
                    else {
                        this.sendByte(exports.PacketType.PING);
                    }
                }
            }, this._keepAliveDelayMs);
        });
        this.on(Events.DEVICE.DISCONNECTED, () => {
            _connectedDevices--;
            this.deviceReady = true;
            this.msg(`Restart device scanning`);
            this.scanForDevice();
        });
        // The decoder is the endpoint which gets the 'raw' data from the makeshift
        // so all the work of parsing the raw data happens here
        this.slipDecoder.on('data', (data) => {
            this.timeSinceAck = Date.now();
            const header = data.slice(0, 1).at(0);
            const body = data.slice(1);
            switch (header) {
                case exports.PacketType.STATE_UPDATE:
                    let newState = MakeShiftPort.parseStateFromBuffer(body);
                    this.emit(Events.DEVICE.STATE_UPDATE, newState);
                    break;
                case exports.PacketType.ACK:
                    // any packet will act as keepalive ACK, and is handled above
                    // this.msg(`Got ACK from MakeShift`)
                    break;
                case exports.PacketType.STRING:
                    let d = new Date();
                    let s = "MKSHFT => ";
                    s += d.getUTCHours();
                    s += ":";
                    s += d.getUTCMinutes();
                    s += ":";
                    s += d.getUTCSeconds();
                    s += ":";
                    s += d.getUTCMilliseconds();
                    console.log(s + ": " + body.toString());
                    break;
                case exports.PacketType.PING:
                    this.msg(`Got PING from MakeShift, responding with ACK`);
                    this.sendByte(exports.PacketType.ACK);
                    break;
                case exports.PacketType.ERROR:
                    this.msg(`Got ERROR from MakeShift`);
                    break;
                case exports.PacketType.READY:
                    this.msg(`Got READY from MakeShift`);
                    this.msg(body.toString());
                    this.emit(Events.DEVICE.CONNECTED);
                    break;
                default:
                    this.msg(header);
                    this.msg(data.toString());
                    break;
            }
        }); // decoder -> console
        this.scanForDevice();
    } // constructor()
    sendByte(t) {
        if (this.serialPort.isOpen) {
            this.serialPort.flush();
            let buf = Buffer.from([t]);
            // this.msg(`Sending ping:`)
            // console.dir(buf)
            this.slipEncoder.write(buf);
        }
    }
    send(t, body) {
        if (this.serialPort.isOpen) {
            this.serialPort.flush();
            let h = Buffer.from([t]);
            let b = Buffer.from(body);
            const buf = Buffer.concat([h, b]);
            // this.msg(`Sending buffer:`)
            // console.dir(buf)
            this.slipEncoder.write(buf);
        }
    }
    static connectedDevices() { return _connectedDevices; }
    static parseStateFromBuffer(data) {
        let state = {
            buttons: [],
            dials: [],
        };
        const buttonsRaw = data.slice(0, 2).reverse();
        const dialsRaw = data.slice(2, 18);
        const bytesToBin = (button, bitCounter) => {
            if (bitCounter === 0) {
                return;
            }
            if (button % 2) {
                state.buttons.push(true);
            }
            else {
                state.buttons.push(false);
            }
            bytesToBin(Math.floor(button / 2), bitCounter - 1);
        };
        buttonsRaw.forEach((b) => bytesToBin(b, 8));
        state.dials.push(dialsRaw.readInt32BE(0));
        state.dials.push(dialsRaw.readInt32BE(4));
        state.dials.push(dialsRaw.readInt32BE(8));
        state.dials.push(dialsRaw.readInt32BE(12));
        return state;
    }
    openPort(path) {
        this.serialPort = new serialport.SerialPort({
            path: path,
            baudRate: 42069
        }, (e) => {
            if (e != null) {
                this.msg(`Something happened while opening port: `);
                console.dir(e);
                this.msg('Restarting scan for open ports...');
                setTimeout(() => { this.scanForDevice(); }, this.pollDelayMs);
            }
            else {
                this.msg('SerialPort opened, attaching SLIP translators');
                this.slipEncoder.pipe(this.serialPort); // node -> teensy
                this.serialPort.pipe(this.slipDecoder); // teensy -> decoder
                this.sendByte(exports.PacketType.READY);
            }
        });
    }
    closePort() {
        this.msg(`Closing MakeShift port...`);
        this.msg(`Clearing keepalive timer`);
        clearInterval(this.keepAliveTimer);
        this.msg(`Unpiping encoders`);
        this.slipEncoder.unpipe();
        this.serialPort.unpipe();
        if (this.serialPort.isOpen) {
            this.msg(`Port object found open`);
            this.msg(`Sending disconnect packet`);
            this.sendByte(exports.PacketType.DISCONNECT);
            this.msg(`Closing port`);
            this.serialPort.close();
        }
        this.msg(`Port closed, sending disconnect signal`);
        this.emit(Events.DEVICE.DISCONNECTED);
    }
    write(line) {
        if (this.deviceReady) {
            this.send(exports.PacketType.STRING, line);
        }
        else {
            this.msg("MakeShift not ready, line not sent");
        }
    }
    scanForDevice() {
        serialport.SerialPort.list().then((portList) => {
            // portList.forEach(portInfo => {
            //   this.msg(`port vid: ${typeof portInfo.vendorId} \n port pid: ${portInfo.productId}`)
            // })
            let makeShiftPortInfo = portList.filter((portInfo) => {
                return ((portInfo.vendorId === '16c0'
                    || portInfo.vendorId === '16C0')
                    && (portInfo.productId === '0483'));
            });
            // console.dir(makeShiftPortInfo.length)
            if (makeShiftPortInfo.length > 0) {
                this.msg(`Found MakeShift devices: ${strfy(makeShiftPortInfo)}`);
                let path = makeShiftPortInfo[0].path;
                this.emit(Events.DEVICE.FOUND, path);
                this.msg(`Opening device with path '${path}'`);
                this.openPort(path);
            }
            else {
                this.msg(`No MakeShift devices found, continuing scan...`);
                setTimeout(() => { this.scanForDevice(); }, this.pollDelayMs);
            }
        }).catch((e) => {
            this.msg(e);
        });
    }
    get pollDelayMs() { return this._pollDelayMs; }
    set pollDelayMs(delay) { this._pollDelayMs = delay; }
}

exports.Events = Events;
exports.MakeShiftPort = MakeShiftPort;
exports.Msg = Msg;
