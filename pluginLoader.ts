import { ChildProcess, fork } from 'child_process'
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path'
import { Msg, strfy } from './utils.js'
import { readFileSync } from 'fs';
import EventEmitter from 'events';
const msg = Msg('pluginLoader');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __plugin_dir = path.join(__dirname, 'plugins');

let pluginList = [
    "dummyPlugin",
    // "makeshiftctrl-obs",
];

let plugins = {};

class Plugin extends EventEmitter {
    manifest: any;
    id: string;
    functionsAvailable: string[];
    sock: ChildProcess;
    msg: Msg;

    handleMessage(m: Message): void {
        msg(`message received from: ${this.id} | Label: ${m.label} | Data: ${strfy(m.data)}`);
        switch (m.label) {
            case 'status':
                if (m.data === 'ready') {
                    this.emit('ready');
                } else if (m.data === 'error loading') {
                    msg(m.data)
                }
                break;
            case 'data':
                break;
        }
    }

    runFunction(name: string, args?:string[]): void {
        this.sock.send({
            label: 'run',
            data: {
                name: name,
                args: args ? args : []
            }
        })
    }

    constructor(manifest: any) {
        super();
        this.id = manifest.id;
        this.manifest = manifest;
        this.functionsAvailable = manifest.functionsAvailable;
        this.msg = Msg(this.id);

        this.msg('Creating new event emittor');

        this.msg('Forking new pluginSock');
        this.sock = fork('./pluginSock');
        this.sock.on('message', this.handleMessage.bind(this))

        this.msg('Initializing pluginSock');
        this.sock.send({
            label: 'init',
            data: {
                name: this.manifest.name,
                root: './plugins/' + this.manifest.name,
                manifest: this.manifest,
            }
        });
    }
}

function loadPlugins() {
    for (let id of pluginList) {
        msg('reading manifest from - ' + id);
        let data = readFileSync(
            path.join(__plugin_dir, id, 'manifest.json'),
            { encoding: 'UTF8' as BufferEncoding }
        )
        let manifest = JSON.parse(data);
        msg('Manifest loaded.')
        msg(manifest);
        msg('Forking plugin sock...');
        plugins[id] = new Plugin(manifest);
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
