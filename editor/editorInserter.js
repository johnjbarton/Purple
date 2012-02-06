// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window console*/

define(['editor/editorInterface', 'MetaObject/q/q', 'MetaObject/q-comm/q-comm'],
function(editorInterface, Q, Q_COMM) {

function buildPromisingCalls(iface, remote) {
  var stub = {};
  Object.keys(iface).forEach(function(method) {
    // functions on stub operate on remote
    stub[method] =  function() {
      var args = Array.prototype.slice.call(arguments);       
      return remote.invoke.apply(remote, [method].concat(args));
    };
  });
  return stub;
}

function stubber(iframe, commands, eventHandler) {
  var qStub = Q_COMM.Connection(iframe.contentWindow, eventHandler, {origin: window.location.origin});
  return buildPromisingCalls(commands, qStub); 
}

var editorStubber =  function(iframe, editorEventHandler) {
  return stubber(iframe, editorInterface.commands, editorEventHandler);
};

var editorInserter = {

  'interface' : {
    open: function(parentElement, height, url, line, col) {
        var editor = editorInserter.insertEditor(parentElement, height);
        editor.then(function(editor) {
          editor.open(url, line, col).then(function() {
            console.log("editor open returns");
          });
        });
    }
  },
  
  insertEditor: function (parentElement, height) {
      var iframe = this.insertIframe(parentElement, height, '../editor/index.html');
      return Q.when(iframe, function(iframe) {
        this.iframe = iframe;
        return editorStubber(this.iframe, {});
      });
  },
  
  insertIframe: function(parentElement, height, editorURL) {
    var defer = Q.defer();
    var iframe = window.document.createElement('iframe');
    iframe.setAttribute('src', editorURL);
    iframe.setAttribute('height', height);
    parentElement.appendChild(iframe);
    iframe.addEventListener('load', function() {
      defer.resolve(iframe);
    }, false);
    return defer.promise;
  }
};

return editorInserter;

});