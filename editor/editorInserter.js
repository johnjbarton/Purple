// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window console*/

define(['require', 'editor/EditorInterface'],
function(require,          EditorInterface) {

'use strict';

var editorContainerHTML =
  "<div class='editorContainer' height='300px' width='100%'>" +
  "  <div class='editor' id='editor'>" +
  "  </div>" +
  "  <div class='contentAssist' id='contentAssist'>" +
  "  </div>";

var editorInserter = {

    open: function(parentElement, heightPxs, url, line, col) {      
      parentElement.innerHTML = editorContainerHTML;
      var editor = new EditorInterface(parentElement.firstChild);
      console.log('editor ready, opening '+url);
      editor.open(url, line, col);
  }
};  
  //-------------------------------------------

return editorInserter;

});