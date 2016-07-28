'use strict';

const electron = require('electron');
const {remote} = electron;
const mainProcess = remote.require('./index');

let selectedFile = '';
let fileInfoList = new Array();

/*
  Store information about the current sorting at any moment

  E.g. If sortedBy.lineNumber is `true`, that means the list has already been sorted
    by line number in ascending order. Hence if user clicks on lineNumber header again,
    we will sort the list in descending order and set sortedBy.lineNumber `false`.
    Now if, user clicks on the lineNumber header again, then the list will be sorted
    in ascending order again.
*/
let sortedBy = {
  className: false,
  lineNumber: false,
  description: false
};

/*
  Initialises the file Info list based on JSON Data parsed from the file read from the
  local system. This file instance is then saved for global access.
*/
const initFileInfoFromData = (data) => {
  let jsonData = JSON.parse(data);
  fileInfoList = jsonData.pmd.file;
}

/*
  Displays the violations list passed to it on the view. This method abstracts out any business logic
  associated with the violations. This helps us in modifications of the list outside this method, like
  sorting data etc.
*/
const showViolationsTable = (violationsList) => {
  let violationsTable = getViolationsTable(violationsList);
  document.getElementById('error-message-container').innerHTML = violationsTable;
  addAllSortingListeners();
}

/*
  Gets triggered once the DOM is ready and all resources have been loaded. Calls `openLastFile`
  from the exported functions and loads the content (JSON) returned in the callback.
*/
window.onload = _ => {
  mainProcess.openLastFile((data) => {
    initFileInfoFromData(data);
    let violationsList = getAllViolations();
    showViolationsTable(violationsList);
  });
}

/*
  Calls `chooseFile` first, and then calls `parseFile` from the exported functions to load
  the content (JSON) returned in the callback.
*/
document.getElementById('chooseFile').addEventListener('click', _ => {
  mainProcess.chooseFile((fileName) => {
    selectedFile = fileName;
    if (selectedFile) {
      mainProcess.parseFile(selectedFile[0], (data) => {
        initFileInfoFromData(data);
        let violationsList = getAllViolations();
        showViolationsTable(violationsList);
      }); 
    }
  });
});

/*
  Adds all click listeners that sort the violations based on a certain property like
  class name, line number or description/error message.
*/
const addAllSortingListeners = _ => {
  /*
    Click on ClassName will sort the list in Ascending order by class name and display.
  */
  document.getElementById('className').addEventListener('click', _ => {
    clearViolationsTable();
    let violationsList = getAllViolations();

    /*
      If sortedBy.className is `true`, that means we need to sort the list in descending order now.
      Otherwise, sort the list in ascending order.
    */
    if (sortedBy.className) {
      violationsList.sort(function(a,b) {
        return b.className.localeCompare(a.className);
      });
    }
    else {
      violationsList.sort(function(a,b) {
        return a.className.localeCompare(b.className);
      });
    }

    /*
      Toggle the flag sortedBy.className to make sure the list is sorted in opposite order next time.
    */
    sortedBy.className = !sortedBy.className;

    showViolationsTable(violationsList);
  });
  
  /*
    Click on LineNumber will sort the list in Ascending order by Line Number and display.
  */
  document.getElementById('lineNumber').addEventListener('click', _ => {
    clearViolationsTable();
    let violationsList = getAllViolations();

    /*
      If sortedBy.lineNumber is `true`, that means we need to sort the list in descending order now.
      Otherwise, sort the list in ascending order.
    */
    if (sortedBy.lineNumber) {
      violationsList.sort(function(a,b) {
        return b.beginningLine - a.beginningLine;
      });
    }
    else {
      violationsList.sort(function(a,b) {
        return a.beginningLine - b.beginningLine;
      });
    }

    /*
      Toggle the flag sortedBy.lineNumber to make sure the list is sorted in opposite order next time.
    */
    sortedBy.lineNumber = !sortedBy.lineNumber;

    showViolationsTable(violationsList);
  });

  /*
    Click on Error Message will sort the list in Ascending order by description and display.
  */
  document.getElementById('description').addEventListener('click', _ => {
    clearViolationsTable();
    let violationsList = getAllViolations();

    /*
      If sortedBy.description is `true`, that means we need to sort the list in descending order now.
      Otherwise, sort the list in ascending order.
    */
    if (sortedBy.description) {
      violationsList.sort(function(a,b) {
        return b.description.localeCompare(a.description);
      });
    }
    else {
      violationsList.sort(function(a,b) {
        return a.description.localeCompare(b.description);
      });
    }

    /*
      Toggle the flag sortedBy.description to make sure the list is sorted in opposite order next time.
    */
    sortedBy.description = !sortedBy.description;
    showViolationsTable(violationsList);
  });

}

/*
  Removes the Violations Table from the Page.
*/
const clearViolationsTable = _ => {

  document.getElementById('error-message-container').innerHTML = '';

}

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
const getAllViolations = _ => {

  let violationsList = new Array();

  for (let fi in fileInfoList) {

      let fileName = fileInfoList[fi].$.name;
      let errorsInFile = fileInfoList[fi].violation;
      for (let i=0; i<errorsInFile.length;i++) {
        let error = errorsInFile[i];
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
    html += '<div id="error-message">';
    html += '<table border="1" cellspacing="0" cellpadding="0"><tr><th id="className">ClassName</th><th id="lineNumber">Line Number</th><th id="description">Error Message</th></tr>';
    
    for (let i=0;i<violationsList.length;i++) {
      let violation = violationsList[i];
      html += '<tr>';
      html += '<td class="error-class">' + violation.className + '</td>';
      html += '<td class="error-beginline">' + violation.beginningLine + '</td>';
      html += '<td class="error-desc">' + violation.description + '</td>';
      html += '</tr>';
    }

    html += '</table>';
    html += '</div>';
    return html;
}
