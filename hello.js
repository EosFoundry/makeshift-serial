import { loadPlugins, plugins } from "./pluginLoader.js";
import { Msg, strfy } from './utils.js'

const msg = Msg('hello');

loadPlugins()
plugins['dummyPlugin'].on('ready', function() {
  msg(strfy(plugins));
  plugins['dummyPlugin'].runFunction('log', ['some stuff'])
})
