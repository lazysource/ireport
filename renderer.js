/*
* @Author: sahildua2305
* @Date:   2016-07-23 23:17:53
* @Last Modified by:   Sahil Dua
* @Last Modified time: 2016-07-26 23:54:05
*/

'use strict';

const electron = require('electron');
const remote = electron.remote;
const mainProcess = remote.require('./index');

let selectedFile = '';

window.onload = _ => {
  // call openLastFile
  mainProcess.openLastFile((data) => {

    // TODO: Take out the code below to eliminate the duplicacy in the code
    let json_data = JSON.parse(data);
    let files_info = json_data.pmd.file;
    let violationsList = getAllViolations(files_info);
    let violationsTable = getViolationsTable(violationsList);
    document.getElementById('error-message-container').innerHTML = violationsTable;
  });
}

document.getElementById('chooseFile').addEventListener('click', _ => {
  mainProcess.chooseFile((fileName) => {
    selectedFile = fileName;
    if (selectedFile) {
      mainProcess.parseFile(selectedFile[0], (data) => {
        let json_data = JSON.parse(data);
        let files_info = json_data.pmd.file;
        let violationsList = getAllViolations(files_info);
        let violationsTable = getViolationsTable(violationsList);
        document.getElementById('error-message-container').innerHTML = violationsTable;
      }); 
    }
  });
});

/**
* A Violation class holds all the information about each error and/or warning generated by the Quality Check Plugin. 
*/
class Violation {
  constructor(fileName, className, beginningLine, description) {
    this.fileName = fileName;
    this.className = className;
    this.beginningLine = beginningLine;
    this.description = description;
  }
}

/**
* This method returns an Array of Violations.
*/
const getAllViolations = (fileInfoList) => {

  let violationsList = new Array();

  for (let fi in fileInfoList) {

      let fileName = fileInfoList[fi].$.name;
      let errorsInFile = fileInfoList[fi].violation;
      console.log("File ======= " + fileName);
      
      for (let i=0; i<errorsInFile.length;i++) {
        let error = errorsInFile[i];
        console.log(error);
        let violation = new Violation(fileName, error.$.class, error.$.beginline, error._);
        violationsList.push(violation);
      } 

  }

  return violationsList;
}

/*
  This method returns the completely built Violations Table from the Violations List
  passed to it. This method has been abstracted out in order to keep the view logic 
  separate.
*/
const getViolationsTable = (violationsList) => {
    let html = '';
    for (let i=0;i<violationsList.length;i++) {
      let violation = violationsList[i];
      html += '<div id="error-message">';
      html += '<h5>' + violation.fileName + '</h5>';
      html += '<table border="1" cellspacing="0" cellpadding="0"><tr><th>ClassName</th><th>Line Number</th><th>Error Message</th></tr>';
      html += '<tr>';
      html += '<td class="error-class">' + violation.className + '</td>';
      html += '<td class="error-beginline">' + violation.beginningLine + '</td>';
      html += '<td class="error-desc">' + violation.description + '</td>';
      html += '</tr>';
      html += '</table>';
      html += '</div>';
    }
    return html;
}
