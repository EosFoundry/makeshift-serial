/// <reference types="node" />
/// <reference types="node" />
import { PortInfo } from '@serialport/bindings-interface';
import { LogLevel, Msger, MsgLvStringMap } from '@eos-makeshift/msg';
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
export type LogMessage = {
    level: LogLevel;
    message: string;
    buffer: Buffer;
};
export type MakeShiftPortFingerprint = {
    devicePath: string;
    portId: string;
    deviceSerial: string;
};
export type MakeShiftPortOptions = {
    portInfo: PortInfo;
    logLevel: LogLevel;
    /**
     * this is automatically generated from nanoid if not given
     */
    id?: string;
    showTime?: boolean;
};
export declare const defaultMakeShiftPortOptions: {
    portInfo: PortInfo;
    logLevel: LogLevel;
    id: string;
    showTime: boolean;
};
export type MakeShiftState = {
    buttons: boolean[];
    dials: number[];
};
export declare class MakeShiftPort extends EventEmitter implements Msger {
    private serialPort;
    private slipEncoder;
    private slipDecoder;
    private _prevAckTime;
    private prevState;
    private _deviceReady;
    private _id;
    private _portInfo;
    private _msger;
    private keepAliveTimer;
    get prevAckTime(): number;
    get isOpen(): boolean;
    /**
     * This technically is a library global, it keeps track of the number of open ports
     */
    static get connectedDevices(): number;
    /**
     * If device connected, returns the path as a string, else returns empty string
     */
    get devicePath(): string;
    get deviceSerial(): string;
    get fingerPrint(): MakeShiftPortFingerprint;
    get portInfo(): PortInfo | null;
    /**
     * 23 character id assigned to port on instantiation
     */
    get portId(): string;
    /**
     * Logging related properties
     */
    private log;
    private debug;
    private deviceEvent;
    private info;
    private warn;
    private error;
    private fatal;
    private get host();
    private _logLevel;
    get showTime(): boolean;
    set showTime(show: boolean);
    get logLevel(): LogLevel;
    set logLevel(l: LogLevel);
    get logTermFormat(): boolean;
    set logTermFormat(tf: boolean);
    private emitLog;
    constructor(options: MakeShiftPortOptions);
    private parseSlipPacketHeader;
    ping(): void;
    private handleStateUpdate;
    private sendByte;
    private send;
    static parseStateFromBuffer(data: Buffer): MakeShiftState;
    private open;
    close(): void;
    write: (line: string) => void;
}
/**
 * This constant encodes the MakeShitEvent API, this is done to avoid typing
 * long strings as much as possible, and to allow tooling to do its job
 *
 * Events are organized so they are accessible as:
 *     Events.DIAL[0].INCREMENT
*/
export declare const DeviceEvents: {
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
        DISCONNECTED: string;
        CONNECTED: string;
        /**
         * This event is emitted from a raw device signal, and contains *all* the
         * data from a state update. This is useful when hacking on this library as
         * it provides a ton of event information. For most purposes , it will likely
         * be more useful to listen to specific input events -
         * i.e. DeviceEvents.BUTTON[1].INCREMENT
         */
        STATE_UPDATE: string;
    };
    /**
     * Reverts to regular casing for non-hardware events
     */
    Terminal: {
        Log: MsgLvStringMap;
    };
};
export type MakeShiftDeviceEvents = typeof DeviceEvents;
export declare const DeviceEventsFlat: any;
