// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global chrome document window console*/

/*
  Chrome extension end of crx2app communications
  
  This file runs in background.html. It waits for the content-script 
  in contentScriptProxy.js to connect, then ferries requests from 
  app to chrome and responses/events from chrome to app.
  
  The messages from App are multiplexed: {target: string, request: any},
  send to chrome[target], eg chrome.experimental.debugger
  
  The messages to App are multiplexed: {source: string, data: any}
  
 */
 
var crxEnd = {

  VERSION: '1',
  PROXY_NAME: 'crx2AppProxy',
  EXTN_EVENT_NAME: 'crxDataReady',   // The App listens for this event type
  DATA_PREFIX: 'data-crx',           // The App gets/sets this attribute 
  APP_EVENT_NAME: 'crxAppDataReady', // The App raises this event type



  // Entry point, sets up the communication with the content-script
  // @param chromeAdapters dictionary of target-names to adapters
  //         eg 'debugger': debugger2JSONAdapter
  // @param AppState: ctor for client represention
  
  attach: function(chromeAdapters, AppState) {
    this.chromeAdapters = chromeAdapters;
    chrome.extension.onRequest.addListener(this.onRequest);
  },
  
  totalClients: 0,
  
  getClientByTabId: function(debuggerTabId) {
    var client;
    Object.keys(this.clientsByName).forEach(function(name) {
      if (this.clientsByName[name].debuggerTabId === debuggerTabId) {
        client = this.clientsByName[name];
      }
    });
    return client;
  },
  
  // the content script's introduction comes in here.
  onRequest: function(request, sender, sendResponse) {
    // Do I know you?
    if (sender.tab && request.name === this.PROXY_NAME) {
      this.clientsByName = this.clientsByName || {};
    
      var client = this.getClientByTabId(sender.tab.id);
      if (!client) {
        client = new AppState(sender);
      }
      
      // prepare for connection
      chrome.extension.onConnect.addListener(this.onConnect);
      
      // give the proxy it's name, ending our introduction
      sendResponse({name: client.name});
      
    } else {
      sendResponse(undefined);
    }
  },
  
  // When the content script connects its port has the name we gave it.
  onConnect: function(port) {
    var client = this.clientsByName[port.name];
    if (client) {
      client.port = port;
      // prepare for message traffic
      port.onMessage.addListener(this.onMessage.bind(this, client));
    } else {
      console.error("crx2app/crxEnd: no client for port.name: "+port.name);
    }
  },
  
  // From App via contentScriptProxy
  onMessage: function(client, msg) {
    console.log("crx2app/crxEnd: onMessage ", msg);
    var target = this.chromeAdapters[msg.target];
    if (target) {
      // send on to chrome
      target.onRequest(client, msg.request);
    } else {
      // reply with error
      client.port.postMessage({source:'crx2app', error:'target \''+msg.target+'\' adapter has not been attached '});
    }
  },
  
  // Call exactly once.
  _bindListeners: function() {
    this.onRequest = this.onRequest.bind(this);
    this.onConnect = this.onConnect.bind(this);
  }
};

crxEnd._bindEventListeners();