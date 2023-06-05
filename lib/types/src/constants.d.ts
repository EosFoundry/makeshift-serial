export declare const SerialEvents: {
    /**
     * Reverts to regular casing for non-hardware events
     */
    Log: MsgLvStringMap;
};
export declare const DeviceEvents: {
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
    DIAL: {
        INCREMENT: string;
        DECREMENT: string;
        CHANGED: string;
    }[];
    BUTTON: {
        PRESSED: string;
        RELEASED: string;
        CHANGED: string;
    }[];
};
export type MakeShiftDeviceEvents = typeof DeviceEvents;
export type MakeShiftSerialEvents = typeof SerialEvents;
