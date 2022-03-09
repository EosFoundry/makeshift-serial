import path from 'path';
import { Msg, strfy } from './utils.js'
let msg;
let plugin;
let manifest;
let config;

// const pluginData = {
//     dummyData: 'some string',
//     mutable: [
//         'dummyData',
//     ],
// }

process.on('message', (m) => {
    switch (m.label) {
        case 'init': //loads the manifest data
            config = m.data;
            init(config).then(() => {
                process.send({
                    label: 'status',
                    data: 'ready',
                })
            }).catch((e) => sendError(e))
            break;

        case 'run':
            let func = m.data;
            msg(`Recieved 'run' message with function data: ${func}`);
            if (manifest.functionsAvailable.includes(func.name)) {
                runFunc(func).then((returnValue) => sendFunctionReturn({
                    name: func.name,
                    ret: returnValue,
                })).catch((e) => sendError(e));
            } else {
                let emessage = `Could not find function with name: ${func.name} in plugin`;
                msg(emessage);
                sendError(emessage);
            }
            break;
    }
});


async function init() {
    try {
        msg = Msg(`PluginSock for ${config.name}`)
        msg('initializing pluginSock with config:')
        console.dir(config);

        manifest = config.manifest;
        delete config.manifest;

        let plugPath = path.join('', config.root, manifest.entry);
        msg('Dynamically importing plugin from path: ' + plugPath);
        plugin = await import('./' + plugPath);
        msg('Import complete');
    } catch (e) {
        msg(e);
    }
}

function sendError(e) {
    process.send({
        label: 'error',
        data: e,
    })
}

function sendFunctionReturn(r) {
    process.send({
        label: 'function-return',
        data: {
            functionName: r.name,
            returnValue: r.ret,
        },
    })
}

async function runFunc(func) {
    msg(`got function object: ${strfy(func)}`)
    try {
        if (func.args.length > 0) {
            plugin[func.name](...func.args);
        } else {
            plugin[func.name]();
        }
    } catch (e) {
        msg(`Error while running function "${func.name}" - ${strfy(e)}`)
        sendError(e); }
}
