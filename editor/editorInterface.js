// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*globals define*/

define([], 
function () {
  
  var editorInterface = {
    
    commands: { // from IDE to editor
      open: function(url, lineNumber, columnNumber) {}
    },
    events: {   // from editor to IDE
      sourceChange: function() {}
    }
  };
  
  return editorInterface;
  
});