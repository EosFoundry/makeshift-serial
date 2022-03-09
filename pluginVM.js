import fs from 'fs/promises';
import path from 'path';

let plugin;
let manifest;
let config;


process.on('message', (m) => {
    let data = m;
    if (data.command === 'init') {
        config = m;
        manifest = config.manifest;
        delete config.manifest;
        
        console.log('initializing')
        console.log(data.root);
        console.log(config);
        init(config.root, config.name).then(() => {
            process.send({
                data: 'ready'
            })
        }).catch((e) => {
            process.send({
                data:'error',
                error: e
            })
        })
    } else if (manifest.functionsAvailable.includes(data.command)) {
        console.log('running command')
        plugin[data.command]();
    }
})

async function init (rootDir , name) {
    try {
        let manifestPath = path.join(rootDir, 'manifest.json');
        console.log('manifestPath: ', manifestPath);
        console.log(manifest);
        console.log('config.root : ' + config.root);
        console.log('manifest.entry : ' + manifest.entry);
        
        let plugPath = path.join('', config.root, manifest.entry);
        console.log('plugin path: ' + plugPath);

        // Using relative path here
        plugin = await import('./' + plugPath);
        console.log(plugin);
    } catch (e) {
        console.log(e);
    }
}
