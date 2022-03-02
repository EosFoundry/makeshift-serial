import OBSWebSocket from 'obs-websocket-js';

// const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();
let connectionObj;
async function init() {
    try {
        connectionObj = await obs.connect(
            'ws://192.168.1.121:4455',
            '7H2OADyfME4J2ypX',
            {
                rpcVersion: 1
            }
        )
        console.log('toast');
        console.log(JSON.stringify(connectionObj));
    } catch (e) {
        console.log(`erreur ${JSON.stringify(e)}`);
    }
}

obs.on('Hello', () => {
    console.log('got hello.');
})

obs.on('Identified', () => {
    console.log('got identified.');
})

obs.on('ConnectionOpened', () => {
    console.log(`Success! We're connected & authenticated.`);
})

obs.on('ConnectionClosed', () => {
    console.log('connection closed.');
})

obs.on('error', err => {
    console.error('socket error:', err);
});

init();

setTimeout(() => { console.log('done.') }, 4000);

    // obs.on('ConnectionOpened', () => {
    //     console.log(`Success! We're connected & authenticated.`);
    //     })