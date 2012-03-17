// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window console*/

define(['require', 'editor/EditorInterface','q/q'],
function(require,          EditorInterface,    Q) {

'use strict';

var editorInserter = {

    open: function(parentElement, heightPxs, url, line, col) {
      var editorDiv = parentElement.ownerDocument.createElement('div');
      editorDiv.setAttribute('id', 'editor');
      editorDiv.setAttribute('height', heightPxs+'px');
      
      var contentAssist = parentElement.ownerDocument.createElement('div');
      contentAssist.setAttribute('id', 'contentAssist');
      contentAssist.setAttribute('class', 'contentAssist');
      
      parentElement.appendChild(editorDiv);
      parentElement.appendChild(contentAssist);
      var editor = new EditorInterface(editorDiv);
      console.log('editor ready, opening '+url);
      editor.open(url, line, col);
  }
};  
  //-------------------------------------------

return editorInserter;

});