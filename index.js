const { fork } = require('child_process');
const lsReturnData = fork(__dirname + '/childProcess.js');

lsReturnData.on('message', (m) => {
    console.log('got message');
    console.log(m);
})

setTimeout(() => { console.log('process ended'), 5000})
