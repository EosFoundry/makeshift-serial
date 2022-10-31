#!/usr/bin/env node
import {
  Events,
  MakeShiftPort,
  Msg,
  oStr,
  strfy,
  logRank,
} from '../lib/makeshift-serial.mjs';

import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'

const lstring = JSON.stringify(Object.keys(logRank), null, " ").slice(1, -1).replace(/\n/g, "").replace(/\"/g, '')
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 -l [string]')
  .alias('l', 'log-level')
  .alias('h', 'help')
  .nargs('l', 1)
  .default('l', 'info')
  .describe('l', `Sets the log level. Accepted: ${lstring}`)
  .describe('h', 'Show this message')
  .help('h')
  .argv

let lglv = argv.l

const msgen = new Msg({ host: 'Monitor', level: lglv })
const msg = msgen.getLevelLoggers().info

// Setup Readline
const rl = readline.createInterface({ input: stdin, tabSize: 4, output: stdout });
rl.setPrompt("SEND => ");

stdout.on('end', () => rl.prompt)

// setup MakeShift
const makeShift = new MakeShiftPort({
  logOptions: { level: lglv }
})


// Attach readline to port when connection happens
makeShift.on(Events.DEVICE.CONNECTED, () => {
  msgen.host = 'Monitor::' + chalk.green(makeShift.devicePath)
  rl.on('line', (line) => {
    makeShift.write(line)
  })
})

// Detach readline when disconnected
makeShift.on(Events.DEVICE.DISCONNECTED, () => {
  msgen.host = 'Monitor::' + chalk.yellow(makeShift.devicePath)
  rl.removeAllListeners()
})


Events.DIAL.forEach((ev) => {
  makeShift.on(ev.CHANGE, (state) => {
    msg(`event: ${ev.CHANGE} | state: ${state}`)
  })
})

Events.BUTTON.forEach((ev) => {
  makeShift.on(ev.PRESSED, (state) => {
    msg(`event: ${ev.PRESSED} | state: ${state}`)
  })
  makeShift.on(ev.RELEASED, (state) => {
    msg(`event: ${ev.RELEASED} | state: ${state}`)
  })
})