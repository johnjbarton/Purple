// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global chrome console*/


/*
  Connection handler for one tab to chrome.experimental.debugger
  @param tabId the id of the tab to debug
  @param send function(JSONable object) to forward to app
*/

function Debugger2JSON(tabId, send) {
  this.tabId = tabId;
  this.send = send;
  this._bindEventListeners();
}

Debugger2JSON.prototype = {

  VERSION: '0.1',
  
  //-------------------------------------------------------------------------
  // API
  
  attach: function(callback) {
    // prepare for events from chrome.debugger
    chrome.experimental.debugger.onEvent.addListener(this.onEvent);
    
    // Setup the connection to the devtools backend
    chrome.experimental.debugger.attach({tabId: this.tabId}, this.VERSION, this.onAttach.bind(this, callback));
  },
    
  // Forward command requests from App to Chrome
  onRequest: function(req) {
    chrome.experiment.debugger.sendCommand(
      {tabId: this.tabId},
      req.method,
      req.params,
      this.onResponse.bind(this, req)
    );
  },
  
  detach: function() {
    chrome.experimental.debugger.detach({tabId: this.tabId}, this.assertIfError);
  },
  
  //-------------------------------------------------------------------------
  // Implementation 
  
  // Forward debugger events as JSON
  onEvent: function(debuggee, method, params) {
    // causes lots of logging      console.log("MonitorChrome: Debugger.onEvent "+method+" in tab "+debuggee.tabId+" vs this.tabId:"+this.tabId, params);
    if (debuggee.tabId === this.tabId) {
      this.send({source: "debugger", name: method, params: params}); 
    }
  },
  
  // Forward command responses from Chrome to App
  onResponse: function(request, result) {
    if (! chrome.extension.lastError) {
      console.log("crx2app/debugger2JSON.onResponse "+request.p_id, {result: result, request: request});
      this.send({source: "debugger", name: "response", result: result, request: request});
    } else {
      console.log("crx2app/debugger2JSON.onResponse "+request.p_id+": "+ chrome.extension.lastError.message , {result: result, request: request});
      this.send({source: "debugger", name: "response", error: chrome.extension.lastError, request: request});
    }
  },
  
  onAttach: function(callback) {
    this.assertIfError('onAttach to '+this.tabId);
    if (callback) {
      callback();
    }
  },
  
  // The browser backend announced detach
  onDetach: function(tabId) {
    if (tabId === this.tabId) {
      this.send({source: "debugger", name: "detach"}); 
    }
  },
  
  assertIfError: function(where) {
    console.assert(!chrome.extension.lastError, "crx2app/debugger2JSON FAILS "+where);
    throw new Error(chrome.extension.lastError);
  },
  
  // Call exactly once
  _bindListeners: function() {
    this.onEvent = this.onEvent.bind(this);
    this.onAttach = this.onAttach.bind(this);
    this.onRequest = this.onRequest.bind(this);
  }
};



