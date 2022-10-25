import {
  Events,
  MakeShiftPort,
} from '../lib/makeshift-serial.js';

import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import { exec } from 'node:child_process'

import { Msg, strfy } from '../src/utils.js'


const msg = Msg("MakeShift")
const rl = readline.createInterface({ input: stdin, tabSize: 4, output: stdout });
rl.setPrompt("SEND => ");

stdout.on('end', () => rl.prompt)

const makeShift = new MakeShiftPort()

// Attach readline to port when connection happens
makeShift.on(Events.DEVICE.CONNECTED, () => {
  rl.on('line', (line) => {
    makeShift.write(line)
  })
})

// Detach readline when disconnected
makeShift.on(Events.DEVICE.DISCONNECTED, () => {
  rl.removeAllListeners()
})


Events.DIAL.forEach((ev) => {
  makeShift.on(ev.CHANGE, (state) => {
    msg(`${ev} - ${state}`)
  })
})

Events.BUTTON.forEach((ev) => {
  makeShift.on(ev.PRESSED, (state) => {
    msg(`${ev} - ${state}`)
  })
  makeShift.on(ev.RELEASED, (state) => {
    msg(`${ev} - ${state}`)
  })
})