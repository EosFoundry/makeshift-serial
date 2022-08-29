'use strict';

var serialport = require('serialport');
var parserSlipEncoder = require('@serialport/parser-slip-encoder');
var node_events = require('node:events');
var child_process = require('child_process');
var fs = require('fs');
var url = require('url');
var events = require('events');
var path = require('path');
var readline = require('node:readline');
var node_process = require('node:process');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespace(path);
var readline__namespace = /*#__PURE__*/_interopNamespace(readline);

const strfy = (o) => JSON.stringify(o, null, 2);
const Msg = (n) => {
    const name = n;
    return (loggable) => {
        process.stdout.write(`${name} ==> `);
        if (typeof loggable !== 'string') {
            console.dir(loggable);
        }
        else {
            console.log(loggable);
        }
    };
};

const msg$2 = Msg("MakeShiftPort");
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
class MakeShiftPort extends node_events.EventEmitter {
    constructor() {
        super();
        this.slipEncoder = new parserSlipEncoder.SlipEncoder(SLIP_OPTIONS);
        this.slipDecoder = new parserSlipEncoder.SlipDecoder(SLIP_OPTIONS);
        this.timeSinceAck = 0;
        this.prevState = { buttons: [], dials: [] };
        this.deviceReady = false;
        this._pollDelayMs = 500;
        this._keepAliveTimeout = 5000;
        this._keepAliveDelayMs = 1500;
        this.prevState.buttons.fill(false);
        this.prevState.dials.fill(0);
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
            msg$2("Device connect event");
            _connectedDevices++;
            this.deviceReady = true;
            this.timeSinceAck = Date.now();
            this.keepAliveTimer = setInterval(() => {
                const elapsedTime = Date.now() - this.timeSinceAck;
                if (elapsedTime >= this._keepAliveDelayMs - 40) {
                    // msg(`${this._keepAliveDelayMs}ms keepalive check`)
                    if (elapsedTime > this._keepAliveTimeout) {
                        msg$2(`Device unresponsive for ${this._keepAliveTimeout}ms, disconnecting`);
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
            msg$2(`Restart device scanning`);
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
                    msg$2(`Got PING from MakeShift, responding with ACK`);
                    this.sendByte(PacketType.ACK);
                    break;
                case PacketType.ERROR:
                    msg$2(`Got ERROR from MakeShift`);
                    break;
                case PacketType.READY:
                    msg$2(`Got READY from MakeShift`);
                    msg$2(body.toString());
                    this.emit(MKSHFT_EV.CONNECTED);
                    break;
                default:
                    msg$2(header);
                    msg$2(data.toString());
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
        this.serialPort = new serialport.SerialPort({
            path: path,
            baudRate: 115200
        }, (e) => {
            if (e != null) {
                msg$2(`Something happened while opening port: `);
                console.dir(e);
                msg$2('Restarting scan for open ports...');
                setTimeout(() => { this.scanForDevice(); }, this.pollDelayMs);
            }
            else {
                msg$2('SerialPort opened, attaching SLIP translators');
                this.slipEncoder.pipe(this.serialPort); // node -> teensy
                this.serialPort.pipe(this.slipDecoder); // teensy -> decoder
                this.sendByte(PacketType.READY);
            }
        });
    }
    closePort() {
        msg$2(`Closing MakeShift port...`);
        msg$2(`Clearing keepalive timer`);
        clearInterval(this.keepAliveTimer);
        msg$2(`Unpiping encoders`);
        this.slipEncoder.unpipe();
        this.serialPort.unpipe();
        if (this.serialPort.isOpen) {
            msg$2(`Port object found open`);
            msg$2(`Sending disconnect packet`);
            this.sendByte(PacketType.DISCONNECT);
            msg$2(`Closing port`);
            this.serialPort.close();
        }
        msg$2(`Port closed, sending disconnect signal`);
        this.emit(MKSHFT_EV.DISCONNECTED);
    }
    write(line) {
        if (this.deviceReady) {
            this.send(PacketType.STRING, line);
        }
        else {
            msg$2("MakeShift disconnected, line not sent");
        }
    }
    scanForDevice() {
        serialport.SerialPort.list().then((portList) => {
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
                msg$2(`Found MakeShift devices: ${strfy(makeShiftPortInfo)}`);
                let path = makeShiftPortInfo[0].path;
                this.emit(MKSHFT_EV.FOUND, path);
                msg$2(`Opening device with path '${path}'`);
                this.openPort(path);
            }
            else {
                msg$2(`No MakeShift devices found, continuing scan...`);
                setTimeout(() => { this.scanForDevice(); }, this.pollDelayMs);
            }
        }).catch((e) => {
            msg$2(e);
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

const msg$1 = Msg('PluginLoader');
const __filename$1 = url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('bundle.cjs', document.baseURI).href)));
const __dirname$1 = path__namespace.dirname(__filename$1);
const __plugin_dir = path__namespace.join(__dirname$1, '../plugins');
// TODO: CALIBER add your plugin to this list
let pluginList = [
    "dummyPlugin",
    "makeshiftctrl-obs",
];
let plugins = {};
class Plugin extends events.EventEmitter {
    constructor(manifest) {
        super();
        this.id = manifest.name;
        this.manifest = manifest;
        this.functionsAvailable = manifest.functionsAvailable;
        this.msg = Msg(`Plugin object for ${this.id}`);
        this.msg('Creating new event emitter');
        this.msg('Sporking new pluginSock');
        this.sock = child_process.fork('./lib/pluginSock.js');
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
}
function loadPlugins() {
    for (let id of pluginList) {
        msg$1('reading manifest from - ' + id);
        let data = fs.readFileSync(path__namespace.join(__plugin_dir, id, 'manifest.json'), { encoding: 'UTF8' });
        let manifest = JSON.parse(data);
        msg$1('Manifest loaded.');
        msg$1(manifest);
        msg$1('Forking plugin sock...');
        plugins[id] = new Plugin(manifest);
    }
}

const msg = Msg("MakeShiftSerial");
const rl = readline__namespace.createInterface({ input: node_process.stdin, tabSize: 4 });
loadPlugins();
plugins['makeshiftctrl-obs'].on('ready', () => {
});
const makeShift = new MakeShiftPort();
// Initialize readline
// Initialize connection looper
makeShift.on(MKSHFT_EV.CONNECTED, () => {
    rl.setPrompt("SEND => ");
    rl.on('line', (line) => {
        makeShift.write(line);
    });
});
makeShift.on(MKSHFT_EV.DISCONNECTED, () => {
    rl.removeAllListeners();
});
DIAL_EV.forEach((ev) => {
    makeShift.on(ev, (state) => {
        msg(`${ev} - ${state}`);
    });
});
BUTTON_EV.PRESSED.forEach((ev) => {
    makeShift.on(ev, () => {
        // do stuff you want
        // do this, then that, etc. et cetera ad nauseum
        msg(ev);
    });
});
BUTTON_EV.RELEASED.forEach((ev) => {
    makeShift.on(ev, () => {
        msg(ev);
    });
});
