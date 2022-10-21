# MakeShift Serial Communication Library

This library manages connections and communications between a nodejs runtime and a MakeShift device. It provides access to MakeShift device inputs in the form of node [Events](https://nodejs.org/docs/latest-v16.x/api/events.html)

## Installation

```bash
npm install @eos-makeshift/serial
```

## Usage

Calling commandline monitoring tool (assuming it is not installed globally):

```bash
npx makeshift-monitor
```

Import and create instance:

```js
import { Events, MakeShiftPort } from '@eos-makeshift/serial'

const device = new MakeShiftPort()
```

Adding callbacks for dial turn events:

```js
// state: number
// Two different events for buttons
device.on(Events.DIALS[0], (state) => {
  console.log(state)
})
```

Callback examples for button press events:

```js
// state: boolean
// Two different events for buttons (what's a half A-press!?)
device.on(Events.BUTTONS.PRESSED[0], (state) => {
  console.log(state)
})
device.on(Events.BUTTONS.RELEASED[0], (state) => {
  console.log(state)
})
```
