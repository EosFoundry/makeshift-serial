import { stat } from "fs";
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
  | 'info'
  | 'debug'
export type LogLevel = 'none' | 'all' | MsgLevel

export const logRank = {
  'all': 0,
  'debug': 1,
  'info': 2,
  'warn': 3,
  'error': 4,
  'fatal': 5,
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
  level?: LogLevel,
  logger?: Function,
  prompt?: string,
  showTime?: boolean,
  symbol?: MsgLvStringMap,
  terminal?: boolean,
}

const colorize: MsgLvFunctorMap = {
  debug: chalk.gray,
  info: chalk.white,
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

export function oStr(o: any): string {
  return inspect(o, {
    colors: true,
    depth: 2
  } as InspectOptions)
}
export class Msg {

  private _debug = () => { }
  private _info = () => { }
  private _warn = () => { }
  private _error = () => { }
  private _fatal = () => { }
  private _defaultLogger(msg: string, lv: LogLevel) {
    console.log(msg);
  }


  prompt: string = ' => '
  host: string = ''
  level: LogLevel = 'all'
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

  symbol: MsgLvStringMap = {
    debug: 'debug',
    info: '',
    warn: '(!)',
    error: '[!]',
    fatal: '{x_X}',
  }

  private assignOptions(depth, opts) {
    for (const prop in opts) {
      if (typeof depth[prop] !== 'object') {
        depth[prop] = opts[prop] || depth[prop]
      } else {
        this.assignOptions(depth[prop], opts[prop])
      }
    }
  }


  getLevelLoggers(): MsgLvFunctorMap {
    return {
      debug: this._debug,
      info: this._info,
      warn: this._warn,
      error: this._error,
      fatal: this._fatal,
    }
  }

  logger: LoggerFn = this._defaultLogger
  resetLogger() { this.logger = this._defaultLogger }

  constructor(options: MsgOptions) {
    this.assignOptions(this, options)
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
        let logString = ''
        if (logRank[this.level] <= logRank[calledLevel]) {
          logString = `${this.ps(calledLevel)}${l}`
          this.logger(logString, calledLevel)
        }
        return logString
      }
    }
  }
};
