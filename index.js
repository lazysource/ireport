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

var fs = require('fs'),
    xml2js = require('xml2js');

app.on('ready', function(){
  let win = new BrowserWindow({
    width: 800,
    height: 600
  });
  win.loadURL('file://' + __dirname + '/index.html');
});

var parser = new xml2js.Parser();
fs.readFile('/Users/ishan/dev/code/android/mlite-tablet-app/app/build/reports/pmd/pmd.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        console.dir(JSON.stringify(result));
        console.log('Done');
    });
});