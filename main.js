const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const ipc = require('electron').ipcMain ;
const dialog = require('electron').dialog ;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
var current_workflow = null ;

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600})
    win.setFullScreen(true) ;
    // win.maximize() ;
    // win.$ = $

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    let contents = win.webContents ;
    console.log(contents) ;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipc.on('dialog-request', (event, arg) => {
    console.log('Received dialog request') ;
    dialog.showOpenDialog({
         properties: ['openDirectory'],
    }, function(dir_names) {
        if (dir_names == undefined) {
            event.returnValue = undefined ;
        } else {
            var dir_name = dir_names[0] ;
            event.returnValue = dir_name ;
        }
    }) ;
}) ;

ipc.on('load-page', (event, arg) => {
    if (arg.name != undefined) {
        current_workflow = arg ;
    }
    console.log(current_workflow) ;
    win.loadURL(arg.path) ;
});

ipc.on('reload-page', (event, arg) => {
    console.log(arg) ;
    win.loadURL(arg.path) ;
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
