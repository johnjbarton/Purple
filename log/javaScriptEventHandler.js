// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*globals define console alert*/

define(['log/LogBase', 'lib/crx2app/test/ScriptDebuggerProxy', 'browser/remoteByWebInspectorPart', 'resources/Resources', 'resources/JavaScriptResource', 'log/SparseArray',  'lib/part'], 
function (   LogBase,                    ScriptDebuggerProxy,           remoteByWebInspectorPart,             Resources,             JavaScriptResource,   SparseArray,         PurplePart) {
  
  var LoggingScriptDebugger = LogBase.extend(ScriptDebuggerProxy, {
    eventHandlers: {
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
           var res = this.getOrCreateJavaScriptResource(url, isContentScript, p_id);
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
        }
      }
    },
    
    initialize: function(name) {
      LogBase.initialize.apply(this, [name]);
      this.store = SparseArray.new(this.name);
      ScriptDebuggerProxy.initialize.apply(this, [this.eventHandlers]);
    },
    
    getOrCreateJavaScriptResource: function(url, isContentScript, p_id) {
      var resource = Resources.get(url);
      if (!resource) {
        resource = JavaScriptResource.new(url, isContentScript, p_id);
        Resources.append(url, resource);
      } else if ( ! JavaScriptResource.isPrototypeOf(resource) ) {
        // we have a network resource which we just discovered is a JavaScriptResource
        var tmp = JavaScriptResource.new(url, isContentScript);
        resource = tmp.mergeMethods(resource);
        Resources.replace(url, resource, p_id);
      }
      return resource;
    },
    
    //-----------------------------------------------------------------------------
    enable: function() {
      debugger;
    },
    disable: function() {
      debugger; 
    }
  });
  
  var jsEventHandler = LoggingScriptDebugger.new('javascriptLog');
  
  //---------------------------------------------------------------------------------------------
  //

  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  
  jsEventHandler.connect = function(channel, viewport) {
      // This allows the UI to enable/disable the inputs, without consulting this object....
      LogBase.connect.apply(this,[this, viewport]);  
  };
  
  jsEventHandler.disconnect = function(channel) {
      this.remote.disconnect(channel);
      delete this.store;
  };

  return jsEventHandler;
});