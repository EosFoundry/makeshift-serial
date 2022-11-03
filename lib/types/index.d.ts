import { MakeShiftPort } from './makeShiftPort';
import { LogLevel } from './msg';
export declare const devices: {
    [index: string]: MakeShiftPort;
};
export declare function setLogLevel(lv: LogLevel): void;
export declare function setPortAuthorityLogLevel(lv: LogLevel): void;
export declare function stopScan(): void;
export declare function releaseDevice(id: string): void;
export declare function loadDevices(): Promise<any[]>;
export * from './makeShiftPort';
export * from './msg';
