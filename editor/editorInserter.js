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
    open: function(where, url, line, col) {
        var editor = editorInserter.insertEditor(where);
        editor.then(function(editor) {
          editor.open(url, line, col).then(function() {
            console.log("editor open returns");
          });
        });
    }
  },
  
  insertEditor: function (where) {
      var iframe = this.insertIframe(where, '../editor/index.html');
      return Q.when(iframe, function(iframe) {
        this.iframe = iframe;
        return editorStubber(this.iframe, {});
      });
  },
  
  insertIframe: function(where, url) {
    var defer = Q.defer();
    var iframe = window.document.createElement('iframe');
    iframe.setAttribute('src', url);
    where.appendChild(iframe);
    iframe.addEventListener('load', function() {
      defer.resolve(iframe);
    }, false);
    return defer.promise;
  }
};

return editorInserter;

});