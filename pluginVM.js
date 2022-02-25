import fs from 'fs/promises';
import path from 'path';

let plugin;
let manifest;
let config;


process.on('message', (m) => {
    if (m.command === 'init') {
        config = m;
        console.log('initializing')
        console.log(m.root);
        console.log(config);
        init(config.root, config.name);
    }
})

const pluginData = {
    dummyData: 'some string',
    mutable: [
        'dummyData',
    ],
}

async function init ( rootDir , name) {
    try {
        let manifestPath = path.join (rootDir, 'manifest.json');
        console.log('manifestPath: ', manifestPath);
        let json = await import (manifestPath);
        manifest = json.default;

        console.log(manifest);
        console.log('config.root : ' + config.root);
        console.log('manifest.entry : ' + manifest.entry);
        let plugPath = path.join(config.root, manifest.entry);
        console.log('plugin path:' + plugPath);

        plugin = await import(plugPath);
        console.log(plugin);

    } catch (e) {
        console.log(e);
    }
}