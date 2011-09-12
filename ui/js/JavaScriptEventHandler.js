// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function () {
  var thePurple = window.purple;
  
  var jsEventHandler = {};
  
  //---------------------------------------------------------------------------------------------
  //
  jsEventHandler.startDebugger = function() {
    this.Debugger.enable();
  };
  
  jsEventHandler.stopDebugger = function() {
    this.Debugger.disable();
  };

  // Implement Remote.events
  jsEventHandler.ResponseHandlers = {
    Debugger: {
        breakpointResolved: function(breakpointId, location) {
          console.log("JavaScriptEventHandler", arguments);
        },
        paused: function(details) {
          console.log("JavaScriptEventHandler", arguments);
        },
        resumed: function() {
          console.log("JavaScriptEventHandler", arguments);
        },
        scriptFailedToParse: function(data, errorLine, errorMessage, firstLine, url) {
          console.log("JavaScriptEventHandler", arguments);
        },
        scriptParsed: function(endColumn, endLine, isContentScript, scriptId, startColumn, startLine, url) {
          console.log("JavaScriptEventHandler", arguments);
        }
      },
      Timeline: {
        eventRecorded: function(record) {
          console.log("JavaScriptEventHandler", arguments);
        },
        started: function() {
          console.log("JavaScriptEventHandler", arguments);
        },
        stopped: function() {
          console.log("JavaScriptEventHandler", arguments);
        },
      },
  };
  
   //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  
  jsEventHandler.featureImplemented = function(feature) {
    if (feature.name === 'remote') {
      this.remote = feature.implementation;
      this.remote.setResponseHandlers(this.ResponseHandlers);
	  this.startDebugger();
	}
  };
  
  jsEventHandler.featureUnimplemented = function(feature) {
    if (feature.name === 'remote') {
      this.stopDebugger();
	}
  };

  thePurple.registerPart(jsEventHandler);

  
}());