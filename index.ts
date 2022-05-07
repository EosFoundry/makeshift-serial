// const { fork } = require('child_process');
// const lsReturnData = fork(__dirname + '/childProcess.js');

// lsReturnData.on('message', (m) => {
//     console.log('message received');
//     console.log(m);
// })

// setTimeout(() => { console.log('child ended'), 4999})


import { SerialPort } from 'serialport'
import { SlipEncoder, SlipDecoder } from '@serialport/parser-slip-encoder'
import { ReadlineParser } from '@serialport/parser-readline'
import { InputRegistry } from './device.js'

import { Msg, strfy } from './lib/utils.js'
const msg = Msg('MakeShiftSerial');

let inputBuffer:number[] = [];
let dataTimer:NodeJS.Timer;
const SLIP_OPTIONS = {
    ESC: 219,
    END: 192,
    ESC_END: 220,
    ESC_ESC: 221,
}
const slipEncoder = new SlipEncoder(SLIP_OPTIONS);
const slipDecoder = new SlipDecoder(SLIP_OPTIONS);

slipDecoder.on('data', (data: Buffer) => {
    const header = data.slice(0, 1).at(0);
    const body = data.slice(1,19);
    msg(`Header: `)
    msg(header)
    switch (header) {
        case 0:
            msg(`Got init message from MakeShift`);
            break;
        case 1:
            msg(`Got state update from MakeShift`);
            handleStateUpdate(body);
            break;
        default:
            msg(`Got undefined header state: ${header}`);
            break;
    }
    }); // decoder -> console

try {
    let port = await getPort();
    msg('port connection established');
    slipEncoder.pipe(port); // node -> teensy
    slipEncoder.pipe(process.stdout); // node -> console

    port.pipe(slipDecoder); // teensy -> decoder
} catch (e) {
    msg(e);
}

function handleStateUpdate(data:Buffer) {
    let states: boolean[] = [];
    const buttonsRaw = data.slice(0, 2).reverse();
    const dialsRaw = data.slice(2, 18);
    const bytesToBin = (button: number, bitCounter: number) => {
        if (bitCounter === 0) { return; }
        if (button % 2) {
            states.push(true);
        } else {
            states.push(false);
        }
        bytesToBin(Math.floor(button / 2), bitCounter - 1);
    }
    buttonsRaw.forEach((b) => bytesToBin(b, 8),);

    let dials: number[] = [];
    dials.push(dialsRaw.readInt32BE(0));
    dials.push(dialsRaw.readInt32BE(4));
    dials.push(dialsRaw.readInt32BE(8));
    dials.push(dialsRaw.readInt32BE(12));

    msg(`Buttons: ${states}`);
    msg(`Dials:`);
    msg(dials);
}

async function getPort() {
    try {
        const portList = await SerialPort.list();

        // console.dir(portList);

        let makeShiftPortInfo = portList.filter((portInfo) => {
            return (portInfo.vendorId === '16c0'
                && portInfo.productId === '0483');
        });

        msg(`Found ports: ${strfy(makeShiftPortInfo)}`)

        return new SerialPort({
            path: makeShiftPortInfo[0].path,
            baudRate: 9600
        });
    } catch (e) {
        msg(e);
    }
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
