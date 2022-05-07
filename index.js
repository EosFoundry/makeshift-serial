// const { fork } = require('child_process');
// const lsReturnData = fork(__dirname + '/childProcess.js');
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// lsReturnData.on('message', (m) => {
//     console.log('message received');
//     console.log(m);
// })
// setTimeout(() => { console.log('child ended'), 4999})
import { SerialPort } from 'serialport';
import { SlipEncoder, SlipDecoder } from '@serialport/parser-slip-encoder';
import { Msg, strfy } from './lib/utils.js';
var msg = Msg('MakeShiftSerial');
var inputBuffer = [];
var dataTimer;
var SLIP_OPTIONS = {
    ESC: 219,
    END: 192,
    ESC_END: 220,
    ESC_ESC: 221
};
var slipEncoder = new SlipEncoder(SLIP_OPTIONS);
var slipDecoder = new SlipDecoder(SLIP_OPTIONS);
getPort().then(function (port) {
    msg('port connection established');
    slipEncoder.pipe(port); // node -> teensy
    slipEncoder.pipe(process.stdout); // node -> console
    port.pipe(slipDecoder); // teensy -> decoder
    var states = [];
    slipDecoder.on('data', function (data) {
        states = [];
        msg("Data: ".concat(data));
        var buttonsRaw = data.slice(0, 2);
        var dialsRaw = data.slice(2, 6);
        var bytesToBin = function (button, bitCounter) {
            if (bitCounter === 0) {
                return;
            }
            if (button % 2) {
                states.push(true);
            }
            else {
                states.push(false);
            }
            bytesToBin(Math.floor(button / 2), bitCounter - 1);
        };
        buttonsRaw.forEach(function (b) { return bytesToBin(b, 8); });
        // msg(`States: ${states}`);
        // msg(dialsRaw);
    }); // decoder -> console
});
export function getPort() {
    return __awaiter(this, void 0, void 0, function () {
        var portList, makeShiftPortInfo, makeShiftPort, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, SerialPort.list()];
                case 1:
                    portList = _a.sent();
                    makeShiftPortInfo = portList.filter(function (portInfo) {
                        return (portInfo.vendorId === '16c0'
                            && portInfo.productId === '0483');
                    });
                    msg("Found ports: ".concat(strfy(makeShiftPortInfo)));
                    makeShiftPort = new SerialPort({
                        path: makeShiftPortInfo[0].path,
                        baudRate: 9600
                    });
                    return [2 /*return*/, makeShiftPort];
                case 2:
                    e_1 = _a.sent();
                    msg(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// port.write('main screen turn on', function (err) {
//     if (err) {
//         return console.log('Error on write: ', err.message)
//     }
//     console.log('message written')
// })
// port.on('error', function (err) {
//     console.log('Error: ', err.message)
// })
// // upon receiving start transmission ('START' from arduino), do SOMETHING, wait for all data to be
// // received, THEN log data
// //
// // variable scope: var, x is defined outside of function
// const inputBuffer = []
// const inputHistory = []
// port.on('data', function (data) {
//     inputBuffer.push(...data)
//     console.log(JSON.stringify(inputBuffer, '', 2))
//     var bs = String.fromCharCode(...b);
//     if (bs === 'START') {
//         console.log(bs);
//         inputBuffer = inputBuffer.slice(5);
//     } else if (bs === 'END') {
//         let as = inputBuffer.slice(0,-3);
//         as = String.fromCharCode(as);
//         console.log(String.fromCharCode(...as))
//         console.log('END');
//         inputBuffer = []
//     }
// })
// //CLEAR a/BUFFER***
// //if statement not detecting END
// setInterval(() => {
//     port.write('Hi Mom!')
// },
//     5000
// )
