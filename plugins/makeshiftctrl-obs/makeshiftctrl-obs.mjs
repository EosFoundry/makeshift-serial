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
            rpcVersion: 1
        });
    console.log(`Connected to server ${obsWebSocketVersion}`)
} catch (error) {
    console.error('Failed to connect', error.code, error.message);
};





// General

function GetVersion() {
    obs.call('GetVersion')
        .then((data) => {
            console.log(JSON.stringify(data))
        })
}

function GetStats() {
    obs.call('GetStats')
        .then((data) => {
            console.log(JSON.stringify(data))
        })
}

function BroadcastCustomEvent() {
    obs.call('BroadcastCustomEvent', {
        eventData: {
            detail: {
                name: 'New Event'
            }
        }
    })
}

function CallVendorRequest() {
    obs.call('CallVendorRequest')
}

function GetHotkeyList() {
    obs.call('GetHotkeyList')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function TriggerHotkeyByName() {
    obs.call('TriggerHotkeyByName', {
        hotkeyName: 'OBSBasic.Screenshot'
    })
}

function TriggerHotkeyByKeySequence() {
    obs.call('TriggerHotkeyByKeySequence', {
        // ?keyId: '',
        // ?keyModifiers: '',
        // ?keyModifiers.shift: '',
        // ?keyModifiers.control: '',
        // ?keyModifiers.alt: '',
        // ?keyModifiers.command: '',
    })
}

function Sleep() {
    obs.call('Sleep', {
        sleepMillis: '5000'
    })
}


// Config

function GetPersistentData() {
    obs.call('GetPersistentData', {
        realm: 'OBS_WEBSOCKET_DATA_REALM_PROFILE',
        slotName: 'slotName'
    })
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetPersistentData() {
    obs.call('SetPersistentData', {
        realm: 'OBS_WEBSOCKET_DATA_REALM_PROFILE',
        slotName: 'slotName',
        slotValue: slotValue
    })
}

function GetSceneCollectionList() {
    obs.call('GetSceneCollectionList')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetCurrentSceneCollection() {
    obs.call('SetCurrentSceneCollection', {
        sceneCollectionName: 'Scene Collection 1'
    })
}

function CreateSceneCollection() {
    obs.call('CreateSceneCollection', { sceneCollectionName: 'collection0' })
}

function GetProfileList() {
    obs.call('GetProfileList')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetCurrentProfile() {
    obs.call('SetCurrentProfile', {
        profileName: 'profile0'
    })
}

function CreateProfile() {
    obs.call('CreateProfile', {
        profileName: 'profile0'
    });
};

function RemoveProfile() {
    obs.call('RemoveProfile', {
        profileName: 'profile0'
    })
}

function GetProfileParameter() {
    obs.call('GetProfileParameter', {
        parameterCategory: '',
        parameterName: '',
    })
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetProfileParameter() {
    obs.call('SetProfileParameter', {
        parameterCategory: '',
        parameterName: '',
        parameterValue: '',
    })
}

function GetVideoSettings() {
    obs.call('GetVideoSettings')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetVideoSettings() {
    obs.call('SetVideoSettings', {
        // ?fpsNumerator: 0,
        // ?fpsDemoninator: 0,
        // ?baseWidth: 0,
        // ?baseHeight: 0,
        // ?outputWidth: 0,
        // ?outputHeight: 0,
    })
}

function GetStreamServiceSettings() {
    obs.call('GetStreamServiceSettings')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetStreamServiceSettings() {
    obs.call('SetStreamServiceSettings', {
        streamServiceType: '',
        streamServiceSettings: {
            // object
        }
    })
}


// Sources

function GetSourceActive() {
    obs.call('GetSourceActive')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function GetSourceScreenshot() {
    obs.call('GetSourceScreenshot', {
        sourceName: 'New Window',
        imageFormat: 'png'
    })
}

function SaveSourceScreenshot() {
    obs.call('SaveSourceScreenshot', {
        sourceName: 'New Window',
        imageFormat: 'png',
        imageFilePath: 'C:/Users/Michelle/Desktop/screenshot.png'
    });
};


// Scenes

function GetSceneList() {
    obs.call('GetSceneList')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function GetGroupList() {
    obs.call('GetGroupList')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function GetCurrentProgramScene() {
    obs.call('GetCurrentProgramScene')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetCurrentProgramScene() {
    obs.call('SetCurrentProgramScene', {
        sceneName: 'New Scene'
    });
};

function GetCurrentPreviewScene() {
    obs.call('GetCurrentPreviewScene')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetCurrentPreviewScene() {
    obs.call('SetCurrentPreviewScene', { sceneName: 'New Scene' })
}

function CreateScene(delta) {
    obs.call('CreateScene', delta)
};

function RemoveScene(delta) {
    obs.call('RemoveScene', delta)
}

function SetSceneName() {
    obs.call('SetSceneName', {
        sceneName: 'New Scene',
        newSceneName: 'New New Scene'
    })
}

function GetSceneSceneTransitionOverride() {
    obs.call('GetSceneSceneTransitionOverride', { sceneName: 'New Scene' })
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetSceneSceneTransitionOverride() {
    obs.call('SetSceneSceneTransitionOverride', { sceneName: 'New Scene' })
}


// Inputs

function GetInputList() {
    obs.call('GetInputList')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function GetInputKindList() {
    obs.call('GetInputKindList')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function GetSpecialInputs() {
    obs.call('GetSpecialInputs')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function CreateInput0() {
    obs.call('CreateInput', {
        sceneName: 'New Scene',
        inputName: 'Monitor 1',
        inputKind: 'monitor_capture',
    });
};

function CreateInput1() {
    obs.call('CreateInput', {
        sceneName: 'New Scene',
        inputName: 'Spotify Music',
        inputKind: 'wasapi_output_capture',
        inputSettings: {

        }
    });
};

function CreateInput2() {
    obs.call('CreateInput', {
        sceneName: 'New Scene',
        inputName: 'New Window',
        inputKind: 'window_capture',
    });
};

function RemoveInput() {
    obs.call('RemoveInput', {
        inputName: 'Spotify Music'
    })
}

function SetInputName() {
    obs.call('SetInputName', {
        inputName: 'New Window',
        newInputName: 'New New Window',
    })
}

function GetInputDefaultSettings() {
    obs.call('GetInputDefaultSettings', {
        inputKind: 'window_capture'
    })
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function GetInputSettings() {
    obs.call('GetInputSettings', {
        inputName: 'Spotify Music'
    })
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetInputSettings() {
    obs.call('SetInputSettings', {
        inputName: '',
        inputSettings: {

        },
        // ?overlay: boolean
    })
}

function GetInputMute() {
    obs.call('GetInputMute', {
        inputName: 'Spotify Music'
    })
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetInputMute() {
    obs.call('SetInputMute', {
        inputName: 'Spotify Music'
    })
}

function ToggleInputMute() {
    obs.call('ToggleInputMute', {
        inputName: 'Spotify Music',
    });
};

function GetInputVolume() {
    obs.call('GetInputVolume', {
        inputName: 'Spotify Music'
    })
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetInputVolume() {
    obs.call('SetInputVolume', {
        inputName: 'Spotify Music',
        inputVolumeDb: -50
    })
}

function GetInputAudioBalance() {
    obs.call('GetInputAudioBalance', {
        inputName: 'Spotify Music',
    })
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function SetInputAudioBalance() {
    obs.call('SetInputAudioBalance', {
        inputName: 'Spotify Music',
        inputAudioBalance: 0.5
    })
}

function GetInputAudioSyncOffset() {
    obs.call('GetInputAudioSyncOffset', {
        inputName: 'Spotify Music'
    })
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

// function SetInputAudioSyncOffset()

// function GetInputAudioMonitorType()

// function SetInputAudioMonitorType()

// function GetInputAudioTracks()

// function SetInputAudioTracks()

// function GetInputPropertiesListPropertyItems()

// function PressInputPropertiesButton()


// Transitions

function GetTransitionKindList() {
    obs.call('GetTransitionKindList')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function GetSceneTransitionList() {
    obs.call('GetSceneTransitionList')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

function GetCurrentSceneTransition() {
    obs.call('GetCurrentSceneTransition')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}

// function SetCurrentSceneTransition()

// function SetCurrentSceneTransitionDuration()

// function SetCurrentSceneTransitionSettings()

// function GetCurrentSceneTransitionCursor()

// function TriggerStudioModeTransition()


// Filters

// function GetSourceFilterList()

// function GetSourceFilterDefaultSettings()

function CreateSourceFilter() {
    obs.call('CreateSourceFilter', {
        sourceName: 'source1',
        filterName: 'New Gain Filter',
        filterKind: 'gain'
    });
};

// function RemoveSourceFilter()

// function SetSourceFilterName()

// function GetSourceFilter()

// function SetSourceFilterIndex()

// function SetSourceFilterSettings()


// Scene Items

// function GetSceneItemList()

// function GetGroupItemList()

// function GetSceneItemId()

// function CreateSceneItem()

// function RemoveSceneItem()

function DuplicateSceneItem() {
    obs.call('DuplicateSceneItem', {
        sceneName: '',
        sceneItemId: 0,
        // ?destinationSceneName: ''
    })
}


// Outputs

// function GetVirtualCamStatus()


// Stream

function GetStreamStatus() {
    obs.call('GetStreamStatus')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}


// Record

function GetRecordStatus() {
    obs.call('GetRecordStatus')
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}


// Media Inputs

function GetMediaInputStatus() {
    obs.call('GetMediaInputStatus', {
        inputName: ''
    })
        .then((data) => {
            console.log(JSON.stringify(data))
        }).catch((err) => { console.log(err) })
}


// UI

function GetStudioModeEnabled() {
    obs.call('GetStudioModeEnabled')
}




// Custom Functions


function AdjustVolume(delta) {

    obs.call('GetInputVolume', delta.requestField)

        .then((data) => {

            obs.call('SetInputVolume', {
                inputName: data.inputName,
                inputVolumeDb: data.inputVolumeDb + delta.adjFactor
            });

            // db limit -100 to 0
        })
};


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
    // obs,
    // pluginData,

    RunObs,
    // call,

    // AdjustVolume

    // GetVersion,
    // GetStats,
    // BroadcastCustomEvent,
    // CallVendorRequest,
    // GetHotkeyList,
    // TriggerHotkeyByName,
    // TriggerHotkeyByKeySequence,
    // Sleep,

    // GetPersistentData,
    // SetPersistentData,
    // GetSceneCollectionList,
    // SetCurrentSceneCollection,
    // CreateSceneCollection,
    // GetProfileList,
    // SetCurrentProfile,
    // CreateProfile,
    // RemoveProfile,
    // GetProfileParameter,
    // SetProfileParameter,
    // GetVideoSettings,
    // SetVideoSettings,
    // GetStreamServiceSettings,
    // SetStreamServiceSettings,

    // GetSourceActive,
    // GetSourceScreenshot,
    // SaveSourceScreenshot,

    // GetSceneList,
    // GetGroupList,
    // GetCurrentProgramScene,
    // SetCurrentProgramScene,
    // GetCurrentPreviewScene,
    // SetCurrentPreviewScene,
    // CreateScene,
    // RemoveScene,
    // SetSceneName,
    // GetSceneSceneTransitionOverride,
    // SetSceneSceneTransitionOverride,

    // GetInputList,
    // GetInputKindList,
    // GetSpecialInputs,
    // CreateInput0,
    // CreateInput1,
    // CreateInput2,
    // RemoveInput,
    // SetInputName,
    // GetInputDefaultSettings,
    // GetInputSettings,
    // SetInputSettings,
    // GetInputMute,
    // SetInputMute,
    // ToggleInputMute,
    // GetInputVolume,
    // SetInputVolume,
    // GetInputAudioBalance,
    // SetInputAudioBalance,
    // GetInputAudioSyncOffset,
    // SetInputAudioSyncOffset,
    // GetInputAudioMonitorType,
    // SetInputAudioMonitorType,
    // GetInputAudioTracks,
    // SetInputAudioTracks,
    // GetInputPropertiesListPropertyItems,
    // PressInputPropertiesButton,

    // GetTransitionKindList,
    // GetSceneTransitionList,
    // GetCurrentSceneTransition,
    // SetCurrentSceneTransition,
    // SetCurrentSceneTransitionDuration,
    // SetCurrentSceneTransitionSettings,
    // GetCurrentSceneTransitionCursor,
    // TriggerStudioModeTransition,

    // GetSourceFilterList,
    // GetSourceFilterDefaultSettings,
    // CreateSourceFilter,
    // RemoveSourceFilter,
    // SetSourceFilterName,
    // GetSourceFilter,
    // SetSourceFilterIndex,
    // SetSourceFilterSettings,

    // GetSceneItemList,
    // GetGroupItemList,
    // GetSceneItemId,
    // CreateSceneItem,
    // RemoveSceneItem,
    // DuplicateSceneItem,
    // GetSceneItemTransform,
    // SetSceneItemTransform,
    // GetSceneItemEnabled,
    // SetSceneItemEnabled,
    // GetSceneItemLocked,
    // SetSceneItemLocked,
    // GetSceneItemIndex,
    // SetSceneItemIndex,
    // GetSceneItemBlendMode,
    // SetSceneItemBlendMode,

    // GetVirtualCamStatus,
    // ToggleVirtualCam,
    // StartVirtualCam,
    // StopVirtualCam,
    // GetReplayBufferStatus,
    // ToggleReplayBuffer,
    // StartReplayBuffer,
    // StopReplayBuffer,
    // SaveReplayBuffer,
    // GetLastReplayBufferReplay,

    // GetStreamStatus,
    // ToggleStream,
    // StartStream,
    // StopStream,
    // SendStreamCaption,

    // GetRecordStatus,
    // ToggleRecord,
    // StartRecord,
    // StopRecord,
    // ToggleRecordPause,
    // PauseRecord,
    // ResumeRecord,

    // GetMediaInputStatus,
    // SetMediaInputCursor,
    // OffsetMediaInputCursor,
    // TriggerMediaInputAction,

    // GetStudioModeEnabled,
    // SetStudioModeEnabled,
    // OpenInputPropertiesDialog,
    // OpenInputFiltersDialog,
    // OpenInputInteractDialog,
}
