// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global console*/


/*
  Connection handler for one tab to chrome.experimental.debugger
  @param tabId the id of the tab to debug
  @param send function(JSONable object) to forward to app
*/

function makeDebuggerAdapter(chrome, PostSource) {

function DebuggerAdapter(windowsAdapter, connector) {
  this.windowsAdapter = windowsAdapter;
  this.port = windowsAdapter.port;
  this.connector = connector;
  this._bindEventListeners();
}

var dTemp = chrome.experiment.debugger;
var chrome = {experimental: {'debugger':dTemp}}; 

DebuggerAdapter.prototype = {

  api: ['attach', 'sendCommand', 'detach'],
  //-------------------------------------------------------------------------
  
  attach: function(debuggee, version, callback) {
    if (!this._checkDebuggee(debuggee)) {
      return;
    }
    // prepare for events from chrome.debugger
    chrome.debugger.onEvent.addListener(this.onEvent);
    
    // Setup the connection to the devtools backend
    chrome.debugger.attach({tabId: debuggee.tabId}, version, this.noErrorPosted);
  },
    
  sendCommand: function(debuggee, method, params) {
    if (!this._checkDebuggee(debuggee)) {
      return;
    }
    
    chrome.experiment.debugger.sendCommand(
      {tabId: debuggee.tabId},
      method,
      params,
      this.onResponse.bind(this, method, params)
    );
  },
  
  detach: function(debuggee) {
    if (!this._checkDebuggee(debuggee)) {
      return;
    }
    
    chrome.debugger.detach({tabId: debuggee.tabId}, this.noErrorPosted);
  },
  
  //-------------------------------------------------------------------------
  // Implementation 
  
  // Forward debugger events as JSON
  onEvent: function(debuggee, method, params) {
    // causes lots of logging      console.log("MonitorChrome: Debugger.onEvent "+method+" in tab "+debuggee.tabId+" vs this.tabId:"+this.tabId, params);
    if ( this.windowsAdapter.isAccessibleTab(debuggee.tabId) ) {
      this.postMessage({source: this.getPath(), method: method, params: params}); 
    }
  },
  
  // Forward command responses from Chrome to App
  onResponse: function(method, params, result) {
    if (!this.noErrorPosted()) {
      var request = {method: method, params: params};
      this.postMessage({source: this.getPath(), method: "OnResponse", params: [result], request: request});
    } 
  },
  
  // The browser backend announced detach
  onDetach: function(debuggee) {
    if ( this.windowsAdapter.isAccessibleTab(debuggee.tabId) ) {
      this.postMessage({source: this.getPath(), method: "onDetach", params:[debuggee]}); 
    }
  },
  
  _checkDebuggee: function(debuggee) {
    if (!this.windowsAdapter.isAccessibleTab(debuggee.tabId)) {
       this.postError("Debuggee tabId "+debuggee.tabId+" is not accessible");
       return false;
    }
	return true;
  },
  
  // Call exactly once
  _bindListeners: function() {
    this.onEvent = this.onEvent.bind(this);
    this.onAttach = this.onAttach.bind(this);
    this.onRequest = this.onRequest.bind(this);
  }
};

  var postSource = new PostSource('chrome.debugger');
  Object.keys(postSource).forEach(function(key) {
    DebuggerAdapter.prototype[key] = postSource[key];   
  });


  return DebuggerAdapter;
}

