// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function () {
  var thePurple = window.purple;
  
  var jsEventHandler = {
    resources: [],
    contentScripts: [],
  };
  
  //---------------------------------------------------------------------------------------------
  function Resource(url) {
    this.url = url;
  }
  
  Resource.prototype = {};
  
  function JavaScriptResource(url, isContentScript) {
    this.url = url;
    this.isContentScript = isContentScript;
    this.scripts = {};
  }
  
  JavaScriptResource.prototype = {};
  
  JavaScriptResource.prototype.appendScript = function(scriptId, startLine, startColumn, endLine, endColumn) {
    this.scripts[scriptId] = [startLine, startColumn, endLine, endColumn];
  };
  
  //---------------------------------------------------------------------------------------------
  //
  jsEventHandler.startDebugger = function() {
    this.remote.Debugger.enable();
  };
  
  jsEventHandler.stopDebugger = function() {
    this.remote.Debugger.disable();
  };
  
  jsEventHandler.getOrCreateJavaScriptResource = function(url, isContentScript) {
    if (isContentScript) {
      if ( this.contentScripts.hasOwnProperty(url) ) {
        return this.contentScripts[url];
      } else {
        return (this.contentScripts[url] = new JavaScriptResource(url, isContentScript));
      }
    } else {
      if ( this.resources.hasOwnProperty(url) ) {
        return this.resources[url];
      } else {
        return (this.resources[url] = new JavaScriptResource(url, isContentScript));
      }
    }
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
           var res = jsEventHandler.getOrCreateJavaScriptResource(url, isContentScript);
           res.appendScript(scriptId, startLine, startColumn, endLine, endColumn);
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