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
            let data = m.data;
            config = data;
            manifest = config.manifest;
            delete config.manifest;
            msg = Msg(`Plugin=${data.name}`)
            msg('initializing')
            msg(data.root);
            msg(config);
            init(config.root, config.name).then(() => {
                process.send({
                    label: 'status',
                    data: 'ready',
                })
            }).catch((e) => sendError(e))
            break;

        case 'run':
            let func = m.data;
            if (manifest.functionsAvailable.includes(func.name)) {
                msg(`Running function: ${func.name}`);
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


async function init(rootDir, name) {
    try {
        let manifestPath = path.join(rootDir, 'manifest.json');
        msg('manifestPath: ', manifestPath);
        msg(manifest);
        msg('config.root : ' + config.root);
        msg('manifest.entry : ' + manifest.entry);

        let plugPath = path.join('', config.root, manifest.entry);
        msg('plugin path: ' + plugPath);

        // Using relative path here
        plugin = await import('./' + plugPath);
        msg('Imprt complete');
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
