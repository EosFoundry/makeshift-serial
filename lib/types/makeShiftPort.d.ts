/// <reference types="node" />
/// <reference types="node" />
import { PortInfo } from '@serialport/bindings-interface';
import { LogLevel, MsgOptions, Msger, MsgLvStringMap } from './msg';
import { EventEmitter } from 'node:events';
import { Buffer } from 'node:buffer';
export declare enum PacketType {
    PING = 0,
    ACK = 1,
    READY = 2,
    STATE_UPDATE = 3,
    ERROR = 4,
    STRING = 5,
    DISCONNECT = 6
}
export declare type LogMessage = {
    level: LogLevel;
    message: string;
    buffer: Buffer;
};
export declare type MakeShiftPortOptions = {
    logOptions: MsgOptions;
};
export declare const makeShiftPortOptionsDefault: MakeShiftPortOptions;
declare type MakeShiftState = {
    buttons: boolean[];
    dials: number[];
};
export declare class MakeShiftPort extends EventEmitter implements Msger {
    private serialPort;
    private slipEncoder;
    private slipDecoder;
    private timeSinceAck;
    private prevState;
    private _deviceReady;
    private _id;
    private _deviceInfo;
    private _devicePath;
    private _msger;
    private log;
    private debug;
    private info;
    private error;
    private warn;
    private fatal;
    pollDelayMs: number;
    private _keepAliveTimeout;
    private _keepAliveDelayMs;
    private keepAliveTimer;
    private _logLevel;
    get logLevel(): LogLevel;
    set logLevel(l: LogLevel);
    get logTermFormat(): boolean;
    set logTermFormat(tf: boolean);
    /**
     * This technically is a library global, it keeps track of the number of open ports
     */
    static get connectedDevices(): number;
    /**
     * If device connected, returns the path as a string, else returns 'D/C'
     */
    get devicePath(): string;
    /**
     * 23 character id assigned to port on instantiation
     */
    get portId(): string;
    private emitLog;
    constructor(options?: MakeShiftPortOptions);
    private sendByte;
    private send;
    static parseStateFromBuffer(data: Buffer): MakeShiftState;
    openPort(path: string, info: PortInfo): void;
    closePort(): void;
    write(line: string): void;
    scanForDevice(): void;
    host(): string;
}
/**
 * Events are organized so they are accessible as:
 *     Events.<EventSource>[?pseudo-id].SubType?
*/
export declare const Events: {
    DIAL: {
        INCREMENT: string;
        DECREMENT: string;
        CHANGE: string;
    }[];
    BUTTON: {
        PRESSED: string;
        RELEASED: string;
        CHANGE: string;
    }[];
    DEVICE: {
        FOUND: string;
        DISCONNECTED: string;
        CONNECTED: string;
        /**
         * This event is emitted from a raw device signal, and contains *all* the
         * data from a state update. Unless you are doing a spot of hacking on this
         * library, It's likely more useful to listen to specific input events:
         * - @see Events.BUTTON or @see Events.DIAL
         */
        STATE_UPDATE: string;
    };
    TERMINAL: {
        LOG: MsgLvStringMap;
    };
};
export declare type MakeShiftEvents = typeof Events;
export {};
