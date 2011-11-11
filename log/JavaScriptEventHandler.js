// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['browser/remoteByWebInspector', 'resources/Resources', 'resources/JavaScriptResource', 'log/EventIndex', 'lib/q/q'], 
function (       remoteByWebInspector,             Resources,             JavaScriptResource,   EventIndex,         Q) {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  
  var jsEventHandler = new thePurple.PurplePart('jsEventHandler');
  
  //---------------------------------------------------------------------------------------------
  //
  jsEventHandler.promiseStartDebugger = function() {
    return this.remote.Debugger.enable();
  };
  
  jsEventHandler.stopDebugger = function() {
    this.remote.Debugger.disable();
  };
  
  jsEventHandler.getOrCreateJavaScriptResource = function(url, isContentScript, p_id) {
    var resource = Resources.get(url);
    if (!resource) {
      resource = JavaScriptResource.new(url, isContentScript, p_id);
      Resources.append(url, resource);
    } else if ( ! JavaScriptResource.isPrototypeOf(resource) ) {
      // we have a network resource which we just discovered is a JavaScriptResource
      var tmp = JavaScriptResource.new(url, isContentScript);
      resource = tmp.merge(resource);
      Resources.replace(url, resource, p_id);
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
          console.log("JavaScriptEventHandler paused", arguments);
          alert("paused");
        },
        resumed: function() {
          console.log("JavaScriptEventHandler", arguments);
        },
        scriptFailedToParse: function(data, errorLine, errorMessage, firstLine, url) {
          console.log("JavaScriptEventHandler", arguments);
        },
        scriptParsed: function(endColumn, endLine, isContentScript, scriptId, startColumn, startLine, url, p_id) {
           var res = jsEventHandler.getOrCreateJavaScriptResource(url, isContentScript, p_id);
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
  
  jsEventHandler.connect = function(channel, filter) {
      this.remote = remoteByWebInspector.new('resourceCreationRemote');
      this.remote.connect(channel, this);
      this.store = EventIndex.new('JavaScriptEvents');
      filter.registerPart(this.store);
	  return this.promiseStartDebugger();
  };
  
  jsEventHandler.disconnect = function(channel) {
      this.stopDebugger();
      this.remote.disconnect(channel);
      delete this.store;
  };

  thePurple.registerPart(jsEventHandler);

  return jsEventHandler;
});