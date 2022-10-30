/// <reference types="node" />
/// <reference types="node" />
import { Msg } from './utils';
import { EventEmitter } from 'node:events';
export { Msg };
export declare enum PacketType {
    PING = 0,
    ACK = 1,
    READY = 2,
    STATE_UPDATE = 3,
    ERROR = 4,
    STRING = 5,
    DISCONNECT = 6
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
        STATE_UPDATE: string;
    };
};
declare type MakeShiftState = {
    buttons: boolean[];
    dials: number[];
};
export declare class MakeShiftPort extends EventEmitter {
    private serialPort;
    private slipEncoder;
    private slipDecoder;
    private timeSinceAck;
    private prevState;
    private deviceReady;
    private id;
    prompt(): string;
    private msg;
    private _pollDelayMs;
    private _keepAliveTimeout;
    private _keepAliveDelayMs;
    private keepAliveTimer;
    constructor();
    private sendByte;
    private send;
    static connectedDevices(): number;
    static parseStateFromBuffer(data: Buffer): MakeShiftState;
    openPort(path: string): void;
    closePort(): void;
    write(line: string): void;
    scanForDevice(): void;
    get pollDelayMs(): number;
    set pollDelayMs(delay: number);
}
