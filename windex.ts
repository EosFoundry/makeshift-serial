import { BUTTON_EV, DIAL_EV, MakeShiftPort, MkshftState, MKSHFT_EV } from './lib/makeShiftPort.js';
import { ReadlineParser } from '@serialport/parser-readline'
import { InputRegistry } from './device.js'

import { loadPlugins, plugins } from "./lib/pluginLoader.js";

import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';

import { Msg, strfy } from './lib/utils.js'

const msg = Msg("MakeShiftSerial")

const rl = readline.createInterface({ input: stdin, tabSize: 4 });

loadPlugins()

plugins['makeshiftctrl-obs'].on('ready', () => {

})


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
  plugins['dummyPlugin'].runFunction('doSomething', [])
  plugins['makeshiftctrl-obs'].callFunction('doThisThing', 
    { sceneName: 'scene1' }
  )
})

BUTTON_EV.PRESSED.forEach((ev) => {
  makeShift.on(ev, () => {
    // do stuff you want
    // do this, then that, etc. et cetera ad nauseum
    msg(ev)
  })
})

BUTTON_EV.PRESSED.forEach((ev) => {
  makeShift.on(ev, () => {
    msg(ev)
  })
})
