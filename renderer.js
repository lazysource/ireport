/*
* @Author: sahildua2305
* @Date:   2016-07-23 23:17:53
* @Last Modified by:   Sahil Dua
* @Last Modified time: 2016-07-24 15:23:38
*/

'use strict';

console.log('renderer');

const electron = require('electron');
const remote = electron.remote;
const mainProcess = remote.require('./index');

mainProcess.parseFile('./test_reports/pmd.xml', function (data) {
  var json_data = JSON.parse(data);
  var files_info = json_data.pmd.file;

  var html = '', violations;

  for(var i in files_info) {
    html += '<div id="error-message">';
    html += '<h5>' + files_info[i].$.name + '</h5>';

    violations = files_info[i].violation;
    if (violations.length > 0)
      html += '<table border="1" cellspacing="0" cellpadding="0"><tr><th>ClassName</th><th>Line Number</th><th>Error Message</th></tr>';

    for (var j in violations) {
      var v = violations[j];
      console.log(v);
      html += '<tr>';
      html += '<td class="error-class">' + v.$.class + '</td>';
      html += '<td class="error-beginline">' + v.$.beginline + '</td>';
      html += '<td class="error-desc">' + v._ + '</td>';
      html += '</tr>';
    }

    if (violations.length > 0)
      html += '</table>';
    html += '</div>';
  }

  document.getElementById('error-message-container').innerHTML = html;
});
