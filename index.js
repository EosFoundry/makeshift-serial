// const { fork } = require('child_process');
// const lsReturnData = fork(__dirname + '/childProcess.js');

// lsReturnData.on('message', (m) => {
//     console.log('message received');
//     console.log(m);
// })

// setTimeout(() => { console.log('child ended'), 4999})


const { SerialPort } = require('serialport')

const port = new SerialPort({
    path: 'COM3',
    baudRate: 9600,
})

// Open errors will be emitted as an error event
port.on('error', function (err) {
    console.log('Error: ', err.message)
})


// Switches the port into "flowing mode"
port.on('data', function (data) {
    console.log(data.toString())
})

port.write('main screen turn on', function (err) {
    if (err) {
        return console.log('Error on write: ', err.message)
    }
    console.log('message written')
})


setInterval( () => {
        port.write('Hi Mom!')
    },
    1000
)