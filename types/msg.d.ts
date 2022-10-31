import { ChalkInstance } from 'chalk';
export declare function filterName(input: any): any;
export declare type MsgLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug';
export declare type LogLevel = 'none' | 'all' | MsgLevel;
export declare const logRank: {
    all: number;
    debug: number;
    info: number;
    warn: number;
    error: number;
    fatal: number;
    none: number;
};
export interface Msger {
    logLevel: LogLevel;
}
export declare type LoggerFn = (msg: string, lv: LogLevel) => void;
export declare type MsgLvFunctorMap = {
    [Property in MsgLevel]: Function;
};
export declare type MsgLvStringMap = {
    [Property in MsgLevel]: string;
};
export declare type MsgOptions = {
    host: string;
    level?: LogLevel;
    logger?: Function;
    prompt?: string;
    showTime?: boolean;
    symbol?: MsgLvStringMap;
    terminal?: boolean;
};
export declare function setColorize(level: LogLevel, colorFn: ChalkInstance): void;
export declare function setWarn(warnFn: ChalkInstance): void;
export declare function strfy(o: any): string;
export declare function oStr(o: any): string;
export declare class Msg {
    private _debug;
    private _info;
    private _warn;
    private _error;
    private _fatal;
    private _defaultLogger;
    prompt: string;
    host: string;
    level: LogLevel;
    terminal: boolean;
    showTime: boolean;
    showMillis: boolean;
    get time(): string;
    ps(calledLevel: any): string;
    symbol: MsgLvStringMap;
    private assignOptions;
    getLevelLoggers(): {
        debug: () => void;
        info: () => void;
        warn: () => void;
        error: () => void;
        fatal: () => void;
    };
    logger: LoggerFn;
    resetLogger(): void;
    constructor(options: MsgOptions);
    private spawnLevelLoggers;
}