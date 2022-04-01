import { loadPlugins, plugins } from "./pluginLoader.js";
import { Msg, strfy } from './utils.js'

const msg = Msg('hello');

loadPlugins()
plugins['makeshiftctrl-obs'].on('ready', function() {
  msg(strfy(plugins));
  // plugins['makeshiftctrl-obs'].runFunction('CreateScene')
  // plugins['makeshiftctrl-obs'].runFunction('CaptureWindow')
  // plugins['makeshiftctrl-obs'].runFunction('CaptureAudioOutput')
  plugins['makeshiftctrl-obs'].runFunction('AdjustVolume', [-50]) 
  plugins['makeshiftctrl-obs'].runFunction('Screenshot')
})


plugins['dummyPlugin'].on('ready', function() {
  // msg(strfy(plugins));
  plugins['dummyPlugin'].runFunction('log', ['some stuff'])  
})
