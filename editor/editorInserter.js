// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window console*/

define(['require', 'editor/editorInterface','q/q'],
function(require,          editorInterface,    Q) {

'use strict';

var editorIframeURL = require.toUrl('../editor/editor.html');

var editorInserter = {

  commands : {

    open: function(parentElement, heightPxs, url, line, col) {
      editorInserter.insertEditor(parentElement, heightPxs).then(
        function(editor) {
            console.log('editor ready, opening '+url);
          editor.events.open(url, line, col);
        }
      );
    }
  },
  
  //-------------------------------------------
  // promises a editor/editorInterface
  insertEditor: function (parentElement, heightPxs) {
    return this.promisedEditor.then(
      function(iframe) {
        console.log('insertEditor '+iframe.contentWindow.location);
        this.reInsertIframe();
        iframe.height = heightPxs +'px';
        parentElement.appendChild(iframe);
        iframe.classList.remove('hidden');
        console.log('insertEditor returning '+iframe.contentWindow.editorInterface);
        return iframe.contentWindow.editorInterface;
      }.bind(this)
    );
  },   
  
  reInsertIframe: function() {
    window.setTimeout(function() {
      // loaded but hidden
      this.promisedEditor = this.insertIframe(document.body);
    }.bind(this), 300);
  },

  insertIframe: function(parentElement) {
    var deferred = Q.defer();
    var iframe = this.createIframe(editorIframeURL);
    parentElement.appendChild(iframe);
    iframe.contentWindow.addEventListener('purpleEditorReady', function(event) {
    console.log('editor iframe ready '+iframe.contentWindow.editorInterface+" in "+iframe.contentWindow.location);
      deferred.resolve(iframe);
    });
    return deferred.promise;
  },
  
  createIframe: function(editorURL) {
    var iframe = window.document.createElement('iframe');
    iframe.setAttribute('src', editorURL);
    iframe.classList.add('hidden');
    iframe.classList.add('bubbly');
    return iframe;
  }
};

editorInserter.reInsertIframe();

return editorInserter;

});