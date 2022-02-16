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
    baudRate: 9600
})


port.write('main screen turn on', function (err) {
    if (err) {
        return console.log('Error on write: ', err.message)
    }
    console.log('message written')
})


port.on('error', function (err) {
    console.log('Error: ', err.message)
})


// upon receiving start transmission ('START' from arduino), do SOMETHING, wait for all data to be
// received, THEN log data

// 

// variable scope: var, x is defined outside of function

var a = []

port.on('data', function (data) {
    a.push(...data)
    //console.log(JSON.stringify(a, '', 2))
    
    b = a.slice(-3)

    if (b.toString() == '69,78,68') {
        a.join('')
        console.log(String.fromCharCode(...a))
        a = []
    }
})

//CLEAR a/BUFFER***
//if statement not detecting END

setInterval(() => {
    port.write('Hi Mom!')
},
    5000
)