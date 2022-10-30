import { SerialPort } from 'serialport'
import { SlipEncoder, SlipDecoder } from '@serialport/parser-slip-encoder'
import { Msg, strfy } from './utils'
import { EventEmitter } from 'node:events'
import { nanoid } from 'nanoid'
export { Msg }

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
/** 
 * Events are organized so they are accessible as:
 *     Events.<EventSource>[?pseudo-id].SubType?
*/
export const Events = {
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
    FOUND: 'makeshift-found',
    DISCONNECTED: 'makeshift-disconnect',
    CONNECTED: 'makeshift-connect',
    STATE_UPDATE: 'state-update',
  },
}


const NumOfButtons = Events.BUTTON.length;

const NumOfDials = Events.DIAL.length;

const SLIP_OPTIONS = {
  ESC: 219,
  END: 192,
  ESC_END: 220,
  ESC_ESC: 221,
}

type MakeShiftState = {
  buttons: boolean[];
  dials: number[];
}

export class MakeShiftPort extends EventEmitter {
  private serialPort: SerialPort;
  private slipEncoder = new SlipEncoder(SLIP_OPTIONS)
  private slipDecoder = new SlipDecoder(SLIP_OPTIONS)
  private timeSinceAck: number = 0;
  private prevState: MakeShiftState = {
    buttons: [
      false, false, false, false,
      false, false, false, false,
      false, false, false, false,
      false, false, false, false,
    ],
    dials: [0, 0, 0, 0],
  };

  private deviceReady = false;
  private id = ''
  prompt() {
    let deviceID = this.deviceReady ? this.serialPort.port.fd : ''
    return `MSP(${this.id.slice(0, 4)}:${deviceID})`
  }
  private msg: (any);

  private _pollDelayMs: number = 500;
  private _keepAliveTimeout: number = 5000;
  private _keepAliveDelayMs: number = 1500;
  private keepAliveTimer: NodeJS.Timer;

  constructor() {
    super()
    this.id = nanoid(23)
    this.msg = Msg(this.prompt())
    this.on(Events.DEVICE.STATE_UPDATE, (currState: MakeShiftState) => {
      for (let id = 0; id < NumOfButtons; id++) {
        if (currState.buttons[id] != this.prevState.buttons[id]) {

          if (currState.buttons[id] === true) {
            this.emit(Events.BUTTON[id].PRESSED, currState.buttons[id]);
          }
          else {
            this.emit(Events.BUTTON[id].RELEASED, currState.buttons[id]);
          }
        }
      }
      let delta
      for (let id = 0; id < NumOfDials; id++) {
        delta = this.prevState.dials[id] = currState.dials[id]
        if (delta !== 0) {
          this.emit(Events.DIAL[id].CHANGE, currState.dials[id])
          if (delta > 0) {
            this.emit(Events.DIAL[id].INCREMENT, currState.dials[id])
          } else {
            this.emit(Events.DIAL[id].DECREMENT, currState.dials[id])
          }
        }
      }
      this.prevState = currState
    })

    this.on(Events.DEVICE.CONNECTED, () => {
      this.msg("Device connect event")

      _connectedDevices++
      this.deviceReady = true;
      this.timeSinceAck = Date.now()
      this.keepAliveTimer = setInterval(() => {
        const elapsedTime = Date.now() - this.timeSinceAck
        if (elapsedTime >= this._keepAliveDelayMs - 40) {
          // this.msg(`${this._keepAliveDelayMs}ms keepalive check`)
          if (elapsedTime > this._keepAliveTimeout) {
            this.msg(`Device unresponsive for ${this._keepAliveTimeout}ms, disconnecting`)
            this.closePort()
          } else {
            this.sendByte(PacketType.PING)
          }
        }
      }, this._keepAliveDelayMs)
    })
    this.on(Events.DEVICE.DISCONNECTED, () => {
      _connectedDevices--
      this.deviceReady = true;
      this.msg(`Restart device scanning`)
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
          this.emit(Events.DEVICE.STATE_UPDATE, newState)
          break
        case PacketType.ACK:
          // any packet will act as keepalive ACK, and is handled above
          // this.msg(`Got ACK from MakeShift`)
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
          this.msg(`Got PING from MakeShift, responding with ACK`)
          this.sendByte(PacketType.ACK);
          break
        case PacketType.ERROR:
          this.msg(`Got ERROR from MakeShift`)
          break
        case PacketType.READY:
          this.msg(`Got READY from MakeShift`)
          this.msg(body.toString())
          this.emit(Events.DEVICE.CONNECTED)
          break
        default:
          this.msg(header)
          this.msg(data.toString())
          break
      }
    }); // decoder -> console

    this.scanForDevice()
  } // constructor()

  private sendByte(t: PacketType): void {
    if (this.serialPort.isOpen) {
      this.serialPort.flush()
      let buf = Buffer.from([t])
      // this.msg(`Sending ping:`)
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
      // this.msg(`Sending buffer:`)
      // console.dir(buf)
      this.slipEncoder.write(buf)
    }
  }

  static connectedDevices(): number { return _connectedDevices }

  static parseStateFromBuffer(data: Buffer): MakeShiftState {
    let state: MakeShiftState = {
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
      baudRate: 42069
    }, (e) => {
      if (e != null) {
        this.msg(`Something happened while opening port: `)
        console.dir(e);

        this.msg('Restarting scan for open ports...')
        setTimeout(() => { this.scanForDevice() }, this.pollDelayMs);
      } else {
        this.msg('SerialPort opened, attaching SLIP translators')
        this.slipEncoder.pipe(this.serialPort) // node -> teensy
        this.serialPort.pipe(this.slipDecoder) // teensy -> decoder
        this.sendByte(PacketType.READY)
      }
    })
  }

  closePort() {
    this.msg(`Closing MakeShift port...`)
    this.msg(`Clearing keepalive timer`)
    clearInterval(this.keepAliveTimer)
    this.msg(`Unpiping encoders`)
    this.slipEncoder.unpipe()
    this.serialPort.unpipe()
    if (this.serialPort.isOpen) {
      this.msg(`Port object found open`)
      this.msg(`Sending disconnect packet`)
      this.sendByte(PacketType.DISCONNECT)
      this.msg(`Closing port`)
      this.serialPort.close()
    }
    this.msg(`Port closed, sending disconnect signal`)
    this.emit(Events.DEVICE.DISCONNECTED)
  }

  write(line: string): void {
    if (this.deviceReady) {
      this.send(PacketType.STRING, line)
    } else {
      this.msg("MakeShift not ready, line not sent")
    }
  }

  scanForDevice() {
    SerialPort.list().then((portList) => {
      // portList.forEach(portInfo => {
      //   this.msg(`port vid: ${typeof portInfo.vendorId} \n port pid: ${portInfo.productId}`)
      // })

      let makeShiftPortInfo = portList.filter((portInfo) => {
        return ((portInfo.vendorId === '16c0'
          || portInfo.vendorId === '16C0')
          && (portInfo.productId === '0483'))
      })

      // console.dir(makeShiftPortInfo.length)

      if (makeShiftPortInfo.length > 0) {
        this.msg(`Found MakeShift devices: ${strfy(makeShiftPortInfo)}`)
        let path = makeShiftPortInfo[0].path
        this.emit(Events.DEVICE.FOUND, path)
        this.msg(`Opening device with path '${path}'`)
        this.openPort(path)
      } else {
        this.msg(`No MakeShift devices found, continuing scan...`)
        setTimeout(() => { this.scanForDevice() }, this.pollDelayMs);
      }
    }).catch((e) => {
      this.msg(e)
    })
  }

  get pollDelayMs(): number { return this._pollDelayMs }
  set pollDelayMs(delay: number) { this._pollDelayMs = delay }

}