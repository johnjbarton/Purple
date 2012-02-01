// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define */

define(['log/javaScriptEventHandler', 'log/consoleEventHandler', 'log/networkEventHandler', 'lib/q/q'], 
function(            jsEventHandler,       consoleEventHandler,       networkEventHandler,         Q) {

  var DebuggerLogAssembly = {
     
    initialize: function() {
      jsEventHandler.initialize();
      networkEventHandler.initialize();
      consoleEventHandler.initialize();
    },
     
    connect: function(viewport) {
      this.viewport = viewport;
      // we have to wait for onPreAttach to complete the connection
    },
 
    
    onPreAttach: function(debuggerProxy) {
      jsEventHandler.connect(debuggerProxy, this.viewport);
      networkEventHandler.connect(debuggerProxy, this.viewport);
      consoleEventHandler.connect(debuggerProxy, this.viewport);
    },

    onPostAttach: function(debuggerProxy) {
      return Q.all([
        debuggerProxy.Debugger.enable(),
        debuggerProxy.Network.enable(),
        debuggerProxy.Console.enable()
        ]);
    }
    
  };
  
  return DebuggerLogAssembly;
});