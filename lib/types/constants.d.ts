import { MsgLvStringMap } from "@eos-makeshift/msg";
export declare const DeviceEvents: {
    /**
     * These events are automatically generated from the associated json file in
     * the 'hardware-descriptors' folder.
     */
    DIAL: any[];
    BUTTON: any[];
    DEVICE: {
        CONNECTION_ERROR: string;
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
