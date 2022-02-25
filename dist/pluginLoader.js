import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var pluginList = {};
var plug = fork('./pluginVM');
// class PluginMessage {
//     name?: string;
//     command: string;
// }
plug.send({
    name: 'dummyPlugin',
    root: path.join(__dirname, 'plugins/dummyPlugin'),
    command: 'init'
});
