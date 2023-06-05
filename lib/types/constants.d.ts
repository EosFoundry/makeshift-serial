import { MsgLvStringMap } from "@eos-makeshift/msg";
export declare const SerialEvents: {
    /**
     * Reverts to regular casing for non-hardware events
     */
    Log: MsgLvStringMap;
};
export declare const DeviceEvents: any;
export type MakeShiftDeviceEvents = typeof DeviceEvents;
export type MakeShiftSerialEvents = typeof SerialEvents;
