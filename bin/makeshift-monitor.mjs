#!/usr/bin/env node
import {
  Events,
  Msg,
  nspct2,
  strfy,
  logRank,
  setLogLevel,
  loadDevices,
} from '../lib/makeshift-serial.mjs';

import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'

const lstring = JSON.stringify(Object.keys(logRank), null, " ").slice(1, -1).replace(/\n/g, "").replace(/\"/g, '')
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 -l [string] -i')
  .boolean('i')
  .string('l')
  .default('l', 'info')
  .alias('i', 'inspect')
  .alias('l', 'log-level')
  .alias('h', 'help')
  .describe('l', `Sets the log level. Accepted: ${lstring}`)
  .describe('i', 'Logs the event objects recieved.')
  .describe('h', 'Show this message')
  .help('h')
  .argv

let lglv = argv.l

// console.log(argv)

const msgen = new Msg({ host: 'Monitor', logLevel: lglv })
const msg = msgen.getLevelLoggers().info

// Setup Readline
const rl = readline.createInterface({ input: stdin, tabSize: 4, output: stdout });
rl.setPrompt("SEND => ");

stdout.on('end', () => rl.prompt)

// setup MakeShift
setLogLevel(lglv)

let loadedDevices = await loadDevices()
msg(`Loaded ${loadedDevices.length} devices: ${nspct2(loadedDevices)}`)



// if (argv.i === true) {
//   function trawl(node) {
//     if (typeof node === 'string') {
//       msg(`Set up handler for ${node}`)
//       makeShift.on(node, (data) => {
//         msg(`${node} :: ${oStr(data)}`)
//       })
//     } else {
//       for (const prop in node) {
//         trawl(node[prop])
//       }
//     }
//   }
//   trawl(Events)
// }
//  msg('butt')

// // Attach readline to port when connection happens
// makeShift.on(Events.DEVICE.CONNECTED, () => {
//   msgen.host = 'Monitor::' + chalk.green(makeShift.devicePath)
//   rl.on('line', (line) => {
//     makeShift.write(line)
//   })
// })

// // Detach readline when disconnected
// makeShift.on(Events.DEVICE.DISCONNECTED, () => {
//   msgen.host = 'Monitor::' + chalk.yellow(makeShift.devicePath)
//   rl.removeAllListeners()
// })
