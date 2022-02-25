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
        pluginList.forEach((pluginName) => {
            plugins[pluginName] = {};

            console.log('reading manifest from - ' +  pluginName);

            readFile(
                path.join(__plugin_dir, pluginName, 'manifest.json' ), 
                { encoding: 'UTF8' }
            )
            .then((data) => {
                let manifest = JSON.parse(data);
                plugins[pluginName].manifest = manifest;
                console.log(manifest);
            })
        });
}

async function readFile () {
    // read stuff
    // check errors

    promise = new Promise ()
    
    if (good) { promise.resolve({data})}
    else { promise.reject({error})}

    returns promise;
}

loadPlugins().then(() => {
    console.log('done!')
    // let plug = fork('./pluginVM');

    // plug.send({
    //     name: 'dummyPlugin',
    //     root: './plugins/dummyPlugin',
    //     manifest: 
    //     command: 'init'
    // });

});


export {
    loadPlugins,
}