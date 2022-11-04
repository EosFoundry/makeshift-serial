# MakeShift Serial Communication Library

This library manages connections and communications between a nodejs runtime and a MakeShift device. It provides access to MakeShift device inputs in the form of node [Events](https://nodejs.org/docs/latest-v16.x/api/events.html)

## Installation

```bash
npm install @eos-makeshift/serial
```

If you'd like to install it globally as a cli tool, you can pass the `-g` or `--global` flag to the install command.

## Usage

This library comes with a cli executable as well as a library that can be called in nodejs environments. Currently it relies on [`serialport`](https://github.com/serialport/node-serialport) to function, so it is not easily usable in a website without some serious fiddling.

### From the CLI

Calling commandline monitoring tool (assuming it is not installed globally):

```bash
npx makeshift-monitor --help
```
If it is installed globally, it should be available to call directly:

```bash
makeshift-monitor --help
```

### Use as javascript library

The TL;DR verison:

```js
import { 
  PortAuthority,
  PortAuthorityEvents, 
  Ports,
  DeviceEvents,
  setLogLevel,
  setPortAuthorityLogLevel
} from '@eos-makeshift/serial'

let makeShiftPortId;

PortAuthority.on(PortAuthorityEvents.port.opened,
  // Ports[portId] is accessible at the time this callback function runs
  (fp) => {
    const makeShiftFp = Ports[fp.portId].fingerPrint
    makeShiftPortId = makeShiftFp.portId
    console.dir(fp)
    console.dir(makeShiftFp)
    
    Ports[makeShiftPortId].on(DeviceEvents.BUTTON[4].PRESSED,
      () => { chickenChicken() }
    )
  }
)

function chickenChicken() {
  // chicken chicken chicken
  console.log('chicken chicken chicken')
}
```

Import and set up event handlers:

```js
import { 
  PortAuthority,
  PortAuthorityEvents, 
  Ports,
  setLogLevel,
  setPortAuthorityLogLevel
} from '@eos-makeshift/serial'

PortAuthority.on(PortAuthorityEvents.port.opened,
  // Ports[portId] is accessible at the time this callback function runs
  (fp) => {
    const newPortFingerPrint = Ports[fp.portId].fingerPrint
    console.dir(fp)
  }
)

```

Scan for ports:

```js
import { startAutoScan } from '@eos-makeshift/serial'

startAutoScan()
```

By default, the library logs events into the terminal, you can turn this off or set different levels with `setLogLevel()` and `setPortAuthorityLevel()`

```js
import {
  setLogLevel,
  setPortAuthorityLogLevel
} from '@eos-makeshift/serial'

setLogLevel('none')
setPortAuthorityLogLevel('none')
```

Adding callbacks for dial turn events:

```js
import { 
  Ports, 
  DeviceEvents 
} from '@eos-makeshift/serial'
// Three different events for dials

// state: number
// NOTE: the id is obtained from watching PortAuthorityEvents 
// or calling getPortFingerPrintSnapShot()
Ports[id].on(Events.DIALS[0].DECREMENT, (state) => {
  console.log(state)
})

Ports[id].on(Events.DIALS[0].INCREMENT, (state) => {
  console.log(state)
})

Ports[id].on(Events.DIALS[0].CHANGED, (state) => {
  console.log(state)
})
```

Callback examples for button press events:

```js
import { Ports, Events, startScan } from '@eos-makeshift/serial'
// state: boolean
// Two different events for buttons (what's a half A-press!?)
Ports[id].on(Events.BUTTONS[0].PRESSED, (state) => {
  console.log(state)
})
Ports[id].on(Events.BUTTONS[0].RELEASED, (state) => {
  console.log(state)
})
```

## How it Works, kinda

`@eos-makeshift/serial` scans serial ports and sends events out as it detects and tries to connect to MakeShift devices that are plugged in via USB.

### Functions

The library has a number of functions (`startAutoScan()`, `scanOnce()`, etc.) for somewhat fine-grained control over its behaviour. Once loaded, it will not do anything until a scan function is called. As the library is mostly event-driven, manually starting device scanning allows the opportunity to set up event handlers for `PortAuthority`.

### PortAuthority

This is an `EventEmitter`, it sends out events as ports are opened and closed. Check `PortAuthorityEvents` for the full list.

...It's technically possible to map stuff to `PortAuthorityEvents.port.opened` and play a game by plugging and unplugging a MakeShift, but it is probably not recommended.

### Port

A port is opened for every MakeShift device as long as the library is set to autoscan. Once a port is opened, it can be accessed directly through the `Ports` import with its `portId`.

Port IDs are currently randomly generated on creation, but the goal is to move to Teensy serial numbers depending on the results cross-platform testing\*.

Ports are `EventEmitter`s and they will emit `DeviceEvents` when buttons are pressed on the device they are attached to. By calling the `Ports[<id>].on()` function, pretty much any code can be set to run for any MakeShift event.

\* Every teensy comes with a unique serial number, however different platforms have slightly different outputs for `serialport.list()` and the consistency of getting the same serial hasn't been tested yet.
