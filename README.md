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
npx makeshift-monitor
```

### Use as javascript library

Import and scan for devices:

```js
import { Devices, Events, startScan } from '@eos-makeshift/serial'

startScan()
```

By default, the library outputs logs events into the console, you can turn this off or set different levels with `setLogLevel()`

```js
setLogLevel('info')
```

Adding callbacks for dial turn events:

```js
import { Devices, Events, startScan } from '@eos-makeshift/serial'
// Three different events for dials

// state: number
Devices[id].on(Events.DIALS[0].DECREMENT, (state) => {
  console.log(state)
})

Devices[id].on(Events.DIALS[0].INCREMENT, (state) => {
  console.log(state)
})

Devices[id].on(Events.DIALS[0].CHANGED, (state) => {
  console.log(state)
})
```

Callback examples for button press events:

```js
import { Devices, Events, startScan } from '@eos-makeshift/serial'
// state: boolean
// Two different events for buttons (what's a half A-press!?)
Devices[id].on(Events.BUTTONS[0].PRESSED, (state) => {
  console.log(state)
})
Devices[id].on(Events.BUTTONS[0].RELEASED, (state) => {
  console.log(state)
})
```
