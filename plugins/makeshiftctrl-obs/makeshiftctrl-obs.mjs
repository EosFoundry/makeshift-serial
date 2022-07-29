import ObsWebSocket from 'obs-websocket-js';

const obs = new ObsWebSocket();

const pluginData = {
    name: 'makeshiftctrl-obs',
    data: 'OBSWebSocket'
}

obs.on('Hello', () => {
    console.log('Got hello.')
})

obs.on('Identified', () => {
    console.log('Identified.')
})

obs.on('ConnectionOpened', () => {
    console.log(`Connecting...`);
});

obs.on('ConnectionClosed', () => {
    console.log('Closing...')
})

obs.on('error', err => {
    console.error('Socket error:', err);
});



// TODO: CALIBER you will need to add your websocket address and password here
function Connect() {
    try {
        const {
            obsWebSocketVersion,
        } = await obs.connect(
            'ws://192.168.2.101:4455',
            'Cz9oWxO5t05jiXlI',
            {
                rpcVersion: 1
            });
        console.log(`Connected to server ${obsWebSocketVersion}`)
    } catch (error) {
        console.error('Failed to connect', error.code, error.message);
    };

}


function RunObs(functionName, requestField) {
    obs.call(functionName, requestField)
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => {
            console.log(`RunObs Error:${err}`)
        })
}





// "Reactions"

obs.on('InputCreated', event => {
    console.log(`New input: ${event.inputName}`);
});

obs.on('SceneCreated', event => {
    console.log(`New scene available: ${event.sceneName}`);
});

obs.on('CurrentProgramSceneChanged', event => {
    console.log(`Current scene changed to: ${event.sceneName}`);
});

obs.on('SceneRemoved', event => {
    console.log(`Removed scene: ${event.sceneName}`);
});



export {
    Connect,
    RunObs,
}
