import { fork } from 'child_process'
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path'
import { Msg, strfy } from './utils.js'

const msg = Msg('pluginLoader');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __plugin_dir = path.join(__dirname, 'plugins');

let pluginList = [
    // "dummyPlugin",
    "makeshiftctrl-obs",
];

let plugins = {};

async function loadPlugins() {
    for (let id of pluginList) {
        plugins[id] = {};

        console.log('reading manifest from - ' + id);

        let data = await readFile(
            path.join(__plugin_dir, id, 'manifest.json'),
            { encoding: 'UTF8' as BufferEncoding }
        )

        let manifest = JSON.parse(data);
        plugins[id].manifest = manifest;
        plugins[id].id = manifest.name;
        plugins[id].functionsAvailable = manifest.functionsAvailable;
        console.log(manifest);
    };

    console.log('done!');

    for (let id of pluginList) {
        plugins[id].sock = fork('./pluginSock');

        plugins[id].sock.on('message', handleMessage.bind(plugins[id]))

        plugins[id].sock.send({
            name: plugins[id].manifest.name,
            root: './plugins/' + plugins[id].manifest.name,
            manifest: plugins[id].manifest,
            command: 'init',
        });
    }
}

function handleMessage(m: Message) {
    msg(`message received from: ${this.id}`);
    msg(`Label: ${m.label}`);

    switch (m.label) {
        case 'status':
            if (m.data === 'load successful') {
                console.log('sending command to VM')
                this.sock.send({
                    command: 'run',
                    functionName: this.manifest.functionsAvailable[1]
                })
            } else if (m.data === 'error loading') {
                console.log(m.data)
            }
            break;
        case 'data':
            break;
    }

}

type Message = {
    label: string,
    data: any,
}

export {
    loadPlugins,
    plugins
}
