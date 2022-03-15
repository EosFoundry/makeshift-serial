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


    try {
        const {
        obsWebSocketVersion,
        } = await obs.connect(
            'ws://192.168.2.101:4455', 
            'Cz9oWxO5t05jiXlI', 
            {
                rpcVersion:1
            });
        console.log(`Connected to server ${obsWebSocketVersion}`)
    } catch (error) {
        console.error('Failed to connect', error.code, error.message);
    };



function CreateProfile() {
    obs.call('CreateProfile', {profileName: 'Streaming'});
};

function CreateSceneCollection() {
    obs.call('CreateSceneCollection', {sceneCollectionName: 'Testing'})
}

function CreateScene() {
    obs.call('CreateScene', {sceneName: 'New Scene'});
};

function SetCurrentProgramScene() {
    obs.call('SetCurrentProgramScene', {sceneName: 'New Scene'});
};

function CaptureWindow() {
    obs.call('CreateInput', {
        sceneName: 'New Scene',
        inputName: 'New Window',
        inputKind: 'window_capture',
    });
};

function CaptureMonitor() {
    obs.call('CreateInput', {
        sceneName: 'New Scene',
        inputName: 'Monitor 1',
        inputKind: 'monitor_capture',
    });
};

function CaptureAudioOutput() {
    obs.call('CreateInput', {
        sceneName: 'New Scene',
        inputName: 'Spotify Music',
        inputKind: 'wasapi_output_capture',
        inputSettings: {

        }
    });
};

function AddFilterGain() {
    obs.call('CreateSourceFilter', {
        sourceName: 'Spotify Music',
        filterName: 'New Gain Filter',
        filterKind: 'gain'
    });
};

function ToggleMute() {
    obs.call('ToggleInputMute', {
        inputName: 'Spotify Music',
    });
};

function AdjustVolume(delta) {

    obs.call('GetInputVolume', {inputName: 'Spotify Music'})
    
    .then((data) => {

        obs.call('SetInputVolume', {
            inputName: 'Spotify Music',
            inputVolumeDb: data.inputVolumeDb + delta
        });

        // db limit -100 to 0
    })
};

function Screenshot() {
    obs.call('SaveSourceScreenshot', {
        sourceName: 'New Window',
        imageFormat: 'png',
        imageFilePath: 'C:/Users/Michelle/Desktop/screenshot.png'
    });
};



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
    obs,
    pluginData,
    CreateProfile,
    CreateSceneCollection,
    CreateScene,
    SetCurrentProgramScene,
    CaptureWindow,
    CaptureMonitor,
    CaptureAudioOutput,
    ToggleMute,
    AdjustVolume,
    Screenshot,
}

setTimeout(() => {

obs.call('GetVersion')

    .then((data) => {
        console.log(JSON.stringify(data))
    }).catch ((err) => {
        console.log(err)
    })
    
obs.call('GetInputKindList')

    .then((data) => {
        console.log(JSON.stringify(data))
    }).catch ((err) => {
        console.log(err)
    });;

//     obs.call('GetInputSettings', {inputName: 'Spotify Music'})

//     .then((data) => {
//         console.log('input settings: ' + JSON.stringify(data))
//     }).catch ((err) => {
//         console.log(err)
//     })

//     obs.call('GetInputVolume', {inputName: 'Spotify Music'})

//     .then((data) => {
//         console.log('input settings: ' + JSON.stringify(data))
//     }).catch ((err) => {
//         console.log(err)
//     })

//     obs.call('GetSourceFilter', {
//         sourceName: 'New Window',
//         filterName: 'Scroll',
//     })

//     .then((data) => {
//         console.log('filter list: ' + JSON.stringify(data))
//     }).catch ((err) => {
//         console.log(err)
//     })

}, 1000)