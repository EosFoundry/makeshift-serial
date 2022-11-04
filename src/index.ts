// export { 
//   PacketType,
//   MakeShiftPortOptions,
//   MakeShiftPort,
//   makeShiftPortOptionsDefault,
//   Events,
// } from "./makeShiftPort"

import { SerialPort } from 'serialport'
import { DeviceEvents, MakeShiftPort, MakeShiftPortFingerprint } from './makeShiftPort'
import { LogLevel, Msg, nspct2, nspect } from './msg'
import { nanoid } from 'nanoid'
import { PortInfo } from '@serialport/bindings-interface'
import { EventEmitter } from 'node:events'

export const Devices: { [index: string]: MakeShiftPort } = {}

let logLevel: LogLevel = 'info'
let showTime = false
let autoscan = true
let scanDelayMs = 1000
let scannerTimeout: NodeJS.Timeout;

let keepAliveTimeMs: number = 5000
let keepAlivePollTimeMs: number = 1500
const keepAliveTimers: { [index: string]: NodeJS.Timeout } = {};
const PortAuthority = new EventEmitter()
const Msger = new Msg({ host: 'PortAuthority', logLevel: 'info' })
Msger.logLevel = logLevel
Msger.showTime = showTime
const log = Msger.getLevelLoggers()

export function setShowTime(s: boolean) {
  showTime = s
  Msger.showTime = s
  for (const id in Devices) {
    Devices[id].showTime = s
  }
}

export function setLogLevel(lv: LogLevel) {
  logLevel = lv;
  for (const id in Devices) {
    Devices[id].logLevel = lv
  }
}
export function setPortAuthorityLogLevel(lv: LogLevel) {
  Msger.logLevel = lv
}

export function stopScan() {
  autoscan = false;
}

export function startScan() {
  autoscan = true;
  setScannerTimeout();
}

function setScannerTimeout() {
  scannerTimeout = setTimeout(() => { scan() }, scanDelayMs)
  PortAuthority.emit(PortAuthorityEvents.scan.started)
}

function setKeepAliveTimeout(portId: string) {
  keepAliveTimers[portId] = setTimeout(() => { checkAlive(portId) }, keepAlivePollTimeMs)
}

function checkAlive(portId) {
  const elapsedTime = Date.now() - Devices[portId].prevAckTime
  log.debug(`elapsedTime since prevAckTime: ${elapsedTime}`)
  if (elapsedTime > keepAliveTimeMs) {
    clearTimeout(keepAliveTimers[portId])
    log.debug(`Timer handle - ${keepAliveTimers[portId]}`)
    log.warn(`Device ${portId}::${Devices[portId].devicePath} unresponsive for ${keepAliveTimeMs}ms, disconnecting`)
    closePort(portId)
  } else {
    if (elapsedTime >= keepAlivePollTimeMs - 40) {
      Devices[portId].ping()
    }
    setKeepAliveTimeout(portId)
  }
}

function closePort(id: string) {
  if (typeof Devices[id] !== 'undefined') {
    const fp = Devices[id].fingerPrint
    Devices[id].close()
    delete Devices[id]
    PortAuthority.emit(PortAuthorityEvents.port.closed, fp)
    if (autoscan && Object.keys(Devices).length === 0) {
      setScannerTimeout()
    }
  }
}

function openPort(portInfo: PortInfo) {
  // check if any of the ports have been opened already
  const path = portInfo.path
  for (const id in Devices) {
    if (Devices[id].devicePath === path) {
      return
    }
  }
  // if no devices with given path is found, a new device is created
  const id = nanoid(23)
  const options = {
    portInfo: portInfo,
    id: id,
    logLevel: logLevel,
    showTime: showTime,
  }
  log.info(`Opening device with options: '${nspect(options, 1)}'`)
  Devices[id] = new MakeShiftPort(options)
  Devices[id].ping()
  setKeepAliveTimeout(id)
}

async function scan() {
  log.debug(`scanForDevice called with scan set to ${autoscan}`)
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
      foundMakeShiftPorts.forEach((portInfo) => openPort(portInfo))
    } else if (autoscan) {
      setScannerTimeout()
    } else { PortAuthority.emit(PortAuthorityEvents.scan.stopped) }
  } catch (e) {
    log.error(e)
  }
}

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
export * from './msg'