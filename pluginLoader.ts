import { fork } from 'child_process'
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __plugin_dir = path.join(__dirname, 'plugins');

let pluginList = [
    "dummyPlugin",
];

let plugins = {};

async function loadPlugins() {
    for ( let pluginName of pluginList) {
        plugins[pluginName] = {};

        console.log('reading manifest from - ' +  pluginName);

        let data = await readFile(
            path.join(__plugin_dir, pluginName, 'manifest.json' ), 
            { encoding: 'UTF8' as BufferEncoding }
        )

        let manifest = JSON.parse(data);
        plugins[pluginName].manifest = manifest;
        console.log(manifest);
    }
    for (let id of pluginList) {
        let vm = fork('./pluginVM');
        vm.on('message', (m:Message) => {
            console.log('recieved message from plugin: ' + id);
            console.log(m.data);
            if (m.data === 'ready') {
                vm.send({
                    command: plugins[id].manifest.functionsAvailable[0]
                })
            }
        })
        vm.send({
            name: plugins[id].manifest.name,
            root: './plugins/' + plugins[id].manifest.name,
            manifest: plugins[id].manifest,
            command: 'init'
        });
    }
}

type Message = {
    data: any;
}

export {
    loadPlugins,
}
