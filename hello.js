import { loadPlugins, plugins } from "./lib/pluginLoader.js";
import { Msg, strfy } from './lib/utils.js'

// const generalReq = {
//   eventData: {
//       detail: {
//           name: `${eventName}`
//       }
//   },
//   vendorName: `${vendorName}`,
//   requestType: `${requestType}`,
//   // ?requestData: {requestData}
//   hotkeyName: `${hotkeyName}`,
//   // ?keyId: '',
//   // ?keyModifiers: '',
//   // ?keyModifiers.shift: '',
//   // ?keyModifiers.control: '',
//   // ?keyModifiers.alt: '',
//   // ?keyModifiers.command: '',
//   sleepMillis: `${sleepMillis}`
// }



const msg = Msg('hello');

loadPlugins()
plugins['makeshiftctrl-obs'].on('ready', function() {
  
  msg(strfy(plugins));

  // plugins['makeshiftctrl-obs'].runFunction('RunObs', 
  // [{functionName: 'GetVersion', requestField: {
      
  //   }}
  // ])

  plugins['makeshiftctrl-obs'].callFunction('CreateScene', 
    { sceneName: 'scene1' }
  )

  // plugins['makeshiftctrl-obs'].callFunction('CreateScene', 
  //   { sceneName: 'scene 1' }
  // )
  
  // plugins['makeshiftctrl-obs'].runFunction('runObs', 
  // [{functionName: 'SetCurrentScene', requestField: {
  //     sceneName: 'New Scene'
  //   }}
  // ])

  // plugins['makeshiftctrl-obs'].runFunction('AdjustVolume', {
  //   inputName: 'Spotify Music',
  // adjFactor:
  //   [-50]
  // })

})


// plugins['dummyPlugin'].on('ready', function() {
//   // msg(strfy(plugins));
//   plugins['dummyPlugin'].runFunction('log', ['some stuff'])  
// })