/// <reference types="node" />
import { MakeShiftPort, MakeShiftPortFingerprint } from './makeShiftPort';
import { LogLevel } from '@eos-makeshift/msg';
import { EventEmitter } from 'node:events';
/**
 * This object contains all connected instances of {@link MakeShiftPort}
 * It is updated as devices connect and disconnect.
 */
export declare const Ports: {
    [index: string]: MakeShiftPort;
};
/**
 * NodeJS {@link https://nodejs.org/api/events.html#emitteroneventname-listener EventEmitter}
 * that handles {@link PortAuthorityEvents} callbacks
 *
 */
export declare const PortAuthority: EventEmitter;
export declare let scanDelayMs: number;
/**
 * Turns on the autoscanner, polling for a MakeShift Device every {@link scanDelayMs}
 *
 * This should be the default way of finding a device for most cases, device
 * connection status can be tracked with {@link PortAuthorityEvents}
 *
 */
export declare function startAutoScan(): void;
/**
 * Turns off auto scanning, does not stop any scans in progress.
 *
 * i.e. there is no guarantee that there will be no new devices between calling
 * and the next check of {@link Ports}
 */
export declare function stopAutoScan(): void;
/**
 * Calls the scanner once
 */
export declare function scanOnce(): void;
export declare function getPortFingerPrintSnapShot(): MakeShiftPortFingerprint[];
/**
 * Sets the timestamp of the logging messages to be visible or not
 * @param s - state of showTime variable
 */
export declare function setShowTime(s: boolean): void;
/**
 * Sets the logging level of all MakeShiftPort instances in {@link Ports}
 * @param lv - desired {@link LogLevel}
 */
export declare function setLogLevel(lv: LogLevel): void;
export declare function setPortLogLevel(deviceSerial: string, lv: LogLevel): void;
/**
 * Sets the logging level of PortAuthority
 *
 * @param lv - desired {@link LogLevel}
 */
export declare function setPortAuthorityLogLevel(lv: LogLevel): void;
/**
 * MakeShiftPortAuthorityEvents API defined here, to avoid typing strings as
 * much as possible
 */
export declare const PortAuthorityEvents: {
    port: {
        opened: string;
        closed: string;
    };
    scan: {
        started: string;
        stopped: string;
    };
};
export type MakeShiftPortAuthorityEvents = typeof PortAuthorityEvents;
export * from './makeShiftPort';
export * from './constants';
export { LogLevel, Msg, nspct2, nspect } from '@eos-makeshift/msg';
