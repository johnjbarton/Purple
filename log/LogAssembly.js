// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define */

define(['log/javaScriptEventHandler', 'log/consoleEventHandler', 'log/networkEventHandler'], 
function(            jsEventHandler,       consoleEventHandler,       networkEventHandler) {
  var LogAssembly = {
    eventHandlers: {
      windows: {},
      tabs: {},
      'debugger': {}
    },
    
    initialize: function() {
        
    }
  };
  return LogAssembly;
});