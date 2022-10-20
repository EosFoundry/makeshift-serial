import { SerialPort } from 'serialport';
import require$$0 from 'stream';
import { EventEmitter } from 'node:events';
import { fork } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var dist = {};

var decoder = {};

Object.defineProperty(decoder, "__esModule", { value: true });
decoder.SlipDecoder = void 0;
const stream_1$1 = require$$0;
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
const stream_1 = require$$0;
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

const strfy = (o) => JSON.stringify(o, null, 2);
const Msg = (n) => {
  const name = n;
  return (loggable) => {
    process.stdout.write(`${name} ==> `);
    if (typeof loggable !== 'string') {
      console.dir(loggable);
    } else {
      console.log(loggable);
    }
  }
};

const msg$1 = Msg("MakeShiftPort");
let _connectedDevices = 0;
const MKSHFT_EV = {
    FOUND: 'makeshift-found',
    DISCONNECTED: 'makeshift-disconnect',
    CONNECTED: 'makeshift-connect',
    STATE_UPDATE: 'state-update',
};
const BUTTON_EV = {
    PRESSED: [
        'button-01-rise',
        'button-02-rise',
        'button-03-rise',
        'button-04-rise',
        'button-05-rise',
        'button-06-rise',
        'button-07-rise',
        'button-08-rise',
        'button-09-rise',
        'button-10-rise',
        'button-11-rise',
        'button-12-rise',
        'button-13-rise',
        'button-14-rise',
        'button-15-rise',
        'button-16-rise',
    ],
    RELEASED: [
        'button-01-fall',
        'button-02-fall',
        'button-03-fall',
        'button-04-fall',
        'button-05-fall',
        'button-06-fall',
        'button-07-fall',
        'button-08-fall',
        'button-09-fall',
        'button-10-fall',
        'button-11-fall',
        'button-12-fall',
        'button-13-fall',
        'button-14-fall',
        'button-15-fall',
        'button-16-fall',
    ]
};
const NumOfButtons = BUTTON_EV.PRESSED.length;
const DIAL_EV = [
    'dial-01',
    'dial-02',
    'dial-03',
    'dial-04',
];
const NumOfDials = DIAL_EV.length;
const Events = {
    DIAL: DIAL_EV,
    BUTTON: BUTTON_EV,
    DEVICE: MKSHFT_EV,
};
var PacketType;
(function (PacketType) {
    PacketType[PacketType["PING"] = 0] = "PING";
    PacketType[PacketType["ACK"] = 1] = "ACK";
    PacketType[PacketType["READY"] = 2] = "READY";
    PacketType[PacketType["STATE_UPDATE"] = 3] = "STATE_UPDATE";
    PacketType[PacketType["ERROR"] = 4] = "ERROR";
    PacketType[PacketType["STRING"] = 5] = "STRING";
    PacketType[PacketType["DISCONNECT"] = 6] = "DISCONNECT";
})(PacketType || (PacketType = {}));
const SLIP_OPTIONS = {
    ESC: 219,
    END: 192,
    ESC_END: 220,
    ESC_ESC: 221,
};
class MakeShiftPort extends EventEmitter {
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
    _pollDelayMs = 500;
    _keepAliveTimeout = 5000;
    _keepAliveDelayMs = 1500;
    keepAliveTimer;
    constructor() {
        super();
        this.on(MKSHFT_EV.STATE_UPDATE, (currState) => {
            let edge;
            for (let id = 0; id < NumOfButtons; id++) {
                if (currState.buttons[id] != this.prevState.buttons[id]) {
                    if (currState.buttons[id]) {
                        edge = 'PRESSED';
                    }
                    else {
                        edge = 'RELEASED';
                    }
                    this.emit(BUTTON_EV[edge][id], currState.buttons[id]);
                }
            }
            for (let id = 0; id < NumOfDials; id++) {
                if (currState.dials[id] != this.prevState.dials[id]) {
                    this.emit(DIAL_EV[id], currState.dials[id]);
                }
            }
            this.prevState = currState;
        });
        this.on(MKSHFT_EV.CONNECTED, () => {
            msg$1("Device connect event");
            _connectedDevices++;
            this.deviceReady = true;
            this.timeSinceAck = Date.now();
            this.keepAliveTimer = setInterval(() => {
                const elapsedTime = Date.now() - this.timeSinceAck;
                if (elapsedTime >= this._keepAliveDelayMs - 40) {
                    // msg(`${this._keepAliveDelayMs}ms keepalive check`)
                    if (elapsedTime > this._keepAliveTimeout) {
                        msg$1(`Device unresponsive for ${this._keepAliveTimeout}ms, disconnecting`);
                        this.closePort();
                    }
                    else {
                        this.sendByte(PacketType.PING);
                    }
                }
            }, this._keepAliveDelayMs);
        });
        this.on(MKSHFT_EV.DISCONNECTED, () => {
            _connectedDevices--;
            this.deviceReady = true;
            msg$1(`Restart device scanning`);
            this.scanForDevice();
        });
        // The decoder is the endpoint which gets the 'raw' data from the makeshift
        // so all the work of parsing the raw data happens here
        this.slipDecoder.on('data', (data) => {
            this.timeSinceAck = Date.now();
            const header = data.slice(0, 1).at(0);
            const body = data.slice(1);
            switch (header) {
                case PacketType.STATE_UPDATE:
                    let newState = MakeShiftPort.parseStateFromBuffer(body);
                    this.emit(MKSHFT_EV.STATE_UPDATE, newState);
                    break;
                case PacketType.ACK:
                    // any packet will act as keepalive ACK, and is handled above
                    // msg(`Got ACK from MakeShift`)
                    break;
                case PacketType.STRING:
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
                case PacketType.PING:
                    msg$1(`Got PING from MakeShift, responding with ACK`);
                    this.sendByte(PacketType.ACK);
                    break;
                case PacketType.ERROR:
                    msg$1(`Got ERROR from MakeShift`);
                    break;
                case PacketType.READY:
                    msg$1(`Got READY from MakeShift`);
                    msg$1(body.toString());
                    this.emit(MKSHFT_EV.CONNECTED);
                    break;
                default:
                    msg$1(header);
                    msg$1(data.toString());
                    break;
            }
        }); // decoder -> console
        this.scanForDevice();
    } // constructor()
    sendByte(t) {
        if (this.serialPort.isOpen) {
            this.serialPort.flush();
            let buf = Buffer.from([t]);
            // msg(`Sending ping:`)
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
            // msg(`Sending buffer:`)
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
        this.serialPort = new SerialPort({
            path: path,
            baudRate: 42069
        }, (e) => {
            if (e != null) {
                msg$1(`Something happened while opening port: `);
                console.dir(e);
                msg$1('Restarting scan for open ports...');
                setTimeout(() => { this.scanForDevice(); }, this.pollDelayMs);
            }
            else {
                msg$1('SerialPort opened, attaching SLIP translators');
                this.slipEncoder.pipe(this.serialPort); // node -> teensy
                this.serialPort.pipe(this.slipDecoder); // teensy -> decoder
                this.sendByte(PacketType.READY);
            }
        });
    }
    closePort() {
        msg$1(`Closing MakeShift port...`);
        msg$1(`Clearing keepalive timer`);
        clearInterval(this.keepAliveTimer);
        msg$1(`Unpiping encoders`);
        this.slipEncoder.unpipe();
        this.serialPort.unpipe();
        if (this.serialPort.isOpen) {
            msg$1(`Port object found open`);
            msg$1(`Sending disconnect packet`);
            this.sendByte(PacketType.DISCONNECT);
            msg$1(`Closing port`);
            this.serialPort.close();
        }
        msg$1(`Port closed, sending disconnect signal`);
        this.emit(MKSHFT_EV.DISCONNECTED);
    }
    write(line) {
        if (this.deviceReady) {
            this.send(PacketType.STRING, line);
        }
        else {
            msg$1("MakeShift disconnected, line not sent");
        }
    }
    scanForDevice() {
        SerialPort.list().then((portList) => {
            // portList.forEach(portInfo => {
            //   msg(`port vid: ${typeof portInfo.vendorId} \n port pid: ${portInfo.productId}`)
            // })
            let makeShiftPortInfo = portList.filter((portInfo) => {
                return ((portInfo.vendorId === '16c0'
                    || portInfo.vendorId === '16C0')
                    && (portInfo.productId === '0483'));
            });
            // console.dir(makeShiftPortInfo.length)
            if (makeShiftPortInfo.length > 0) {
                msg$1(`Found MakeShift devices: ${strfy(makeShiftPortInfo)}`);
                let path = makeShiftPortInfo[0].path;
                this.emit(MKSHFT_EV.FOUND, path);
                msg$1(`Opening device with path '${path}'`);
                this.openPort(path);
            }
            else {
                msg$1(`No MakeShift devices found, continuing scan...`);
                setTimeout(() => { this.scanForDevice(); }, this.pollDelayMs);
            }
        }).catch((e) => {
            msg$1(e);
        });
    }
    get pollDelayMs() { return this._pollDelayMs; }
    set pollDelayMs(delay) { this._pollDelayMs = delay; }
}

function sendMessage(p, l, d) {
    const m = {
        label: l,
        data: d
    };
    p.send(m);
}

const msg = Msg('PluginLoader');
const workingDir = process.cwd();
const pluginDir = join(workingDir, '../plugins');
// TODO: CALIBER add your plugin to this list
let plugins = {};
class Plugin extends EventEmitter {
    manifest;
    id;
    functionsAvailable;
    sock;
    msg;
    handleMessage(m) {
        this.msg(`Message received from sock --> Label: ${m.label} | Data: ${strfy(m.data)}`);
        switch (m.label) {
            case 'status':
                if (m.data === 'ready') {
                    super.emit('ready');
                }
                else if (m.data === 'error loading') {
                    this.msg(m.data);
                }
                break;
        }
    }
    ;
    // TODO: get call working
    callFunction(name, message) {
        this.send('call', {
            name: name,
            args: message ? message : {}
        });
    }
    send(label, data) {
        this.sock.send({
            label: label,
            data: data
        });
    }
    runFunction(name, args) {
        this.send('run', {
            name: name,
            args: args ? args : []
        });
    }
    constructor(manifest) {
        super();
        this.id = manifest.name;
        this.manifest = manifest;
        this.functionsAvailable = manifest.functionsAvailable;
        this.msg = Msg(`Plugin object for ${this.id}`);
        this.msg('Creating new event emitter');
        this.msg('Sporking new pluginSock');
        this.sock = fork('./lib/pluginSock.js');
        this.sock.on('message', this.handleMessage.bind(this));
        this.msg('Initializing pluginSock');
        sendMessage(this.sock, 'init');
        this.sock.send({
            label: 'init',
            data: {
                name: this.manifest.name,
                root: './plugins/' + this.manifest.name,
                manifest: this.manifest,
            }
        });
    }
}
function loadPlugins(pluginList) {
    for (let id of pluginList) {
        msg('reading manifest from - ' + id);
        let data = readFileSync(join(pluginDir, id, 'manifest.json'), { encoding: 'UTF8' });
        let manifest = JSON.parse(data);
        msg('Manifest loaded.');
        msg(manifest);
        msg('Forking plugin sock...');
        plugins[id] = new Plugin(manifest);
    }
}

export { Events, MakeShiftPort, loadPlugins, plugins };
