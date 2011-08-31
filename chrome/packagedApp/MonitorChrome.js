// Purple Extension MonitorChrome, send chrome events over postMessage to web based dev tool
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function () {

window.MonitorChrome = window.MonitorChrome || {};
var MonitorChrome = window.MonitorChrome;

MonitorChrome.listenForClient = function(clientOrigin) {
  function heardProxyClientHello(event) {
    // Someone has sent a message
    console.log("heardProxyClientHello", arguments);
    if (event.origin === clientOrigin) { // then the sender is our code
      var splits = event.data.split(' ');
      var clientName = splits[0];
      var clientVersion = splits[1];  // later we check version numbers
      window.removeEventListener('message', heardProxyClientHello, false);
      // send back a channel connector
      var proxy = new ProxyChannel(event.source, event.origin);
      proxy.connect(event.data);
      MonitorChrome.registerProxy(clientName, clientVersion, proxy);  
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

//--------------------------------------------------------------------------------------
// ProxyChannel, the extension half of the channel, sender of chrome events
 

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
  send: function(data) {
    this.channel.port1.postMessage(data);
  },
  recv: function(event) {
    console.log("ProxyChannel.recv ", event);
  }
};

//---------------------------------------------------------------------------------------

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

var Debugger = MonitorChrome.Debugger = function(proxy, tabId, handleError){
  this.proxy = proxy;
  this.tabId = tabId; // eg from chrome.windows.create() callback
  this.reportError = function () {
    if(chrome.extension.lastError) {
      handleError(chrome.extension.lastError);
    } // else not an error
  };
};

Debugger.prototype.connect = function() {
  chrome.experimental.debugger.attach(this.tabId, this.reportError);
  chrome.experimental.debugger.onEvent.addListener(this.onEvent.bind(this));
};

Debugger.prototype.disconnect = function() {
  chrome.experimental.debugger.detach(this.tabId, this.reportError);
};

Debugger.prototype.onEvent = function(tabId, method, params) {
  this.proxy.send({source: "debugger", name: method, params: params}); 
};

Debugger.prototype.onDetach = function(tabId) {
  this.proxy.send({source: "debugger", name: "detach"}); 
};

}());