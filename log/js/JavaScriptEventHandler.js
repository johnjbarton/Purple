// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function () {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;

  var Resources = new thePurple.PurplePart('resources');
  
  Resources.resources = [];
  Resources.resourcesByURL = {}; // a Resource or an array of
  
  Assembly.addPartContainer(Resources);

  Resources.append = function(url, resource) {
    this.resourcesByURL[url] = resource;
    this.resources.push(resource);
    this.toEachPart('change', [{mutation: 'add', propertyName: url, value: resource}]);
    return resource;
  };

  Resources.get = function(url) {
    if ( this.resourcesByURL.hasOwnProperty(url) ) {
      return this.resourcesByURL[url];
    }
  };
  
  thePurple.registerPart(Resources);
  
  var jsEventHandler = new thePurple.PurplePart('jsEventHandler');
  
    
  //---------------------------------------------------------------------------------------------
  
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
    var resource = Resources.get(url);
    if (!resource) {
      resource = Resources.append(url, new JavaScriptResource(url, isContentScript));
    }
    return resource;
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
  
  jsEventHandler.partAdded = function(partInfo) {
    if (partInfo.value.hasFeature('remote')) {
      this.remote = partInfo.value;
      this.remote.setResponseHandlers(this.ResponseHandlers);
	  this.startDebugger();
	}
  };
  
  jsEventHandler.partRemoved = function(partInfo) {
    if (this.remote && partInfo.value === this.remote) {
      this.stopDebugger();
	}
  };

  thePurple.registerPart(jsEventHandler);

  
}());