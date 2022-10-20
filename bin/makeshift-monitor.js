import {
  Events,
  MakeShiftPort,
} from '../lib/makeshift-serial.js';

import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';

import { Msg, strfy } from '../src/utils.js'


const msg = Msg("MakeShift")
const rl = readline.createInterface({ input: stdin, tabSize: 4, output: stdout });
rl.setPrompt("SEND => ");

stdout.on('end', () => rl.prompt)

const makeShift = new MakeShiftPort()

// Initialize readline

// Initialize connection looper
makeShift.on(Events.DEVICE.CONNECTED, () => {
  rl.on('line', (line) => {
    makeShift.write(line)
  })
})

makeShift.on(Events.DEVICE.DISCONNECTED, () => {
  rl.removeAllListeners()
})



Events.DIAL.forEach((ev) => {
  makeShift.on(ev, (state) => {
    msg(`${ev} - ${state}`)
  })
})
Events.BUTTON.PRESSED.forEach((ev) => {
  makeShift.on(ev, () => {
    msg(`${ev} - ${state}`)
  })
})

Events.BUTTON.RELEASED.forEach((ev) => {
  makeShift.on(ev, () => {
    msg(`${ev} - ${state}`)
  })
})