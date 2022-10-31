import { ChalkInstance } from 'chalk';
export declare type MsgLevel = 'fatal' | 'error' | 'warn' | 'info';
export declare type LogLevel = 'off' | 'all' | MsgLevel;
export interface Msger {
    logLevel: LogLevel;
}
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
    symbol?: MsgLvStringMap;
    terminal?: boolean;
};
export declare function setColorize(level: LogLevel, colorFn: ChalkInstance): void;
export declare function setWarn(warnFn: ChalkInstance): void;
export declare function strfy(o: any): string;
export declare function oStr(o: any): string;
export declare class Msg {
    prompt: string;
    host: string;
    level: LogLevel;
    terminal: boolean;
    get symbol(): any;
    private _symbol;
    logger: (any);
    constructor(options?: MsgOptions);
    getLoggers(): MsgLvFunctorMap;
}
