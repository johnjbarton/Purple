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

MonitorChrome.setPageAPI = function(api) {
    this.pageCommands = api;
}

MonitorChrome.connect = function(iframeURLOrigin, tabId) {
  function heardProxyClientHello(event) {
    // Someone has sent a message
    console.log("heardProxyClientHello "+((event.origin === iframeURLOrigin)?iframeURLOrigin:"not ours"), event);

    if (event.origin === iframeURLOrigin) { // then the sender is our code
      window.removeEventListener('message', heardProxyClientHello, false);
  
      var splits = event.data.split(' ');
      var clientName = splits[0];
      var clientVersion = splits[1];  // later we check version numbers
      
      MonitorChrome.proxy = new ProxyPoster(event.source, event.origin);
      MonitorChrome.Debugger.initialize(MonitorChrome.proxy, tabId);

      // We cannot connect to the iframe web app until after Debugger.attach()
      MonitorChrome.Debugger.promiseAttached(
        function completeConnection(debuggerAttached) {
          console.log("completeConnection");
          // eventually the iframe web app will call for the page load
          MonitorChrome.proxy.connect(event.data+" from "+document.title);
          MonitorChrome.WebNavigation.initialize(tabId);
          MonitorChrome.registerProxy(clientName, clientVersion, MonitorChrome.proxy);
        });
    }
  }
  // Wait for the client to connect
  console.log("MonitorChrome.connect waiting for heardProxyClientHello on "+window.location);
  window.addEventListener('message', heardProxyClientHello, false);
};

MonitorChrome.registerProxy = function(name, version, proxy) {
  this.proxy = proxy;  // multiple proxies later?
  MonitorChrome.WebNavigation.hookWebNavigation(this.proxy);
  MonitorChrome.WebNavigation.connect();
}

MonitorChrome.recv = function(data) {
  // these functions will control the debuggee
  var op = data.command;
  if (MonitorChrome.pageCommands.hasOwnProperty(op)) {
    MonitorChrome.pageCommands[op].apply(MonitorChrome, [data]);
  } else {
    console.error("MonitorChrome recv not a pageCommand", data);
  }
}

MonitorChrome.disconnect = function() {
  if (this.proxy) {
    MonitorChrome.Debugger.disconnect();
    this.proxy.disconnect();
  }  // else we never connected
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
      // this send will cause purple to enable debugging
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
    var method = event.data.method;
    if (method) {  
      console.log("ProxyPoster.recv "+method, event);
      Debugger.send(event.data);  // hack
    } else { // A message for Monitor
      MonitorChrome.recv(event.data);
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

Debugger.initialize = function(proxy, tabId){
  if(!proxy || !tabId) {
    var error = new Error("MonitorChrome.Debugger missing argument ");
    console.log(error, arguments);
    throw error;
  }
  this.proxy = proxy;
  this.tabId = tabId; // eg from chrome.windows.create() callback
  this.reportError = function () {
    if(chrome.extension.lastError) {
    console.error("MonitorChrome.Debugger ERROR", chrome.extension.lastError);
    } // else not an error
  };
};

Debugger.promiseAttached = function(callback) {
  var onEvent = Debugger.onEvent.bind(Debugger);
  chrome.experimental.debugger.onEvent.addListener(onEvent);

  chrome.experimental.debugger.attach({tabId: this.tabId}, '0.1', function onAttach() {
    if (chrome.extension.lastError) {
      console.error("Debugger.attach FAILS", chrome.extension.lastError);
    } else {
      console.log("MonitorChrome: Debugger.connect attached to tab "+Debugger.tabId);
      callback();
    }
  });
};

Debugger.disconnect = function() {
    chrome.experimental.debugger.detach({tabId: this.tabId}, this.reportError);
  console.log("MonitorChrome: Debugger.disconnect from tab "+this.tabId);
};

Debugger.onEvent = function(debuggee, method, params) {
    // too many events      console.log("MonitorChrome: Debugger.onEvent "+method+" in tab "+debuggee.tabId+" vs this.tabId:"+this.tabId, params);
  if (debuggee.tabId === this.tabId) {
    this.proxy.send({source: "debugger", name: method, params: params}); 
  }
};

Debugger.onDetach = function(tabId) {
  this.proxy.send({source: "debugger", name: "detach"}); 
};

// callback for sendRequest, from Chrome to Monitor
Debugger.recv = function(request, result) {
  // Forward to iframe web app
  if (! chrome.extension.lastError) {
    console.log("Debugger.recv "+request.p_id, {result: result, request: request});
    this.proxy.send({source: "debugger", name: "response", result: result, request: request});
  } else {
    console.log("Debugger.recv "+request.p_id+": "+ chrome.extension.lastError.message , {result: result, request: request});
    this.proxy.send({source: "debugger", name: "response", error: chrome.extension.lastError, request: request});
  }
}

// From Monitor to Chrome
Debugger.send = function(data) {
  var method = data.method;
  var params = data.params;
  // change the number so we know if the reload worked
  console.log("6) Debugger.send "+method+" to "+ this.tabId, data);
  chrome.experimental.debugger.sendCommand({tabId: this.tabId}, method, params, Debugger.recv.bind(Debugger, data));
};

}());