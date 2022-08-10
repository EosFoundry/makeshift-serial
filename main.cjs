const { app, BrowserWindow } = require('electron')
const { MakeShiftPort } = import('./lib/makeShiftPort.js')

const createWindow = () => {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
  })

  window.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})