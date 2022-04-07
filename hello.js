import { loadPlugins, plugins } from "./lib/pluginLoader.js";
import { Msg, strfy } from './lib/utils.js'

const msg = Msg('hello');

loadPlugins()
plugins['makeshiftctrl-obs'].on('ready', function() {
  msg(strfy(plugins));

  plugins['makeshiftctrl-obs'].runFunction('CreateScene', {
    sceneName: 'New Scene'
  })

  plugins['makeshiftctrl-obs'].runFunction('CreateScene')

  // setTimeout(() => {
  //   plugins['makeshiftctrl-obs'].runFunction('RemoveScene', {
  //     sceneName: 'New Scene'
  //   })
  // }, 5000)

  // plugins['makeshiftctrl-obs'].runFunction('AdjustVolume', {
  //   requestData: {
  //     inputName: 'Spotify Music'
  //   },
  // adjFactor:
  //   [-50]
  // })

  // plugins['makeshiftctrl-obs'].runFunction('Get', {
  //   funcName: 'GetVersion',
    
  //   requestData: {
    
  //   }
  // })

})


// plugins['dummyPlugin'].on('ready', function() {
//   // msg(strfy(plugins));
//   plugins['dummyPlugin'].runFunction('log', ['some stuff'])  
// })