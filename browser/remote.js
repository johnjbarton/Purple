// See Purple/licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function () {
  var thePurple = window.purple;
  
  var remote = new thePurple.Feature({
    name: "remote",
    api: {
      Console: {
        enable: function(){},
        disable: function(){},
        clearMessages: function(){},
      },
      Debugger: {
        continueToLocation: function(location) {},
        disable: function() {},
        enable: function() {},
        evaluateOnCallFrame: function(callFrameId, expression, includeCommandLineAPI, objectGroup, returnByValue) {},
        getScriptSource: function(scriptId) {},
        pause: function() {},
        removeBreakpoint: function(breakpointId) {},
        resume: function() {},
        setBreakpoint: function(condition, location) {},
        setBreakpointByUrl: function(columnNumber, condition, lineNumber, url, urlRegex) {},
        setBreakpointsActive: function(active) {},
        setPauseOnExceptions: function(state) {},
        setScriptSource: function(preview, scritpId, scriptSource) {},
        stepInto: function() {},
        stepOut: function() {},
        stepOver: function() {}
      },
      Timeline: {
        start: function(maxCallStackDepth){}, // default 5
        stop: function() {}
      },
      setResponseHandler: function (eventsHandlerObject) {} // implements events
    },
    events: {
      Debugger: {
        breakpointResolved: function(breakpointId, location) {},
        paused: function(details) {},
        resumed: function() {},
        scriptFailedToParse: function(data, errorLine, errorMessage, firstLine, url) {},
        scriptParsed: function(endColumn, endLine, isContentScript, scriptId, startColumn, startLine, url) {}
      },
      Timeline: {
        eventRecorded: function(record) {},
        started: function() {},
        stopped: function() {}
      },
      Console: {
        messageAdded: function(messageObj) {},
        messageRepeatCountUpdated: function(count) {},
        messagesCleared: function() {}
      }
    },
    types: {
      CallFrame: {
        functionName: 'string',
        id: 'string',
        location: 'Location',
        scopeChain: '[Scope]',
        'this': 'Runtime.RemoteObject'
      },
      Location: {
        columnNumber: 'integer',
        lineNumber: 'integer',
        scriptId: 'string'
      },
      Scope: {
        object: 'Runtime.RemoteObject',
        'type': 'string'
      },
      TimelineEvent: {
        children: '[TimelineEvent]',
        data: 'object',
        type: 'string'
      },
      ConsoleMessage: {
        level: ['debug', 'error', 'log', 'tip', 'error'],
        line: 'integer',
        networkRequestId: 'Network.RequestId',
        parameters: '[Runtime.RemoteObject]',
        repeatCount: 'integer',
        source: ['console-api', 'html', 'javascript', 'network', 'other', 'wml', 'xml'],
        stackTrace: 'StackTrace',
        text: 'string',
        type: ['assert', 'dir', 'dirxml', 'endGroup', 'log', 'startGroup', 'startGroupCollapsed', 'trace'],
        url: 'string'
      }
    }
  });
  
  var Features = thePurple.getPartByName('Features');
  Features.registerPart(remote);
  
}());