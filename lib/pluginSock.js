var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import path from 'path';
import { sendMessage } from './messages';
import { Msg, strfy } from './utils';
var msg;
var plugin;
var manifest;
var config;
// const pluginData = {
//     dummyData: 'some string',
//     mutable: [
//         'dummyData',
//     ],
// }
process.on('message', function (m) {
    switch (m.label) {
        case 'init': //loads the manifest data
            config = m.data;
            init().then(function () {
                process.send({
                    label: 'status',
                    data: 'ready'
                });
            })["catch"](function (e) { return sendMessage(process, 'error', e); });
            break;
        case 'run':
            var func_1 = m.data;
            msg("Recieved 'run' message with function data: ".concat(func_1));
            if (manifest.functionsAvailable.includes(func_1.name)) {
                runAsAsync(func_1)
                    .then(function (returnValue) {
                    return sendMessage(process, 'function-return', {
                        name: func_1.name,
                        ret: returnValue
                    });
                })["catch"](function (e) { return sendMessage(process, 'error', e); });
            }
            else {
                var emessage = "Could not find function with name: ".concat(func_1.name, " in plugin");
                msg(emessage);
                sendMessage(process, 'error', emessage);
            }
            break;
    }
});
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var plugPath, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    msg = Msg("PluginSock for ".concat(config.name));
                    msg('initializing pluginSock with config:');
                    console.dir(config);
                    manifest = config.manifest;
                    delete config.manifest;
                    plugPath = path.join('', config.root, manifest.entry);
                    msg('Dynamically importing plugin from path: ' + plugPath);
                    return [4 /*yield*/, import('./' + plugPath)];
                case 1:
                    plugin = _a.sent();
                    msg('Import complete');
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    msg(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function sendError(e) {
    process.send({
        label: 'error',
        data: e
    });
}
function sendFunctionReturn(r) {
    process.send({
        label: 'function-return',
        data: {
            functionName: r.name,
            returnValue: r.ret
        }
    });
}
function runAsAsync(func) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            msg("got function object: ".concat(strfy(func)));
            try {
                if (func.args.length > 0) {
                    plugin[func.name].apply(plugin, func.args);
                }
                else {
                    plugin[func.name]();
                }
            }
            catch (e) {
                msg("Error while running function \"".concat(func.name, "\" - ").concat(strfy(e)));
                sendMessage(process, 'error', e);
            }
            return [2 /*return*/];
        });
    });
}
