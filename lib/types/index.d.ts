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
 * {@link EventEmitter} that handles {@link PortAuthorityEvents} callbacks
 */
export declare const PortAuthority: EventEmitter;
/**
 * Sets the autoscanner into action, scanning every {@link scanDelayMs}
 *
 * This should be the default way of calling for most cases, device connection status
 * should be tracked with {@link PortAuthorityEvents}
 */
export declare function startAutoScan(): void;
/**
 * Turns off auto scanning, does not stop any in progress {@link scan()} calls.
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
export declare function setPortLogLevel(portId: string, lv: LogLevel): void;
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
export declare type MakeShiftPortAuthorityEvents = typeof PortAuthorityEvents;
export * from './makeShiftPort';
