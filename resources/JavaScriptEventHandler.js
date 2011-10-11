// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../browser/remoteByWebInspector', '../resources/Resources', '../resources/JavaScriptResource'], function (remoteByWebInspector, Resources, JavaScriptResource) {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  
  var jsEventHandler = new thePurple.PurplePart('jsEventHandler');
  
  //---------------------------------------------------------------------------------------------
  //
  jsEventHandler.startDebugger = function() {
    this.remote.Debugger.enable();
  };
  
  jsEventHandler.stopDebugger = function() {
    this.remote.Debugger.disable();
  };
  
  jsEventHandler.getOrCreateJavaScriptResource = function(url, isContentScript) {
    var resource = Resources.get(url);
    if (!resource) {
      resource = Resources.append(url, new JavaScriptResource(url, isContentScript));
    }
    return resource;
  };

  // Implement Remote.events
  jsEventHandler.responseHandlers = {
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
  
  jsEventHandler.connect = function(channel) {
      this.remote = remoteByWebInspector.create('resourceCreationRemote', this.responseHandlers);
      this.remote.connect(channel);
      this.logger = channel.recv.bind(channel);
      Resources.connect(this.logger);
	  this.startDebugger();
  };
  
  jsEventHandler.disconnect = function(channel) {
      this.stopDebugger();
      this.remote.disconnect(channel);
      Resources.disconnect(this.logger);
  };

  thePurple.registerPart(jsEventHandler);

  return jsEventHandler;
});