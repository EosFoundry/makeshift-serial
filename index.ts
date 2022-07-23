import { BUTTON_EV, DIAL_EV, MakeShiftPort, MkshftState, MKSHFT_EV } from './lib/makeShiftPort.js';
import { ReadlineParser } from '@serialport/parser-readline'
import { InputRegistry } from './device.js'

import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';

import { Msg, strfy } from './lib/utils.js'

const msg = Msg("MakeShiftSerial")

const rl = readline.createInterface({ input: stdin, tabSize: 4 });


const makeShift = new MakeShiftPort()

// Initialize readline

// Initialize connection looper
makeShift.on(MKSHFT_EV.CONNECTED, () => {
  rl.setPrompt("SEND => ");
  rl.on('line', (line) => {
    makeShift.write(line)
  })
})

makeShift.on(MKSHFT_EV.DISCONNECTED, () => {
  rl.removeAllListeners()
})

makeShift.on(BUTTON_EV.PRESSED[0], () => {
  msg(`I have pressed button 1`)
})

makeShift.on(BUTTON_EV.RELEASED[0], () => {
  msg(`I have released button 1`)
})