/*
* @Author: Manraj Singh
* @Date:   2016-07-06 03:15:00
* @Last Modified by:   Sahil Dua
* @Last Modified time: 2016-07-26 23:52:39
*/

'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const dialog = electron.dialog;

let fs = require('fs');
let xml2js = require('xml2js');
let storage = require('electron-json-storage');

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

exports.parseFile = (path, callback) => {
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
    storage.set('lastOpenedFile', { path: fileSelected }, (error) => {
      if (error)
        throw error;
    });
  }

  return callback(fileSelected);
};

exports.openLastFile = (callback) => {
  // get key from storage
  storage.get('lastOpenedFile', (error, data) => {
    if (error)
      throw error;

    if (data.path) {
      // TODO: This part of code below is being repeated in parseFile as well
      // Remove the duplication once this feature is tested
      fs.readFile(data.path[0], (err, data) => {
        if (err)
          throw err;

        parser.parseString(data, (err, result) => {
          callback(JSON.stringify(result));
        });
      });
    }
  });
};
