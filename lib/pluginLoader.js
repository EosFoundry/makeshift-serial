var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { fork } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import EventEmitter from 'events';
import path from 'path';
import { Msg, strfy } from './utils';
var msg = Msg('PluginLoader');
import { sendMessage } from './messages';
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var __plugin_dir = path.join(__dirname, 'plugins');
var pluginList = [
    // "dummyPlugin",
    "makeshiftctrl-obs",
];
var plugins = {};
var Plugin = /** @class */ (function (_super) {
    __extends(Plugin, _super);
    function Plugin(manifest) {
        var _this = _super.call(this) || this;
        _this.id = manifest.name;
        _this.manifest = manifest;
        _this.functionsAvailable = manifest.functionsAvailable;
        _this.msg = Msg("Plugin object for ".concat(_this.id));
        _this.msg('Creating new event emitter');
        _this.msg('Sporking new pluginSock');
        _this.sock = fork('./pluginSock');
        _this.sock.on('message', _this.handleMessage.bind(_this));
        _this.msg('Initializing pluginSock');
        sendMessage(_this.sock, 'init');
        _this.sock.send({
            label: 'init',
            data: {
                name: _this.manifest.name,
                root: './plugins/' + _this.manifest.name,
                manifest: _this.manifest
            }
        });
        return _this;
    }
    Plugin.prototype.handleMessage = function (m) {
        this.msg("Message received from sock --> Label: ".concat(m.label, " | Data: ").concat(strfy(m.data)));
        switch (m.label) {
            case 'status':
                if (m.data === 'ready') {
                    _super.prototype.emit.call(this, 'ready');
                }
                else if (m.data === 'error loading') {
                    this.msg(m.data);
                }
                break;
            case 'data':
                break;
        }
    };
    ;
    Plugin.prototype.runFunction = function (name, args) {
        this.sock.send({
            label: 'run',
            data: {
                name: name,
                args: args ? args : []
            }
        });
    };
    return Plugin;
}(EventEmitter));
function loadPlugins() {
    for (var _i = 0, pluginList_1 = pluginList; _i < pluginList_1.length; _i++) {
        var id = pluginList_1[_i];
        msg('reading manifest from - ' + id);
        var data = readFileSync(path.join(__plugin_dir, id, 'manifest.json'), { encoding: 'UTF8' });
        var manifest = JSON.parse(data);
        msg('Manifest loaded.');
        msg(manifest);
        msg('Forking plugin sock...');
        plugins[id] = new Plugin(manifest);
    }
}
export { loadPlugins, plugins };
