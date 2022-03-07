import ObsWebSocket from 'obs-websocket-js';

const obs = new ObsWebSocket();


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
  }

obs.call('CreateScene', {sceneName: 'new scene'})
    .then(() => {
        console.log(`New scene available`);
    })
    .catch (err => {
        console.log(err);
});

setTimeout(() => {
    obs.call('SetCurrentProgramScene', {sceneName: 'visual studio code'});
    setTimeout(() => {obs.call('SetCurrentProgramScene', {sceneName: 'raccoon'});
    }, 3000);
}, 5000);

setTimeout (() => {
    obs.call('RemoveScene', {sceneName: 'new scene'});
}, 10000);


obs.on('CurrentProgramSceneChanged', event => {
    console.log(`Current scene changed to: ${event.sceneName}`);
});

obs.on('SceneRemoved', event => {
    console.log(`Removed scene: ${event.sceneName}`);
});
