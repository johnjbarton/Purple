// Purple Extension MonitorChrome, send chrome events over postMessage to web based dev tool
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function () {

//-----------------------------------------------------------------------------------
// MonitorChrome, container to start/stop all event listners and connection to client 

window.MonitorChrome = window.MonitorChrome || {};
var MonitorChrome = window.MonitorChrome;

MonitorChrome.connect = function(clientOrigin, tabId, errback) {
  function heardProxyClientHello(event) {
    // Someone has sent a message
    console.log("heardProxyClientHello", arguments);
    if (event.origin === clientOrigin) { // then the sender is our code
      window.removeEventListener('message', heardProxyClientHello, false);
  
      var splits = event.data.split(' ');
      var clientName = splits[0];
      var clientVersion = splits[1];  // later we check version numbers
      
      // send back a channel connector
      MonitorChrome.proxy = new ProxyChannel(event.source, event.origin);
      MonitorChrome.proxy.connect(event.data);
      MonitorChrome.registerProxy(clientName, clientVersion, MonitorChrome.proxy);
      MonitorChrome.registerTab(MonitorChrome.proxy, tabId, errback);
    }
  }
  // Wait for the client to connect
  window.addEventListener('message', heardProxyClientHello, false);
};

MonitorChrome.registerProxy = function(name, version, proxy) {
  this.proxy = proxy;  // multiple proxies later?
  MonitorChrome.WebNavigation.hookWebNavigation(this.proxy);
  MonitorChrome.WebNavigation.connect();
}

MonitorChrome.registerTab = function(proxy, tabId, debuggerErrorCallback) {
    MonitorChrome.Debugger.initialize(proxy, tabId, debuggerErrorCallback);
    MonitorChrome.Debugger.connect();
};

MonitorChrome.disconnect = function(errback) {
  MonitorChrome.Debugger.disconnect();
  this.proxy.disconnect();
};

//--------------------------------------------------------------------------------------
// ProxyChannel, the extension half of the channel, sender of chrome events
// http://dev.w3.org/html5/postmsg/
 

function ProxyChannel(win, origin) {
  this.otherWindow = win;
  this.targetOrigin = origin;
}

ProxyChannel.prototype = {
  connect: function(messageFromClient) {
    this.channel = new MessageChannel();
    this.channel.port1.onmessage = this.recv.bind(this);
    try {
      this.otherWindow.postMessage(messageFromClient, [this.channel.port2], this.targetOrigin);
    } catch(exc) {
      console.error(exc);
    }
  },
  disconnect: function() {
    this.channel.port1.close();
  },
  send: function(data) {
    this.channel.port1.postMessage(data);
  },
  recv: function(event) {
    console.log("ProxyChannel.recv ", event);
  }
};

//---------------------------------------------------------------------------------------
// WebNavigation http://code.google.com/chrome/extensions/dev/experimental.webNavigation.html


var WebNavigation = MonitorChrome.WebNavigation = {
   events: Object.keys(chrome.experimental.webNavigation) // all for now
};

WebNavigation.onEvent = function(proxy, name, details) {
  proxy.send({source: "webNavigation", name: name, details: details});
};

WebNavigation.hookWebNavigation = function(proxy) {
  this.events.forEach(function delegate(eventName) {
    WebNavigation[eventName] = WebNavigation.onEvent.bind(WebNavigation, proxy, eventName);
  });
};

WebNavigation.connect = function() {
  this.events.forEach(function addListeners(event) {
    if (event[0] === 'o' && event[1] === 'n') {
      chrome.experimental.webNavigation[event].addListener(WebNavigation[event].bind(WebNavigation));
    }
  });
};

//--------------------------------------------------------------------------------------
// Debugger http://code.google.com/chrome/extensions/experimental.debugger.html

var Debugger = MonitorChrome.Debugger = {};

Debugger.initialize = function(proxy, tabId, handleError){
  this.proxy = proxy;
  this.tabId = tabId; // eg from chrome.windows.create() callback
  this.reportError = function () {
    if(chrome.extension.lastError) {
      handleError(chrome.extension.lastError);
    } // else not an error
  };
};

Debugger.connect = function() {
  chrome.experimental.debugger.attach(this.tabId, this.reportError);
  chrome.experimental.debugger.onEvent.addListener(this.onEvent.bind(this));
  console.log("Debugger.connect to tab "+this.tabId);
};

Debugger.disconnect = function() {
  chrome.experimental.debugger.detach(this.tabId, this.reportError);
  console.log("Debugger.disconnect from tab "+this.tabId);
};

Debugger.onEvent = function(tabId, method, params) {
  console.log("Debugger.onEvent "+method);
  this.proxy.send({source: "debugger", name: method, params: params}); 
};

Debugger.onDetach = function(tabId) {
  this.proxy.send({source: "debugger", name: "detach"}); 
};

}());