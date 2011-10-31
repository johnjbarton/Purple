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

MonitorChrome.connect = function(iframeWindow, iframeURLOrigin, tabId, errback) {
  var deferred = Q.defer();
  function heardProxyClientHello(event) {
    // Someone has sent a message
      console.log("heardProxyClientHello "+((event.origin === iframeURLOrigin)?iframeURLOrigin:"not ours"), event);
      console.log("heardProxyClientHello iframeWindow===event.source "+(iframeWindow === event.source));
    if (event.origin === iframeURLOrigin) { // then the sender is our code
      window.removeEventListener('message', heardProxyClientHello, false);
  
      var splits = event.data.split(' ');
      var clientName = splits[0];
      var clientVersion = splits[1];  // later we check version numbers
      
      MonitorChrome.proxy = new ProxyPoster(event.source, event.origin);
      MonitorChrome.proxy.connect(event.data+" from "+document.title);
      MonitorChrome.registerProxy(clientName, clientVersion, MonitorChrome.proxy);
      MonitorChrome.componentConnect(deferred, MonitorChrome.proxy, tabId, errback);
    }
  }
  // Wait for the client to connect
  window.addEventListener('message', heardProxyClientHello, false);
  return deferred.promise;
};

MonitorChrome.registerProxy = function(name, version, proxy) {
  this.proxy = proxy;  // multiple proxies later?
  MonitorChrome.WebNavigation.hookWebNavigation(this.proxy);
  MonitorChrome.WebNavigation.connect();
}

MonitorChrome.componentConnect = function(deferred, proxy, tabId, debuggerErrorCallback) {
    MonitorChrome.WebNavigation.initialize(tabId);
    MonitorChrome.Debugger.initialize(proxy, tabId, debuggerErrorCallback);
    MonitorChrome.Debugger.connect(deferred);
};

MonitorChrome.disconnect = function(errback) {
  if (this.proxy) {
    MonitorChrome.Debugger.disconnect();
    this.proxy.disconnect();
  }  // else we never connected
};

//--------------------------------------------------------------------------------------
// ProxyChannel, the extension half of the channel, sender of chrome events
// http://dev.w3.org/html5/postmsg/ MessageChannel version
 

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

//--------------------------------------------------------------------------------------
// ProxyPoster, the extension half of the channel, sender of chrome events
// http://dev.w3.org/html5/postmsg/  postMessage() version
 

function ProxyPoster(win, origin) {
  this.otherWindow = win;
  this.targetOrigin = origin;
}

ProxyPoster.prototype = {
  connect: function(messageFromClient) {
    try {
      this.onmessage = this.recv.bind(this);
      window.addEventListener('message', this.onmessage, false);
      this.send(messageFromClient);
    } catch(exc) {
      console.error(exc);
    }
  },
  disconnect: function() {
    window.removeEventListener('message', this.onmessage, false);
  },
  send: function(data) {
    this.otherWindow.postMessage(data, this.targetOrigin);
  },
  recv: function(event) {
    console.log("ProxyPoster.recv ", event);
    var method = event.data.method;
    if (method) {  
      Debugger.send(event.data);  // hack
    }
  }
};
//---------------------------------------------------------------------------------------
// WebNavigation http://code.google.com/chrome/extensions/dev/experimental.webNavigation.html

var chromeWebNavigation = chrome.experimental.webNavigation || chrome.webNavigation;

var WebNavigation = MonitorChrome.WebNavigation = {
   events: Object.keys(chromeWebNavigation) // all for now
};

WebNavigation.initialize = function(tabId) {
  this.tabId = tabId;
};

WebNavigation.onEvent = function(proxy, name, details) {
  if (details.tabId === WebNavigation.tabId) {  // focus on the tab we are debugging
    proxy.send({source: "webNavigation", name: name, details: details});
  }
};

WebNavigation.hookWebNavigation = function(proxy) {
  this.events.forEach(function delegate(eventName) {
    WebNavigation[eventName] = WebNavigation.onEvent.bind(WebNavigation, proxy, eventName);
  });
};

WebNavigation.connect = function() {
  this.events.forEach(function addListeners(event) {
    if (event[0] === 'o' && event[1] === 'n') {
      chromeWebNavigation[event].addListener(WebNavigation[event].bind(WebNavigation));
    }
  });
};

//--------------------------------------------------------------------------------------
// Debugger http://code.google.com/chrome/extensions/experimental.debugger.html

var Debugger = MonitorChrome.Debugger = {};

Debugger.initialize = function(proxy, tabId, handleError){
  if(!proxy || !tabId || !handleError) {
    var error = new Error("MonitorChrome.Debugger missing argument ");
    console.log(error, arguments);
    throw error;
  }
  this.proxy = proxy;
  this.tabId = tabId; // eg from chrome.windows.create() callback
  this.reportError = function () {
    if(chrome.extension.lastError) {
      handleError(chrome.extension.lastError);
    } // else not an error
  };
};

Debugger.makeOnWasEnabled = function(deferred) {
  function oneShot(tabId, method, params) {
    if (tabId !== Debugger.tabId) {
     return;
    }
    if (method === 'Debugger.debuggerWasEnabled') {
      chrome.experimental.debugger.onEvent.removeListener(oneShot);
      deferred.resolve(method);
      console.log("MonitorChrome: Debugger.connect to tab "+tabId);
    } else {
      console.error("Debugger.onWasEnabled got unexpected method "+method, params);
    }
  }
  return oneShot;
}

Debugger.connect = function(deferred) {
  chrome.experimental.debugger.attach(this.tabId, this.reportError);
  chrome.experimental.debugger.onEvent.addListener(this.onEvent.bind(this));
  chrome.experimental.debugger.onEvent.addListener(this.makeOnWasEnabled(deferred));
};

Debugger.disconnect = function() {
  chrome.experimental.debugger.detach(this.tabId, this.reportError);
  console.log("MonitorChrome: Debugger.disconnect from tab "+this.tabId);
};

Debugger.onEvent = function(tabId, method, params) {
    //console.log("MonitorChrome: Debugger.onEvent "+method+" in tab "+tabId);
  this.proxy.send({source: "debugger", name: method, params: params}); 
};

Debugger.onDetach = function(tabId) {
  this.proxy.send({source: "debugger", name: "detach"}); 
};

// callback for sendRequest
Debugger.recv = function(result) {
  if (result) {
    this.proxy.send({source: "debugger", name: "response", result: result, request: this.request});
  } else {
    this.proxy.send({source: "debugger", name: "response", error: chrome.extension.lastError, request: this.request});
  }
  delete this.request; 
}

Debugger.send = function(data) {
  var method = data.method;
  var params = data.params;
  this.request = data;
  chrome.experimental.debugger.sendRequest(this.tabId, method, params, this.recv.bind(this));
};

}());