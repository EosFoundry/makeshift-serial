import { MsgLvStringMap } from "@eos-makeshift/msg";
export declare const DeviceEvents: any;
export declare const HardwareDescriptors: {
    MakeShift: any;
    Sensors: any;
};
export declare const SerialEvents: {
    /**
     * Reverts to regular casing for non-hardware events
     */
    Log: MsgLvStringMap;
};
export type MakeShiftDeviceEvents = typeof DeviceEvents;
export type MakeShiftSerialEvents = typeof SerialEvents;
