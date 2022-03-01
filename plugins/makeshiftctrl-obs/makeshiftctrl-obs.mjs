import ObsWebSocket from 'obs-websocket-js';

// const OBSWebSocket = require('obs-websocket-js');
const obs = new ObsWebSocket();

    obs.connect({
            address: 'localhost:4455',
            password: 'coffin%20nails'
    })
    .then(() => {
        obs.on('ConnectionOpened', () => {
        console.log(`Success! We're connected & authenticated.`);
        })
    })
    .catch(err => {
        console.log('erreur');
    });

    obs.on('error', err => {
        console.error('socket error:', err);
    });

    // obs.on('ConnectionOpened', () => {
    //     console.log(`Success! We're connected & authenticated.`);
    //     })