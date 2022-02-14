const { SerialPort } = require('serialport')
const { MockBinding } = require('@serialport/binding-mock')
const { SerialPortStream } = require('@serialport/stream')
const { ReadlineParser } = require('@serialport/parser-readline')

// Create a port and enable the echo and recording.
MockBinding.createPort('/dev/ROBOT', { echo: true, record: true })
const port = new SerialPortStream({ binding: MockBinding, path: '/dev/ROBOT', baudRate: 14400 })

/* Add some action for incoming data. For example,
** print each incoming line in uppercase */
const parser = new Readline()
port.pipe(parser).on('data', line => {
  console.log(line.toUpperCase())
})

// wait for port to open...
port.on('open', () => {
  // ...then test by simulating incoming data
  port.binding.emitData("Hello, world!\n")
})

/* Expected output:
HELLO, WORLD!
*/