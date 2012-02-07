// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window console*/

define(['editor/editorInterface', 'MetaObject/q/q', 'q-comm/q-rpc'],
function(       editorInterface,                Q,          Q_RPC) {



var editorStubber =  function(otherWindow, editorEventHandler) {
  return Q_RPC.makeStub(otherWindow, editorInterface.commands, editorEventHandler);
};

var editorInserter = {

  'interface' : {
    open: function(parentElement, height, url, line, col) {
        var editor = editorInserter.insertEditor(parentElement, height);
        editor.then(function(editor) {
          editor.open(url, line, col).then(function() {
            console.log("editor open returns");
            this.iframe.removeAttribute('style');
          }.bind(this));
        }.bind(this));
    }
  },
  
  insertEditor: function (parentElement, height) {
      var iframe = this.insertIframe(parentElement, height, '../editor/index.html');
      return Q.when(iframe, function(iframe) {
        this.iframe = iframe;
        return editorStubber(this.iframe.contentWindow, {});
      });
  },
  
  insertIframe: function(parentElement, height, editorURL) {
    var defer = Q.defer();
    var iframe = window.document.createElement('iframe');
    iframe.setAttribute('src', editorURL);
    iframe.setAttribute('height', height);
    iframe.setAttribute('style', "display:none");
    parentElement.appendChild(iframe);
    iframe.addEventListener('load', function() {
      defer.resolve(iframe);
    }, false);
    return defer.promise;
  }
};

return editorInserter;

});