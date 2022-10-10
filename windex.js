import { BUTTON_EV, DIAL_EV, MakeShiftPort, MKSHFT_EV } from './lib/makeShiftPort.js';
import { loadPlugins } from "./lib/pluginLoader.js";
import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import { Msg } from './lib/utils.js';
const msg = Msg("MakeShiftSerial");
const rl = readline.createInterface({ input: stdin, tabSize: 4, output: stdout });
rl.setPrompt("SEND => ");
let pluginList = [
// "dummyPlugin",
// "makeshiftctrl-obs",
];
loadPlugins(pluginList);
// plugins['makeshiftctrl-obs'].on('ready', () => {
// })
stdout.on('end', () => rl.prompt);
const makeShift = new MakeShiftPort();
// Initialize readline
// Initialize connection looper
makeShift.on(MKSHFT_EV.CONNECTED, () => {
    rl.on('line', (line) => {
        makeShift.write(line);
    });
});
makeShift.on(MKSHFT_EV.DISCONNECTED, () => {
    rl.removeAllListeners();
});
DIAL_EV.forEach((ev) => {
    makeShift.on(ev, (state) => {
        msg(`${ev} - ${state}`);
    });
});
BUTTON_EV.PRESSED.forEach((ev) => {
    makeShift.on(ev, () => {
        // do stuff you want
        // do this, then that, etc. et cetera ad nauseum
        msg(ev);
    });
});
BUTTON_EV.RELEASED.forEach((ev) => {
    makeShift.on(ev, () => {
        msg(ev);
    });
});
