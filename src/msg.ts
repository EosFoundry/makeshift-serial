import { stat } from "fs";
import { defu } from 'defu'
import { inspect } from 'node:util'
import chalk, { ChalkInstance } from 'chalk'
import { InspectOptions } from "util";

export function filterName(input) {
  return input.replace(/[^A-Za-z0-9]/g, '').toLowerCase().replace(/-(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });
}

export type MsgLevel =
  'fatal'
  | 'error'
  | 'warn'
  | 'deviceEvent'
  | 'info'
  | 'debug'
export type LogLevel = 'none' | 'all' | MsgLevel

export const logRank = {
  'all': 0,
  'debug': 1,
  'info': 2,
  'deviceEvent': 3,
  'warn': 4,
  'error': 5,
  'fatal': 98,
  'none': 99,
}
export interface Msger {
  logLevel: LogLevel
}

export type LoggerFn = (msg: string, lv: LogLevel) => void;

export type MsgLvFunctorMap = {
  [Property in MsgLevel]: Function
}

export type MsgLvStringMap = {
  [Property in MsgLevel]: string
}

export type MsgOptions = {
  host?: string,
  logLevel?: LogLevel,
  logger?: Function,
  prompt?: string,
  showTime?: boolean,
  symbol?: MsgLvStringMap,
  terminal?: boolean,
}
export const defaultMsgOptions: MsgOptions = {
  host: '',
  logLevel: 'all',
  prompt: ' => ',
  showTime: true,
  symbol: {
    debug: 'dbg',
    info: '',
    deviceEvent: '',
    warn: '(!)',
    error: '[!]',
    fatal: '{x_X}',
  } as MsgLvStringMap,
  terminal: true,
}

const colorize: MsgLvFunctorMap = {
  debug: chalk.gray,
  info: chalk.white,
  deviceEvent: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  fatal: chalk.redBright,
}

export function setColorize(level: LogLevel, colorFn: ChalkInstance) {
  colorize[level] = colorFn;
}
export function setWarn(warnFn: ChalkInstance) {
  colorize.warn = warnFn;
}

export function strfy(o) { return JSON.stringify(o, null, 2) }

export function nspect(o:any, d:number): string {
  return inspect(o, {
    colors: true,
    depth: d,
  } as InspectOptions)

}
export function nspct2(o: any): string {
  return inspect(o, {
    colors: true,
    depth: 2
  } as InspectOptions)
}
export class Msg {

  private _debug = () => { }
  private _info = () => { }
  private _deviceEvent = () => { }
  private _warn = () => { }
  private _error = () => { }
  private _fatal = () => { }
  private _defaultLogger(msg: string, lv: LogLevel) {
    console.log(msg);
  }


  prompt: string = ' => '
  host: string = ''
  logLevel: LogLevel = 'all'
  terminal: boolean = true
  showTime: boolean = true
  showMillis: boolean = false
  get time() {
    const d = new Date()
    let hh = '', mm = '', ss = '';
    if (d.getHours() < 10) {
      hh = '0'
    }
    if (d.getMinutes() < 10) {
      mm = '0'
    }
    if (d.getSeconds() < 10) {
      ss = '0'
    }
    hh += d.getHours()
    mm += d.getMinutes()
    ss += d.getSeconds()


    let tt = hh + ':' + mm + ':' + ss
    if (this.showMillis) { tt += ':' + d.getMilliseconds() }
    return chalk.grey(tt)
  }


  ps(calledLevel) {
    let _ps = ''
    if (this.showTime) {
      _ps += this.time + ' '
    }
    if (this.symbol[calledLevel] !== '') {
      _ps += colorize[calledLevel](this.symbol[calledLevel]) + ' '

    }
    _ps += colorize[calledLevel](this.host)
      + this.prompt
    return _ps
  }

  symbol: MsgLvStringMap

  private assignOptions(setting, givenOptions) {
    for (const prop in givenOptions) {
      if (typeof setting[prop] !== 'object') {
        // console.log('set:: ' + setting[prop])
        // console.log('giv:: ' + givenOptions[prop])
        setting[prop] = givenOptions[prop] || setting[prop]
      } else {
        this.assignOptions(setting[prop], givenOptions[prop])
      }
    }
  }


  getLevelLoggers(): MsgLvFunctorMap {
    return {
      debug: this._debug,
      info: this._info,
      deviceEvent: this._deviceEvent,
      warn: this._warn,
      error: this._error,
      fatal: this._fatal,
    }
  }

  logger: LoggerFn = this._defaultLogger
  resetLogger() { this.logger = this._defaultLogger }

  constructor(options: MsgOptions = defaultMsgOptions) {
    const finalOpts = defu(options, defaultMsgOptions)
    this.assignOptions(this, finalOpts)
    // if (options.symbol) {
    //   for (let prop in this._symbol) {
    //     this._symbol[prop] = options.symbol[prop]
    //   }
    // }
    // if (options.logger) {
    //   this.logger = options.logger
    // }
    // options.prompt ? this.prompt = options.prompt : null

    // this.host = options.host
    // this.terminal = options.terminal
    this.spawnLevelLoggers()
  }

  private spawnLevelLoggers() {
    for (let prop in this.symbol) {
      let calledLevel = prop as MsgLevel

      this['_' + prop] = (l) => {
        const logString = `${this.ps(calledLevel)}${l}`
        if (logRank[this.logLevel] <= logRank[calledLevel]) {
          this.logger(logString, calledLevel)
        }
        return logString
      }
    }
  }
};

