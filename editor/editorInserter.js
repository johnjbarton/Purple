// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window*/

define(['editor/editorInterface', 'MetaObject/q/q', 'MetaObject/q-comm/q-comm'],
function(editorInterface, Q, Q_COMM) {

function buildPromisingCalls(iface, impl) {
  var stub = {};
  Object.keys(iface).forEach(function(method) {
    stub[method] = impl.invoke.bind(stub, method);
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
        editor.open(url, line, col);
    }
  },
  
  insertEditor: function (where) {
      this.iframe = this.insertIframe(where, '../editor/index.html');
      return editorStubber(this.iframe, {});
  },
  
  insertIframe: function(where, url) {
    var iframe = window.document.createElement('iframe');
    iframe.setAttribute('src', url);
    where.appendChild(iframe);
    return iframe;
  }
};

return editorInserter;

});