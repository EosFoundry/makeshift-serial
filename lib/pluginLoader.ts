import { ChildProcess, fork } from 'child_process'
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import * as path from 'path'

import { Msg, strfy } from './utils.js'
const msg = Msg('PluginLoader');

import { Message, sendMessage } from './messages.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __plugin_dir = path.join(__dirname, '../plugins');

// TODO: CALIBER add your plugin to this list

let plugins = {};

class Plugin extends EventEmitter {
    manifest: any;
    id: string;
    functionsAvailable: string[];
    sock: ChildProcess;
    msg: Function;

    handleMessage (this:Plugin, m: Message) : void {
        this.msg(`Message received from sock --> Label: ${m.label} | Data: ${strfy(m.data)}`);
        switch (m.label) {
            case 'status':
                if (m.data === 'ready') {
                    super.emit('ready');
                } else if (m.data === 'error loading') {
                    this.msg(m.data)
                }
                break;
            case 'data':
                break;
        }

    };

    // TODO: get call working

    callFunction (name: string, message?:any): void {
        this.send('call', {
            name: name,
            args: message ? message : {}
        })
    }

    send(label: string, data: any): void {
        this.sock.send({
            label: label,
            data: data
        })
    }

    runFunction(name: string, args?: any[]): void {
        this.send('run', {
            name: name,
            args: args ? args : []
        })
    }

    constructor(manifest: any) {
        super();
        this.id = manifest.name;
        this.manifest = manifest;
        this.functionsAvailable = manifest.functionsAvailable;
        this.msg = Msg(`Plugin object for ${this.id}`);

        this.msg('Creating new event emitter');

        this.msg('Sporking new pluginSock');
        this.sock = fork('./lib/pluginSock.js');
        this.sock.on('message', this.handleMessage.bind(this))

        this.msg('Initializing pluginSock');
        sendMessage(this.sock, 'init')
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

function loadPlugins(pluginList : Array<string>) {
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


export {
    loadPlugins,
    plugins
}
