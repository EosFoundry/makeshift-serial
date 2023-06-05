// export { 
//   PacketType,
//   MakeShiftPortOptions,
//   MakeShiftPort,
//   makeShiftPortOptionsDefault,
//   Events,
// } from "./makeShiftPort"

import { SerialPort } from 'serialport'
import { MakeShiftPort, MakeShiftPortFingerprint } from './makeShiftPort'
import { DeviceEvents } from './constants'
import { LogLevel, Msg, nspct2, nspect } from '@eos-makeshift/msg'
import { nanoid } from 'nanoid'
import { PortInfo } from '@serialport/bindings-interface'
import { EventEmitter } from 'node:events'
import chalk from 'chalk'

/**
 * This object contains all connected instances of {@link MakeShiftPort}
 * It is updated as devices connect and disconnect.
 */
export const Ports: { [index: string]: MakeShiftPort } = {}
let portFingerPrints: MakeShiftPortFingerprint[] = []

/**
 * NodeJS {@link https://nodejs.org/api/events.html#emitteroneventname-listener EventEmitter}
 * that handles {@link PortAuthorityEvents} callbacks
 *
 */
export const PortAuthority = new EventEmitter()

let logLevel: LogLevel = 'info'
let showTime = false
let autoscan = true
export let scanDelayMs = 1000
let scannerTimeout: NodeJS.Timeout;

let keepAliveTimeMs: number = 5000
let keepAlivePollTimeMs: number = 1500
const keepAliveTimers: { [index: string]: NodeJS.Timeout } = {};
const Msger = new Msg({ host: 'PortAuthority', logLevel: 'info', showTime: false, })
Msger.logLevel = logLevel
Msger.showTime = showTime
const log = Msger.getLevelLoggers()

/**
 * Turns on the autoscanner, polling for a MakeShift Device every {@link scanDelayMs}
 *  
 * This should be the default way of finding a device for most cases, device
 * connection status can be tracked with {@link PortAuthorityEvents}
 *
 */
export function startAutoScan(): void {
  autoscan = true;
  setScannerTimeout();
}

/**
 * Turns off auto scanning, does not stop any scans in progress.
 * 
 * i.e. there is no guarantee that there will be no new devices between calling
 * and the next check of {@link Ports}
 */
export function stopAutoScan(): void {
  autoscan = false;
}

/**
 * Calls the scanner once
 */
export function scanOnce(): void {
  autoscan = false;
  scan()
}

export function getPortFingerPrintSnapShot(): MakeShiftPortFingerprint[] {
  return portFingerPrints
}

/**
 * Sets the timestamp of the logging messages to be visible or not
 * @param s - state of showTime variable
 */
export function setShowTime(s: boolean): void {
  showTime = s
  Msger.showTime = s
  for (const id in Ports) {
    Ports[id].showTime = s
  }
}

/**
 * Sets the logging level of all MakeShiftPort instances in {@link Ports}
 * @param lv - desired {@link LogLevel}
 */
export function setLogLevel(lv: LogLevel): void {
  logLevel = lv;
  Msger.logLevel = lv
  for (const id in Ports) {
    Ports[id].logLevel = lv
  }
}

export function setPortLogLevel(deviceSerial: string, lv: LogLevel): void {
  if (typeof Ports[deviceSerial] !== 'undefined') {
    Ports[deviceSerial].logLevel = lv
  }
}

/**
 * Sets the logging level of PortAuthority
 * 
 * @param lv - desired {@link LogLevel}
 */
export function setPortAuthorityLogLevel(lv: LogLevel): void {
  Msger.logLevel = lv
}


function setScannerTimeout() {
  scannerTimeout = setTimeout(() => { scan() }, scanDelayMs)
  PortAuthority.emit(PortAuthorityEvents.scan.started)
}

function setKeepAliveTimeout(deviceSerial: string) {
  keepAliveTimers[deviceSerial] = setTimeout(() => {
    checkAlive(deviceSerial)
  }, keepAlivePollTimeMs)
}

function checkAlive(deviceSerial) {
  const elapsedTime = Date.now() - Ports[deviceSerial].prevAckTime
  log.debug(`elapsedTime since prevAckTime: ${elapsedTime}`)

  if (elapsedTime > keepAliveTimeMs) {
    clearTimeout(keepAliveTimers[deviceSerial])

    log.debug(`Timer handle - ${keepAliveTimers[deviceSerial]}`)
    log.warn(`Device ${deviceSerial}::${Ports[deviceSerial].devicePath} unresponsive for ${keepAliveTimeMs}ms, disconnecting`)

    closePort(deviceSerial)
  } else {
    if (elapsedTime >= keepAlivePollTimeMs - 40) {
      Ports[deviceSerial].ping()
    }
    setKeepAliveTimeout(deviceSerial)
  }
}

function closePort(id: string) {
  if (typeof Ports[id] === 'undefined') { return }

  const fp = Ports[id].fingerPrint
  portFingerPrints = portFingerPrints.filter(existingfp => {
    return (
      fp.devicePath !== existingfp.devicePath &&
      fp.deviceSerial !== existingfp.deviceSerial
    )
  })
  Ports[id].close()
  delete Ports[id]
  PortAuthority.emit(PortAuthorityEvents.port.closed, fp)
}

function openPort(portInfo: PortInfo) {
  // check if any of the port is already open
  const path = portInfo.path
  for (const id in Ports) {
    if (Ports[id].devicePath === path) {
      return
    }
  }
  // if no devices with given path is found, a new device is created
  const options = {
    portInfo: portInfo,
    logLevel: logLevel,
    showTime: showTime,
  }

  log.info(`Opening device with options: '${nspect(options, 1)}'`)

  let maybePort = new MakeShiftPort(options)

  maybePort.once(DeviceEvents.DEVICE.CONNECTED, (fp: MakeShiftPortFingerprint) => {
    const id = fp.deviceSerial
    Ports[id] = maybePort
    portFingerPrints.push(fp)
    Ports[id].ping()
    setKeepAliveTimeout(id)
    log.deviceEvent(`Opened port ${fp.devicePath}, with deviceSerial ${chalk.magenta(fp.deviceSerial)}`)
    PortAuthority.emit(PortAuthorityEvents.port.opened, fp)
  })
  
  maybePort.once(DeviceEvents.DEVICE.CONNECTION_ERROR, (err: Error) => {
    log.error(`Error opening device on port ${path}: ${err.message}`)
  })
}

/**
 * Internal function, this function normally runs via a setScannerTimeout()
 * call to allow timed asyncronous scanning that can be turned on and off
 * via external events.
 */
async function scan() {
  log.debug(`scanForDevice called with autoscan set to ${autoscan}`)
  try {
    const portList = await SerialPort.list()
    portList.forEach(portInfo => {
      log.debug(nspect(portInfo, 1))
    })

    const foundMakeShiftPorts = portList.filter((portInfo) => {
      return ((portInfo.vendorId === '16c0'
        || portInfo.vendorId === '16C0')
        && (portInfo.productId === '0483'))
    })

    // console.dir(makeShiftPortInfo.length)
    log.debug(`Found MakeShift devices: ${nspct2(foundMakeShiftPorts)}`)

    if (foundMakeShiftPorts.length > 0) {
      foundMakeShiftPorts.forEach((portInfo) => { openPort(portInfo) })
    }
    if (autoscan) {
      setScannerTimeout()
    } else { PortAuthority.emit(PortAuthorityEvents.scan.stopped) }
  } catch (e) {
    log.error(e)
  }
}

/**
 * MakeShiftPortAuthorityEvents API defined here, to avoid typing strings as
 * much as possible
 */
export const PortAuthorityEvents = {
  port: {
    opened: 'makeshift-pa-port-opened',
    closed: 'makeshift-pa-port-closed',
  },
  scan: {
    started: 'makeshift-pa-scan-started',
    stopped: 'makeshift-pa-scan-stopped',
  }
}

export type MakeShiftPortAuthorityEvents = typeof PortAuthorityEvents

export * from './makeShiftPort'
export * from './constants'

// export for documentation?
// export type LogLevel = LogLevel
// export { Msg, nspct2, nspect } from '@eos-makeshift/msg'
