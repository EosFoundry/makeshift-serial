import { MakeShiftPort } from './makeShiftPort';
import { LogLevel } from './msg';
export declare const Devices: {
    [index: string]: MakeShiftPort;
};
export declare function setShowTime(s: boolean): void;
export declare function setLogLevel(lv: LogLevel): void;
export declare function setPortAuthorityLogLevel(lv: LogLevel): void;
export declare function stopScan(): void;
export declare function startScan(): void;
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
export * from './msg';
