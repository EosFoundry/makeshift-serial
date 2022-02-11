const { fork } = require('child_process');
const lsReturnData = fork(__dirname + '/childProcess.js');

lsReturnData.on('message', (m) => {
    console.log('message received');
    console.log(m);
})

setTimeout(() => { console.log('child ended'), 5000})
