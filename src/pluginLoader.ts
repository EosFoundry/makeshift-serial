import { ChildProcess, fork } from 'node:child_process'
import { join } from 'pathe'
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { EventEmitter } from 'node:events';

import { filterName, LogLevel, Msg, Msger, MsgLvFunctorMap, strfy } from '@eos-makeshift/msg'
const msgen = new Msg({ host: 'PluginLoader' });
const log = msgen.getLevelLoggers()
const msg = log.info

import { Message, sendMessage } from './messages.js'



export class Plugin extends EventEmitter implements Msger {
    private _id: string
    get id(): string { return this._id }

    private _name: string
    get name(): string { return this._name }

    private _manifest: any
    get manifest() { return this._manifest }
    private _functions: string[]
    get functions() { return this._functions }

    private sock: ChildProcess

    // logging setup
    private _logLevel: LogLevel
    public get logLevel(): LogLevel { return this._logLevel }
    public set logLevel(l: LogLevel) {
        this._logLevel = l
        this._msgenerator.logLevel = l
    }
    private _msgenerator: Msg
    private log: MsgLvFunctorMap

    handleMessage(this: Plugin, m: Message): void {
        this.log.info(`Message received from sock --> Label: ${m.label} | Data: ${strfy(m.data)}`);
        switch (m.label) {
            case 'status':
                if (m.data === 'ready') {
                    super.emit('ready');
                } else if (m.data === 'error loading') {
                    this.log.info(m.data)
                }
                break;
            case 'data':
                break;
        }

    };

    // TODO: get call working

    callFunction(name: string, message?: any): void {
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

    constructor(path: string, manifest: any) {
        super();
        this._id = manifest.name;
        this._name = filterName(this._id)
        this._manifest = manifest;
        this._functions = manifest.functions;
        this._msgenerator = new Msg({
            host: this.name,
            logLevel: 'none',
        })
        this.log = this._msgenerator.getLevelLoggers()
        this.log.info('Creating new event emitter');

        this.log.info('Sporking new pluginSock');
        this.sock = fork('./lib/pluginSock.js');
        this.sock.on('message', this.handleMessage.bind(this))

        this.log.info('Initializing pluginSock');
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

// function loadPlugins(pluginList: Array<string>) {
//     for (let id of pluginList) {
//         msg('reading manifest from - ' + id);
//         let data = readFileSync(
//             join(pluginDir, id, 'manifest.json'),
//             { encoding: 'UTF8' as BufferEncoding }
//         )
//         let manifest = JSON.parse(data);
//         msg('Manifest loaded.')
//         msg(manifest);
//         msg('Forking plugin sock...');
//         plugins[id] = new Plugin(manifest);
//     }
// }


