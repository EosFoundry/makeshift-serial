import chalk from 'chalk'

const pluginData = {
    name: 'dummyPlugin',
    dummyData: 'some string',
    mutable: [
        'dummyData',
    ],
}

function doSomethingElse() {
    
}

function doSomething() {
    // tell photoshop to open something
    // send a link to the browser
    // move the mouse in a specific way
    console.log('doing something')
}

function log(message) {
    console.log(`${pluginData.name} ==> ${message}`)
}

export { 
    pluginData,
    log,
    doSomething,
}
