// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window console*/

define(['require', 'editor/editorInterface'],
function(require,          editorInterface) {
'use strict';
var editorIframeURL = require.toUrl('../editor/editor.html');

var editorInserter = {

  commands : {
    // promises a editor/editorInterface
    open: function(parentElement) {
      return editorInserter.insertEditor(parentElement);
    }
  },
  
  //-------------------------------------------
  insertEditor: function (parentElement) {
    return this.insertIframe(parentElement, editorIframeURL);
  },
  
  insertIframe: function(parentElement, editorURL) {
    var iframe = window.document.createElement('iframe');
    iframe.setAttribute('src', editorURL);
    iframe.classList.add('hidden');
    iframe.classList.add('bubbly');
    parentElement.appendChild(iframe);
    return iframe;
  }
};

return editorInserter;

});