'use strict';

const electron = require('electron');
const {app, BrowserWindow, dialog} = electron;

const fs = require('fs');
const xml2js = require('xml2js');
const storage = require('electron-json-storage');

let Project = require('./models/project.js');
let parser = new xml2js.Parser();

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

// storage.clear((error) => {
//   if (error)
//     throw error;
// });

/*
  Reads file from the path given, throws error if there is any, while reading the file.
  Parses the data read from the file and converts it into JSON
*/
const readAndParseFile = (path, callback) => {
  fs.readFile(path, (err, data) => {
    if (err)
      throw err;

    parser.parseString(data, (err, result) => {
      callback(JSON.stringify(result));
    });
  });
};

/*
  Exports the function for selecting a file using dialog and returns the selected file path.
  It also saves/updates the path in local storage to keep track of last file opened.
*/
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

    // store this file (project report) in local storage for recentlyOpenedFiles
    storage.get('recentlyOpenedFiles', (error, data) => {
      if (error)
        throw error;

      console.log(data);
      let previousData = data.files;
      if (!previousData)
        previousData = [];
      previousData.push(new Project('name', fileSelected[0]));
      storage.set('recentlyOpenedFiles', { files: previousData }, (error) => {
        if (error)
          throw error;

        storage.get('recentlyOpenedFiles', (error, data) => {
          if (error)
            throw error;
          console.log(data);
        });
      });
    });
  }

  return callback(fileSelected);
};

/*
  Exports the function for parsing an XML file and returning JSON corresponding to the XML data
*/
exports.parseFile = (path, callback) => {
  readAndParseFile(path, callback);
};

/*
  Exports the function which is called on `window.onload` from `renderer.js`.
  Gets last opened file path from local storage and parses its contents to return JSON
*/
exports.openLastFile = (callback) => {
  /*
    get key from storage
  */
  storage.get('lastOpenedFile', (error, data) => {
    if (error)
      throw error;
    console.log(data);

    if (data.path) {
      readAndParseFile(data.path[0], callback);
    }
  });
};
