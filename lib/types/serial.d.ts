import { SerialPort } from 'serialport';
export declare function getPort(): Promise<SerialPort<import("@serialport/bindings-cpp").AutoDetectTypes>>;
