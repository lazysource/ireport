/*
* @Author: sahildua2305
* @Date:   2016-07-23 23:17:53
* @Last Modified by:   Sahil Dua
* @Last Modified time: 2016-07-24 00:12:15
*/

'use strict';

console.log('renderer');

const electron = require('electron');
const remote = electron.remote;
const mainProcess = remote.require('./index');

mainProcess.parseFile('./test_reports/pmd.xml', function (data) {
  // console.log(data);
  var json_data = JSON.parse(data);
  var files_info = json_data.pmd.file;
  console.log(files_info);
  for(var file in files_info) {
    console.log(files_info[file].$.name);
  }
});
