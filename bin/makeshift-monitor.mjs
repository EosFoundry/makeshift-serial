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
  DeviceEvents,
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
import chalk from 'chalk'
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
// console.dir(logLevel)

const toast = {
  host: 'Monitor',
  logLevel: logLevel,
  showTime: showTime
}

// console.dir(toast)

const msgen = new Msg(toast)
const log = msgen.getLevelLoggers()
const msg = console.log

const connectedPorts = []
const targets = []

let shortSerial = ''
let shortPath = ''
let line = ''
let newline = true
let newPromptTimeout


// setup PortAuthority settings
setShowTime(showTime)
setLogLevel(logLevel)
setPortAuthorityLogLevel(logLevel)

// do the needful
log.deviceEvent(`Starting PortAuthority scan...`)
startAutoScan()


// Setup Readline
const rl = readline.createInterface({
  input: stdin,
  tabSize: 4,
  output: stdout,
});

function updatePrompt() {
  let prompt = `${chalk.blue('Monitor')}`

  if (targets.length > 0) {
    shortSerial = `${chalk.green(targets[0].deviceSerial.slice(0, 4))}`
    shortPath = `${chalk.yellow(targets[0].devicePath.split('/').pop())}`
    prompt += `::${shortSerial}::${shortPath}`
  }
  prompt += ` << `
  rl.setPrompt(prompt)
}

updatePrompt()

rl.on('line', (line) => {
  parseLine(line)
})

PortAuthority.on(PortAuthorityEvents.port.opened, (newFingerprint) => {
  const existingConnection = connectedPorts.find((fp) => {
    return fp.deviceSerial === newFingerprint.deviceSerial
      && fp.devicePath === newFingerprint.devicePath
      && fp.portId === newFingerprint.portId
  })
  if (typeof existingConnection === 'undefined') {
    connectedPorts.push(newFingerprint)
    cmd.target([newFingerprint.deviceSerial])
  }
  updatePrompt()
  flushLineToStdout()
  rl.prompt(true)
})

PortAuthority.on(PortAuthorityEvents.port.closed, (oldFingerprint) => {
  const existingConnection = connectedPorts.find((fp) => {
    return fp.deviceSerial === oldFingerprint.deviceSerial
      && fp.devicePath === oldFingerprint.devicePath
      && fp.portId === oldFingerprint.portId
  })
  if (typeof existingConnection !== 'undefined') {
    connectedPorts.splice(connectedPorts.indexOf(existingConnection), 1)
  }
  updatePrompt()
  flushLineToStdout()
  rl.prompt(true)
})

const cmd = {
  ports: () => {
    if (connectedPorts.length > 0) {
      const portlist = Object.keys(Ports)
      msg(`Ports:\n${strfy(portlist)}`)
    } else {
      msg(`No ports connected.`)
    }
  },
  target: (argsArr) => {
    if (argsArr.length !== 1) {
      msg(`Please specify a single target port serial.`)
    }

    const target = argsArr[0]
    const matches = []
    connectedPorts.forEach((fp) => {
      if (fp.deviceSerial.toString().startsWith(target)) {
        matches.push(fp)
      }
    })

    if (matches.length !== 1) {
      msg(`Couldn't find a singular device that matches serial: ${target}`)
    } else {
      msg(`Sending commands to MakeShift ${matches[0].deviceSerial} :: ${matches[0].devicePath}`)
      targets[0] = matches[0]

      // Ports[targets[0].deviceSerial].on(DeviceEvents.SERIAL.MESSAGE, (data) => { console.dir(data) })
      Ports[targets[0].deviceSerial].on(DeviceEvents.SERIAL.MESSAGE, handleDeviceSerialData)
      updatePrompt()
    }
  }
}

function parseLine(line) {
  const args = line.split(' ')
  const cmdName = args.shift()
  log.debug(`Command: ${cmdName}`)
  log.debug(`Args: ${strfy(args)}`)
  if (typeof cmd[cmdName] !== 'undefined' && targets.length > 0) {
    cmd[cmdName](args)
  } else {
    Ports[targets[0].deviceSerial].write(line)
  }
}


function handleDeviceSerialData(data) {
  clearTimeout(newPromptTimeout)
  data = data.toString()
  line += data
  if (newline === true) {
    console.log('')
    newline = false
  }

  else if (data.endsWith('\n')) {
    newPromptTimeout = setTimeout(() => {
      flushLineToStdout()
      rl.prompt(true)
    }, 100)
  }
}

function flushLineToStdout() {
  process.stdout.write(`${line}`)
  line = 'mkshft'
  line += shortSerial
  line += `::`
  line += shortPath
  line += ` >> `
  newline = true
}


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
