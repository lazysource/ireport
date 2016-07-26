'use strict';

const electron = require('electron');
const {app, BrowserWindow, dialog} = electron;

const fs = require('fs');
const xml2js = require('xml2js');
const storage = require('electron-json-storage');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 980, height: 920});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

let parser = new xml2js.Parser();

const readAndParseFile = (path, callback) => {
  fs.readFile(path, (err, data) => {
    if (err)
      throw err;

    parser.parseString(data, (err, result) => {
      callback(JSON.stringify(result));
    });
  });
};

exports.chooseFile = (callback) => {
  let fileSelected = dialog.showOpenDialog({
    title: 'Open local PMD generated report',
    buttonLabel: 'Choose file',
    properties: [
      'openFile'
    ],
    filters: [
      {
        name: 'XML Report',
        extensions: ['xml']
      }
    ]
  });

  if (fileSelected) {
    // store this file path in local storage
    storage.set('lastOpenedFile', { path: fileSelected }, (error) => {
      if (error)
        throw error;
    });
  }

  return callback(fileSelected);
};

exports.parseFile = (path, callback) => {
  readAndParseFile(path, callback);
};

exports.openLastFile = (callback) => {
  // get key from storage
  storage.get('lastOpenedFile', (error, data) => {
    if (error)
      throw error;

    if (data.path) {
      readAndParseFile(data.path[0], callback);
    }
  });
};
