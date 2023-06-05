import { MsgLvStringMap } from "@eos-makeshift/msg";
import * as DeviceSensorEvents from "../hardware-descriptors/generated/makeshift-events.json";

const DeviceFirmwareEvents = {
  DEVICE: {
    CONNECTION_ERROR: 'makeshift-connection-error',
    DISCONNECTED: 'makeshift-disconnect',
    CONNECTED: 'makeshift-connect',
    /**
     * This event is emitted from a raw device signal, and contains *all* the
     * data from a state update. This is useful when hacking on this library as
     * it provides a ton of event information. For most purposes , it will likely
     * be more useful to listen to specific input events -
     * i.e. DeviceEvents.BUTTON[1].INCREMENT
     */
    STATE_UPDATE: 'state-update',
  },
}

export const SerialEvents = {
  /**
   * Reverts to regular casing for non-hardware events
   */
  Log: {
    fatal: 'makeshift-serial-log-fatal',
    error: 'makeshift-serial-log-error',
    warn: 'makeshift-serial-log-warn',
    deviceEvent: 'makeshift-serial-log-event',
    info: 'makeshift-serial-log-info',
    debug: 'makeshift-serial-log-debug',
    all: 'makeshift-serial-log-any',
  } as MsgLvStringMap
}

export const DeviceEvents = {
  ...DeviceSensorEvents,
  ...DeviceFirmwareEvents,
}

export type MakeShiftDeviceEvents = typeof DeviceEvents
export type MakeShiftSerialEvents = typeof SerialEvents