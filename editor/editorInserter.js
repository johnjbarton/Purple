// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window console*/

define(['require', 'editor/editorInterface', 'q/q', 'q-comm/q-rpc'],
function(require,          editorInterface,     Q,          Q_RPC) {

var editorIframeURL = require.toUrl('../editor/editor.html');

var editorStubber =  function(otherWindow, editorEventHandler) {
  return Q_RPC.makeStub(otherWindow, editorInterface.commands, editorEventHandler);
};

var editorInserter = {

  commands : {
    open: function(parentElement, url, line, col) {
        var editor = editorInserter.insertEditor(parentElement);
        editor.then(function(editor) {
          editor.open(url, line, col).then(function() {
            console.log("editor open returns");
            this.iframe.classList.remove('hidden');
          }.bind(this));
        }.bind(this));
    }
  },
  
  //-------------------------------------------
  insertEditor: function (parentElement) {
      var iframe = this.insertIframe(parentElement, editorIframeURL);
      return Q.when(iframe, function(iframe) {
        this.iframe = iframe;
        return editorStubber(this.iframe.contentWindow, {});
      }.bind(this.commands));
  },
  
  insertIframe: function(parentElement, editorURL) {
    var defer = Q.defer();
    var iframe = window.document.createElement('iframe');
    iframe.setAttribute('src', editorURL);
    iframe.classList.add('hidden');
    iframe.classList.add('bubbly');
    parentElement.appendChild(iframe);
    iframe.addEventListener('load', function() {
      defer.resolve(iframe);
    }, false);
    iframe.addEventListener('unload', function() {
      debugger;
    }, false);
    return defer.promise;
  }
};

return editorInserter;

});