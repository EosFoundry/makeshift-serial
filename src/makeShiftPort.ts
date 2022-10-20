import { SerialPort } from 'serialport'
import { SlipEncoder, SlipDecoder } from '@serialport/parser-slip-encoder'
import { Msg, strfy } from './utils.js'
import { EventEmitter } from 'node:events'
const msg = Msg("MakeShiftPort")

let _connectedDevices = 0;
export interface MkshftState {
  buttons: boolean[];
  dials: number[];
}

export const MKSHFT_EV = {
  FOUND: 'makeshift-found',
  DISCONNECTED: 'makeshift-disconnect',
  CONNECTED: 'makeshift-connect',
  STATE_UPDATE: 'state-update',
}

export const BUTTON_EV = {
  PRESSED: [
    'button-01-rise',
    'button-02-rise',
    'button-03-rise',
    'button-04-rise',
    'button-05-rise',
    'button-06-rise',
    'button-07-rise',
    'button-08-rise',
    'button-09-rise',
    'button-10-rise',
    'button-11-rise',
    'button-12-rise',
    'button-13-rise',
    'button-14-rise',
    'button-15-rise',
    'button-16-rise',
  ],
  RELEASED: [
    'button-01-fall',
    'button-02-fall',
    'button-03-fall',
    'button-04-fall',
    'button-05-fall',
    'button-06-fall',
    'button-07-fall',
    'button-08-fall',
    'button-09-fall',
    'button-10-fall',
    'button-11-fall',
    'button-12-fall',
    'button-13-fall',
    'button-14-fall',
    'button-15-fall',
    'button-16-fall',
  ]
}
const NumOfButtons = BUTTON_EV.PRESSED.length;

export const DIAL_EV = [
  'dial-01',
  'dial-02',
  'dial-03',
  'dial-04',
]
const NumOfDials = DIAL_EV.length;

export const Events = {
  DIAL: DIAL_EV,
  BUTTON: BUTTON_EV,
  DEVICE: MKSHFT_EV,
}

enum PacketType {
  PING,
  ACK,
  READY,
  STATE_UPDATE,
  ERROR,
  STRING,
  DISCONNECT,
}

const SLIP_OPTIONS = {
  ESC: 219,
  END: 192,
  ESC_END: 220,
  ESC_ESC: 221,
}

export class MakeShiftPort extends EventEmitter {
  private serialPort: SerialPort;
  private slipEncoder = new SlipEncoder(SLIP_OPTIONS)
  private slipDecoder = new SlipDecoder(SLIP_OPTIONS)
  private timeSinceAck: number = 0;
  private prevState: MkshftState = { buttons: [], dials: [] };

  private deviceReady = false;

  private _pollDelayMs: number = 500;
  private _keepAliveTimeout: number = 5000;
  private _keepAliveDelayMs: number = 1500;
  private keepAliveTimer: NodeJS.Timer;

  constructor() {
    super()
    this.prevState.buttons.fill(false);
    this.prevState.dials.fill(0);
    this.on(MKSHFT_EV.STATE_UPDATE, (currState: MkshftState) => {
      let edge;
      for (let id = 0; id < NumOfButtons; id++) {
        if (currState.buttons[id] != this.prevState.buttons[id]) {
          if (currState.buttons[id]) {
            edge = 'PRESSED'
          }
          else {
            edge = 'RELEASED'
          }
          this.emit(BUTTON_EV[edge][id], currState.buttons[id]);
        }
      }
      for (let id = 0; id < NumOfDials; id++) {
        if (currState.dials[id] != this.prevState.dials[id]) {
          this.emit(DIAL_EV[id], currState.dials[id])
        }
      }
      this.prevState = currState
    })

    this.on(MKSHFT_EV.CONNECTED, () => {
      msg("Device connect event")

      _connectedDevices++
      this.deviceReady = true;
      this.timeSinceAck = Date.now()
      this.keepAliveTimer = setInterval(() => {
        const elapsedTime = Date.now() - this.timeSinceAck
        if (elapsedTime >= this._keepAliveDelayMs - 40) {
          // msg(`${this._keepAliveDelayMs}ms keepalive check`)
          if (elapsedTime > this._keepAliveTimeout) {
            msg(`Device unresponsive for ${this._keepAliveTimeout}ms, disconnecting`)
            this.closePort()
          } else {
            this.sendByte(PacketType.PING)
          }
        }
      }, this._keepAliveDelayMs)
    })
    this.on(MKSHFT_EV.DISCONNECTED, () => {
      _connectedDevices--
      this.deviceReady = true;
      msg(`Restart device scanning`)
      this.scanForDevice()
    })


    // The decoder is the endpoint which gets the 'raw' data from the makeshift
    // so all the work of parsing the raw data happens here
    this.slipDecoder.on('data', (data: Buffer) => {
      this.timeSinceAck = Date.now();
      const header: PacketType = data.slice(0, 1).at(0)
      const body = data.slice(1)
      switch (header) {
        case PacketType.STATE_UPDATE:
          let newState = MakeShiftPort.parseStateFromBuffer(body)
          this.emit(MKSHFT_EV.STATE_UPDATE, newState)
          break
        case PacketType.ACK:
          // any packet will act as keepalive ACK, and is handled above
          // msg(`Got ACK from MakeShift`)
          break
        case PacketType.STRING:
          let d = new Date()
          let s = "MKSHFT => "
          s += d.getUTCHours()
          s += ":"
          s += d.getUTCMinutes()
          s += ":"
          s += d.getUTCSeconds()
          s += ":"
          s += d.getUTCMilliseconds()
          console.log(s + ": " + body.toString())
          break
        case PacketType.PING:
          msg(`Got PING from MakeShift, responding with ACK`)
          this.sendByte(PacketType.ACK);
          break
        case PacketType.ERROR:
          msg(`Got ERROR from MakeShift`)
          break
        case PacketType.READY:
          msg(`Got READY from MakeShift`)
          msg(body.toString())
          this.emit(MKSHFT_EV.CONNECTED)
          break
        default:
          msg(header)
          msg(data.toString())
          break
      }
    }); // decoder -> console

    this.scanForDevice()
  } // constructor()

  private sendByte(t: PacketType): void {
    if (this.serialPort.isOpen) {
      this.serialPort.flush()
      let buf = Buffer.from([t])
      // msg(`Sending ping:`)
      // console.dir(buf)
      this.slipEncoder.write(buf)
    }
  }

  private send(t: PacketType, body: string): void {
    if (this.serialPort.isOpen) {
      this.serialPort.flush()
      let h = Buffer.from([t])
      let b = Buffer.from(body)
      const buf = Buffer.concat([h, b]);
      // msg(`Sending buffer:`)
      // console.dir(buf)
      this.slipEncoder.write(buf)
    }
  }

  static connectedDevices(): number { return _connectedDevices }

  static parseStateFromBuffer(data: Buffer): MkshftState {
    let state: MkshftState = {
      buttons: [],
      dials: [],
    }

    const buttonsRaw = data.slice(0, 2).reverse()
    const dialsRaw = data.slice(2, 18)
    const bytesToBin = (button: number, bitCounter: number) => {
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

  openPort(path: string): void {
    this.serialPort = new SerialPort({
      path: path,
      baudRate: 115200
    }, (e) => {
      if (e != null) {
        msg(`Something happened while opening port: `)
        console.dir(e);

        msg('Restarting scan for open ports...')
        setTimeout(() => { this.scanForDevice() }, this.pollDelayMs);
      } else {
        msg('SerialPort opened, attaching SLIP translators')
        this.slipEncoder.pipe(this.serialPort) // node -> teensy
        this.serialPort.pipe(this.slipDecoder) // teensy -> decoder
        this.sendByte(PacketType.READY)
      }
    })
  }

  closePort() {
    msg(`Closing MakeShift port...`)
    msg(`Clearing keepalive timer`)
    clearInterval(this.keepAliveTimer)
    msg(`Unpiping encoders`)
    this.slipEncoder.unpipe()
    this.serialPort.unpipe()
    if (this.serialPort.isOpen) {
      msg(`Port object found open`)
      msg(`Sending disconnect packet`)
      this.sendByte(PacketType.DISCONNECT)
      msg(`Closing port`)
      this.serialPort.close()
    }
    msg(`Port closed, sending disconnect signal`)
    this.emit(MKSHFT_EV.DISCONNECTED)
  }


  write(line: string): void {
    if (this.deviceReady) {
      this.send(PacketType.STRING, line)
    } else {
      msg("MakeShift disconnected, line not sent")
    }
  }

  scanForDevice() {
    SerialPort.list().then((portList) => {
      // portList.forEach(portInfo => {
      //   msg(`port vid: ${typeof portInfo.vendorId} \n port pid: ${portInfo.productId}`)
      // })

      let makeShiftPortInfo = portList.filter((portInfo) => {
        return ((portInfo.vendorId === '16c0'
          || portInfo.vendorId === '16C0')
          && (portInfo.productId === '0483'))
      })

      // console.dir(makeShiftPortInfo.length)

      if (makeShiftPortInfo.length > 0) {
        msg(`Found MakeShift devices: ${strfy(makeShiftPortInfo)}`)
        let path = makeShiftPortInfo[0].path
        this.emit(MKSHFT_EV.FOUND, path)
        msg(`Opening device with path '${path}'`)
        this.openPort(path)
      } else {
        msg(`No MakeShift devices found, continuing scan...`)
        setTimeout(() => { this.scanForDevice() }, this.pollDelayMs);
      }
    }).catch((e) => {
      msg(e)
    })
  }

  get pollDelayMs(): number { return this._pollDelayMs }
  set pollDelayMs(delay: number) { this._pollDelayMs = delay }

}