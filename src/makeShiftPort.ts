import { SerialPort } from 'serialport'
import { PortInfo } from '@serialport/bindings-interface'
import { SlipEncoder, SlipDecoder } from '@serialport/parser-slip-encoder'
import {
  Msg, strfy, nspct2, LogLevel, MsgLvFunctorMap, MsgOptions, Msger, LoggerFn, MsgLvStringMap
} from '@eos-makeshift/msg'
import { EventEmitter } from 'node:events'
import { Buffer } from 'node:buffer'
import { filename } from 'pathe/utils'
import { nanoid } from 'nanoid'
import chalk from 'chalk'
import defu from 'defu'

let _connectedDevices = 0;

export enum PacketType {
  PING,
  ACK,
  READY,
  STATE_UPDATE,
  ERROR,
  STRING,
  DISCONNECT,
}

export type LogMessage = {
  level: LogLevel,
  message: string,
  buffer: Buffer,
}

export type MakeShiftPortFingerprint = {
  devicePath: string,
  portId: string,
  deviceSerial: string,
}

export type MakeShiftPortOptions = {
  portInfo: PortInfo,
  logLevel: LogLevel,
  /**
   * this is automatically generated from nanoid if not given
   */
  id?: string,
  showTime?: boolean,
}

export const defaultMakeShiftPortOptions = {
  portInfo: {} as PortInfo,
  logLevel: 'all' as LogLevel,
  id: '',
  showTime: false,
}


export type MakeShiftState = {
  buttons: boolean[];
  dials: number[];
}


export class MakeShiftPort extends EventEmitter implements Msger {

  private serialPort: SerialPort
  private slipEncoder = new SlipEncoder(SLIP_OPTIONS)
  private slipDecoder = new SlipDecoder(SLIP_OPTIONS)
  private _prevAckTime: number = 0
  private prevState: MakeShiftState = {
    buttons: [
      false, false, false, false,
      false, false, false, false,
      false, false, false, false,
      false, false, false, false,
    ],
    dials: [0, 0, 0, 0],
  }

  private _deviceReady = false
  private _id = ''
  private _portInfo: PortInfo | null = null
  private _msger: Msg

  private keepAliveTimer: NodeJS.Timer

  public get prevAckTime(): number { return this._prevAckTime }
  public get isOpen() {
    return (typeof this.serialPort !== 'undefined' && this.serialPort.isOpen)
  }

  //---------- static get/setters

  /**
   * This technically is a library global, it keeps track of the number of open ports
   */
  static get connectedDevices(): number { return _connectedDevices }

  //---------- public get/setters

  /**
   * If device connected, returns the path as a string, else returns empty string 
   */
  public get devicePath(): string {
    if (this._portInfo !== null) {
      return this._portInfo.path
    } else {
      return ''
    }
  }

  public get deviceSerial(): string {
    if (this._portInfo !== null) {
      return this._portInfo.serialNumber
    } else {
      return ''
    }
  }
  public get fingerPrint(): MakeShiftPortFingerprint {
    return {
      devicePath: this.devicePath,
      deviceSerial: this.deviceSerial,
      portId: this.portId,
    }
  }
  public get portInfo(): PortInfo | null {
    return this._portInfo
  }

  /**
   * 23 character id assigned to port on instantiation
   */
  public get portId(): string {
    return this._id
    // if (this._portInfo !== null) {
    //   return this._portInfo.serialNumber
    // } else { return this._id }
  }

  /**
   * Logging related properties
   */
  private log: MsgLvFunctorMap
  private debug: Function
  private deviceEvent: Function
  private info: Function
  private warn: Function
  private error: Function
  private fatal: Function

  private get host(): string {
    let str = `Port:${chalk.magenta(this.deviceSerial.slice(0, 4))}|`
    if (this.isOpen) {
      str += chalk.green(filename(this.devicePath))
    } else {
      str += chalk.yellow('D/C')
    }
    return str
  }

  private _logLevel: LogLevel = 'all'
  public get showTime(): boolean { return this._msger.showTime }
  public set showTime(show: boolean) { this._msger.showTime = show }
  public get logLevel(): LogLevel { return this._logLevel }
  public set logLevel(l: LogLevel) {
    this._logLevel = l
    this._msger.logLevel = l
  }
  public get logTermFormat() { return this._msger.terminal }
  public set logTermFormat(tf: boolean) { this._msger.terminal = tf }

  private emitLog: LoggerFn = (msg: string, lv: LogLevel) => {
    this.emit(DeviceEvents.Terminal.Log[lv], {
      // terminal: this._msger.terminal,
      level: lv,
      message: msg,
      buffer: Buffer.from(msg),
    } as LogMessage)
  }

  constructor(options: MakeShiftPortOptions) {
    super()

    const finalOpts = defu(options, defaultMakeShiftPortOptions);
    // console.log(finalOpts)
    this._id = finalOpts.id === '' ? nanoid(23) : finalOpts.id
    this._portInfo = finalOpts.portInfo as PortInfo
    // set up logging
    this._msger = new Msg()
    this._msger.host = this.host
    this._msger.showTime = finalOpts.showTime
    this.log = this._msger.getLevelLoggers()

    // assign logLevel after _msger initialization
    this.logLevel = finalOpts.logLevel
    for (const lv in this.log) {
      this[lv] = (m: string) => {
        // this bit wraps the loggers from Msg with an emitter
        // so that all logging is also emitted as an event whether
        // or not it gets logged to console
        const logString = this.log[lv](m)
        this.emitLog(logString, lv as LogLevel)
      }
    }
    this.debug('Creating new MakeShiftPort with options: ' + nspct2(finalOpts))

    // The decoder is the endpoint which gets the 'raw' data from the makeshift
    // so all the work of parsing the raw data happens here
    this.slipDecoder.on('data', (d) => { this.onSlipDecoderData(d) }) // decoder -> console

    this.open()
  } // constructor()

  private onSlipDecoderData(data: Buffer) {
    this._prevAckTime = Date.now();
    const header: PacketType = data.slice(0, 1).at(0)
    const body = data.slice(1)
    this.debug(data)
    switch (header) {
      case PacketType.STATE_UPDATE: {
        let newState = MakeShiftPort.parseStateFromBuffer(body)
        this.emit(DeviceEvents.DEVICE.STATE_UPDATE, newState)
        this.handleStateUpdate(newState)
        break
      }
      case PacketType.ACK: {
        // any other packet will also act as keepalive ACK, 
        // and is handled above
        this.debug(`Got ACK from MakeShift`)
        break
      }
      case PacketType.STRING: {
        this.debug(body.toString())
        break
      }
      case PacketType.PING: {
        this.debug(`Got PING from MakeShift, responding with ACK`)
        this.sendByte(PacketType.ACK);
        break
      }
      case PacketType.ERROR: {
        this.debug(`Got ERROR from MakeShift`)
        break
      }
      case PacketType.READY: {
        this.debug(`Got READY from MakeShift`)
        this.debug(body.toString())
        _connectedDevices++
        this._deviceReady = true;
        this._prevAckTime = Date.now()
        this.deviceEvent(`Device connection established`)
        this.emit(DeviceEvents.DEVICE.CONNECTED, this.fingerPrint)
        break
      }
      default: {
        this.debug(header)
        this.debug(data.toString())
        break
      }
    }
  }

  ping() { this.sendByte(PacketType.PING) }

  private handleStateUpdate(currState: MakeShiftState) {
    for (let id = 0; id < NumOfButtons; id++) {
      if (currState.buttons[id] != this.prevState.buttons[id]) {
        let ev;
        if (currState.buttons[id] === true) {
          ev = DeviceEvents.BUTTON[id].PRESSED
        }
        else {
          ev = DeviceEvents.BUTTON[id].RELEASED
        }
        this.emit(ev, { state: currState.buttons[id], event: ev });
        this.deviceEvent(`${ev} with state ${currState.buttons[id]}`)
      }
    }
    let delta
    for (let id = 0; id < NumOfDials; id++) {
      delta = currState.dials[id] - this.prevState.dials[id]
      if (delta !== 0) {
        let ev;
        this.emit(DeviceEvents.DIAL[id].CHANGE, {state: currState.dials[id], event:ev})
        if (delta > 0) {
          ev = DeviceEvents.DIAL[id].INCREMENT
        } else {
          ev = DeviceEvents.DIAL[id].DECREMENT
        }
        this.emit(ev, {state: currState.dials[id], event:ev})
        this.deviceEvent(`${ev} with state ${currState.dials[id]}`)
      }
    }
    this.prevState = currState
  }


  private sendByte(t: PacketType): void {
    if (this.isOpen) {
      try {
        this.serialPort.flush()
        let buf = Buffer.from([t])
        this.debug(`Sending byte: ${nspct2(buf)}`)
        this.slipEncoder.write(buf)
      } catch (e) {
        this.error(e)
      }
    }
  }

  private send(t: PacketType, body: string): void {
    if (this.isOpen) {
      try {
        this.serialPort.flush()
        let h = Buffer.from([t])
        let b = Buffer.from(body)
        const buf = Buffer.concat([h, b]);
        this.debug(`Sending buffer: ${nspct2(buf)}`)
        // console.dir(buf)
        this.slipEncoder.write(buf)
      } catch (e) {
        this.error(e)
      }
    }
  }


  static parseStateFromBuffer(data: Buffer): MakeShiftState {
    let state: MakeShiftState = {
      buttons: [],
      dials: [],
    }

    const buttonsRaw = data.slice(0, 2).reverse()
    const dialsRaw = data.slice(2, 18)

    function bytesToBin(button: number, bitCounter: number) {
      if (bitCounter === 0) { return; }
      if (button % 2) {
        state.buttons.push(true)
      } else {
        state.buttons.push(false)
      }
      bytesToBin(Math.floor(button / 2), bitCounter - 1)
    }
    buttonsRaw.forEach((b) => bytesToBin(b, 8),)

    state.dials.push(dialsRaw.readInt32BE(0))
    state.dials.push(dialsRaw.readInt32BE(4))
    state.dials.push(dialsRaw.readInt32BE(8))
    state.dials.push(dialsRaw.readInt32BE(12))

    return state
  }

  private async open() {
    this.serialPort = await new SerialPort({
      path: this.devicePath,
      baudRate: 42069
    }, (e) => {
      if (e != null) {
        this.error(`Something happened while opening port: `)
        this.error(e);
      } else {
        this._msger.host = this.host
        this.info('SerialPort opened, attaching SLIP translators')
        this.slipEncoder.pipe(this.serialPort) // node -> teensy
        this.serialPort.pipe(this.slipDecoder) // teensy -> decoder
        this.info('Translators ready, sending READY to MakeShift')
        this.sendByte(PacketType.READY)
      }
    })
  }

  close() {
    this.info(`Closing MakeShift port...`)
    this.info(`Unpiping encoders`)
    this.slipEncoder.unpipe()
    this.serialPort.unpipe()
    if (this.isOpen) {
      this.info(`Port object found open`)
      this.info(`Sending disconnect packet`)
      this.sendByte(PacketType.DISCONNECT)
      this.info(`Closing port`)
      this.serialPort.close()
    }
    this._msger.host = this.host
    _connectedDevices--
    this._deviceReady = false;
    this.warn(`Port closed, sending disconnect signal`)
    this.emit(DeviceEvents.DEVICE.DISCONNECTED, this.fingerPrint)
  }

  write = (line: string): void => {
    if (this._deviceReady) {
      this.send(PacketType.STRING, line)
    } else {
      this.info("MakeShift not ready, line not sent")
    }
  }
}

//---------- Long constants

/** 
 * This constant encodes the MakeShitEvent API, this is done to avoid typing
 * long strings as much as possible, and to allow tooling to do its job
 *
 * Events are organized so they are accessible as:
 *     Events.DIAL[0].INCREMENT
*/
export const DeviceEvents = {
  DIAL: [
    {
      INCREMENT: 'dial-01-increment',
      DECREMENT: 'dial-01-decrement',
      CHANGE: 'dial-01-change',
    },
    {
      INCREMENT: 'dial-02-increment',
      DECREMENT: 'dial-02-decrement',
      CHANGE: 'dial-02-change',
    },
    {
      INCREMENT: 'dial-03-increment',
      DECREMENT: 'dial-03-decrement',
      CHANGE: 'dial-03-change',
    },
    {
      INCREMENT: 'dial-04-increment',
      DECREMENT: 'dial-04-decrement',
      CHANGE: 'dial-04-change',
    },
  ],

  BUTTON: [
    {
      PRESSED: 'button-01-rise',
      RELEASED: 'button-01-fall',
      CHANGE: 'button-01-change',
    },
    {
      PRESSED: 'button-02-rise',
      RELEASED: 'button-02-fall',
      CHANGE: 'button-02-change',
    },
    {
      PRESSED: 'button-03-rise',
      RELEASED: 'button-03-fall',
      CHANGE: 'button-03-change',
    },
    {
      PRESSED: 'button-04-rise',
      RELEASED: 'button-04-fall',
      CHANGE: 'button-04-change',
    },
    {
      PRESSED: 'button-05-rise',
      RELEASED: 'button-05-fall',
      CHANGE: 'button-05-change',
    },
    {
      PRESSED: 'button-06-rise',
      RELEASED: 'button-06-fall',
      CHANGE: 'button-06-change',
    },
    {
      PRESSED: 'button-07-rise',
      RELEASED: 'button-07-fall',
      CHANGE: 'button-07-change',
    },
    {
      PRESSED: 'button-08-rise',
      RELEASED: 'button-08-fall',
      CHANGE: 'button-08-change',
    },
    {
      PRESSED: 'button-09-rise',
      RELEASED: 'button-09-fall',
      CHANGE: 'button-09-change',
    },
    {
      PRESSED: 'button-10-rise',
      RELEASED: 'button-10-fall',
      CHANGE: 'button-10-change',
    },
    {
      PRESSED: 'button-11-rise',
      RELEASED: 'button-11-fall',
      CHANGE: 'button-11-change',
    },
    {
      PRESSED: 'button-12-rise',
      RELEASED: 'button-12-fall',
      CHANGE: 'button-12-change',
    },
    {
      PRESSED: 'button-13-rise',
      RELEASED: 'button-13-fall',
      CHANGE: 'button-13-change',
    },
    {
      PRESSED: 'button-14-rise',
      RELEASED: 'button-14-fall',
      CHANGE: 'button-14-change',
    },
    {
      PRESSED: 'button-15-rise',
      RELEASED: 'button-15-fall',
      CHANGE: 'button-15-change',
    },
    {
      PRESSED: 'button-16-rise',
      RELEASED: 'button-16-fall',
      CHANGE: 'button-16-change',
    },
  ],
  DEVICE: {
    DISCONNECTED: 'makeshift-disconnect',
    CONNECTED: 'makeshift-connect',
    /**
     * This event is emitted from a raw device signal, and contains *all* the
     * data from a state update. This is useful when hacking on this library as
     * it provides a ton of event information. For most purposes , it will likely
     * be more useful to listen to specific input events -
     * i.e. DeviceEvents.BUTTON[1].INCREMENT
     */
    STATE_UPDATE: 'state-update',
  },
  /**
   * Reverts to regular casing for non-hardware events
   */
  Terminal: {
    Log: {
      fatal: 'makeshift-serial-log-fatal',
      error: 'makeshift-serial-log-error',
      warn: 'makeshift-serial-log-warn',
      deviceEvent: 'makeshift-serial-log-event',
      info: 'makeshift-serial-log-info',
      debug: 'makeshift-serial-log-debug',
      all: 'makeshift-serial-log-any',
    } as MsgLvStringMap
  }
}
export type MakeShiftDeviceEvents = typeof DeviceEvents

function flattenEmitterApi(obj) {
  const ret = []
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      return obj[key]
    } else {
      const subArr = flattenEmitterApi(obj[key])
      if (Array.isArray(subArr)) {
        ret.push(...subArr)
      } else {
        ret.push(subArr)
      }
    }
  }
  return ret
}
export const DeviceEventsFlat = flattenEmitterApi(DeviceEvents)

const NumOfButtons = DeviceEvents.BUTTON.length;

const NumOfDials = DeviceEvents.DIAL.length;

const SLIP_OPTIONS = {
  ESC: 219,
  END: 192,
  ESC_END: 220,
  ESC_ESC: 221,
}
