#!/usr/bin/env node
import {
  Ports,
  setLogLevel,
  setPortAuthorityLogLevel,
  setShowTime,
  startAutoScan,
  stopAutoScan,
  PortAuthority,
  PortAuthorityEvents,
  getPortFingerPrintSnapShot,
} from '../lib/makeshift-serial.mjs';

import {
  Msg,
  nspct2,
  strfy,
  logRank,
} from '@eos-makeshift/msg'
import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const lstring = JSON.stringify(Object.keys(logRank), null, " ").slice(1, -1).replace(/\n/g, "").replace(/\"/g, '')
const argv = yargs(hideBin(process.argv))
  .scriptName('makeshift-monitor')
  .usage('Usage: $0 [args]')
  .boolean(['i', 't'])
  .string('l')
  .default('i', false)
  .default('t', false)
  .default('l', 'deviceEvent')
  .alias('i', 'inspect')
  .alias('l', 'log-level')
  .alias('t', 'timestamp')
  .alias('h', 'help')
  .describe('l', `Sets the log level. Accepted: ${lstring}`)
  .describe('i', 'Logs the event objects recieved.')
  .describe('t', 'Set log messages to have a timestamp')
  .describe('h', 'Show this message')
  .help('h')
  .argv

const logLevel = argv.l
const showTime = argv.t

// console.dir(argv)

const msgen = new Msg({
  host: 'Monitor',
  logLevel: logLevel,
  showTime: showTime
})
const log = msgen.getLevelLoggers()
const msg = log.info


// Setup Readline
const rl = readline.createInterface({ input: stdin, tabSize: 4, output: stdout });

// setup PortAuthority settings
setShowTime(showTime)
setLogLevel(logLevel)

// do the needful
log.deviceEvent(`Starting PortAuthority scan...`)
startAutoScan()




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
