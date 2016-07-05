/*
* @Author: Manraj Singh
* @Date:   2016-07-06 03:15:00
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-07-06 03:29:55
*/

'use strict';

const electron = require('electron');
const {
  app,
  BrowserWindow
} = electron;

app.on('ready', function(){
  let win = new BrowserWindow({
    width: 800,
    height: 600
  });
  win.loadURL('file://' + __dirname + '/index.html');
});
