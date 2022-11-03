// export { 
//   PacketType,
//   MakeShiftPortOptions,
//   MakeShiftPort,
//   makeShiftPortOptionsDefault,
//   Events,
// } from "./makeShiftPort"

import { SerialPort } from 'serialport'
import { Events, MakeShiftPort } from './makeShiftPort'
import { LogLevel, Msg, nspct2, nspect } from './msg'
import { nanoid } from 'nanoid'

export const devices: { [index: string]: MakeShiftPort } = {}

let logLevel: LogLevel = 'info'
const msgen = new Msg({ host: 'PortAuthority', logLevel: logLevel })
msgen.logLevel = logLevel
const log = msgen.getLevelLoggers()
let autoscan = true
let pollDelayMs = 1000

export function setLogLevel(lv: LogLevel) {
  logLevel = lv;
  for (const id in devices) {
    devices[id].logLevel = lv
  }
}
export function setPortAuthorityLogLevel(lv: LogLevel) {
  msgen.logLevel = lv
}
export function stopScan() { autoscan = false; }

export function releaseDevice(id: string) {
  if (typeof devices[id] !== 'undefined') {
    delete devices[id]
  }
}


export async function loadDevices() {
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
      foundMakeShiftPorts.forEach((portInfo, idx) => {
        // check if any of the ports have been opened already
        const path = portInfo.path
        for (const id in devices) {
          if (devices[id].devicePath === path) {
            if (devices[id].isOpen === false) { devices[id].open() }
            return
          }
        }
        // if no devices with given path is found, a new device is created
        const id = nanoid(23)
        const options = {
          portInfo: portInfo,
          portPath: path,
          id: id,
          logLevel: logLevel,
        }
        log.info(`Opening device with options: '${nspect(options, 1)}'`)
        devices[id] = new MakeShiftPort(options)

        // this.openPort(path, foundMakeShiftPorts[0])
      })
      let ret = []
      for(const id in devices) {
        ret.push({
          id: devices[id].portId,
          path: devices[id].devicePath
        })
      }
      return ret
    }
    return []
  } catch (e) {
    log.error(e)
  }
}

export * from './makeShiftPort'
export * from './msg'