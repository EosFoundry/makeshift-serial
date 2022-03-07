import ObsWebSocket from 'obs-websocket-js';

const obs = new ObsWebSocket();

const pluginData = {
    name: 'makeshiftctrl-obs',
    data: 'OBSWebSocket'
}

  
    obs.on('Hello', () => {
        console.log('got hello.')
    })

    obs.on('Identified', () => {
        console.log('identified.')
    })

    obs.on('ConnectionOpened', () => {
        console.log(`Connecting...`);
    });

    obs.on('ConnectionClosed', () => {
        console.log('Closing...')
    })

    obs.on('error', err => {
        console.error('socket error:', err);
    });

    try {
        const {
        obsWebSocketVersion,
        } = await obs.connect('ws://192.168.2.101:4455', 'coffin%20nails', {rpcVersion:1});
        console.log(`Connected to server ${obsWebSocketVersion}`)
    } catch (error) {
        console.error('Failed to connect', error.code, error.message);
    };

function CreateScene() {
    obs.call('CreateScene', {sceneName: 'New Scene'})
        .then(() => {
            console.log(`New scene available`);
        })
        .catch (err => {
            console.log(err);
    });
}

function SetCurrentProgramScene() {
    obs.call('SetCurrentProgramScene', {sceneName: 'visual studio code'});

    obs.on('CurrentProgramSceneChanged', event => {
        console.log(`Current scene changed to: ${event.sceneName}`);
    });
};


export {
    obs,
    pluginData,
    CreateScene,
    SetCurrentProgramScene,
}




// obs.on('SceneRemoved', event => {
//     console.log(`Removed scene: ${event.sceneName}`);
// });
