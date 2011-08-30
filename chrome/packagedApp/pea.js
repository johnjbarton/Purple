// Purple Extension Adapter, part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function() {
  "use strict;"

var MonitorChrome = window.MonitorChrome;


var WebAppManager = (function () {

  var WebAppManager = {
    purpleTargetID: 6565259,
  };

  WebAppManager.getHistoryOfURLs = function() {
    var history = []; 
    var nURLs = window.localStorage.length;
    for (var i = 0; i < nURLs; i++) {
      history.push(window.localStorage.key(i));
    }
    return history;
  };

  WebAppManager.updateHistory = function(url) {
    window.localStorage.setItem(url, "");
  };

  WebAppManager.loadTargetApp = function(url) {
    // random int between purple and 2 * purple
    var targetID = Math.floor(WebAppManager.purpleTargetID * (Math.random() + 1.0) );
    var createData = {
      url: url,
//      tabId: WebAppManager.purpleTargetID, 
      focused: false,
      type: 'normal',
    };
    chrome.windows.create(createData, function onCreated(win) {
      console.log("created window for web app "+url, win);
      WebAppManager.updateHistory(url);
    });
  };
  
  // Call sync with 'load' event, but win may not be usable yet
  WebAppManager.setDevTool = function(win) {
    this.devToolWindow = win;
  };
  
  WebAppManager.registerProxy = function(proxy) {
    this.proxy = proxy;  // multiple proxies later?
    MonitorChrome.WebNavigation.hookWebNavigation(this.proxy);
    MonitorChrome.WebNavigation.connect();
  }
  
  return WebAppManager;
}());


function turnOnPurple() {
  var intro = document.getElementById('intro');
  intro.style.display = 'none';
  var thePurple = document.getElementById('thePurple');
  thePurple.style.display = 'block';
}

function wireButton() {
  var button = document.getElementById('loadWebApp');
  button.addEventListener('click', loadWebApp, true);
  var history = WebAppManager.getHistoryOfURLs();
  if (history.length) {
    var urlInput = document.getElementById('webAppURL');
    urlInput.value = history[history.length - 1];
  }
}


function appendPurple() {
  var iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'thePurple');
  iframe.setAttribute('src', "http://orionhub.org/file/Fu/purple.html");
  iframe.setAttribute('style', 'display: none;'); // don't show while loading
  document.body.appendChild(iframe);
  WebAppManager.setDevTool(iframe.contentWindow);
}

function loadWebApp(event) {
  var urlInput = document.getElementById('webAppURL');
  var url = urlInput.value;
  WebAppManager.loadTargetApp(url);
  turnOnPurple();
  return false;
}

function onWindowLoad(event) {
  window.removeEventListener('load', onWindowLoad, false);
  wireButton();
  appendPurple();
}

window.addEventListener('load', onWindowLoad, false);

//--------------------------------------------------------------------------------------
// MessageProxy 
// thePurple in an iframe sends 'IAmPurple' on load

function MessageProxy(win, origin) {
  this.otherWindow = win;
  this.targetOrigin = origin;
}

MessageProxy.prototype = {
  connect: function(messageFromClient) {
    this.channel = new MessageChannel();
    this.channel.port1.onmessage = this.recv.bind(this);
    this.otherWindow.postMessage('heardProxyClientHello', "*");
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
    console.log("MessageProxy.recv ", event);
  }
};

function heardProxyClientHello(event) {
  console.log("heardProxyClientHello", arguments);
  if (event.data.indexOf('IAmPurple') === 0) {  // later we append version numbers
    window.removeEventListener('message', heardProxyClientHello, false);
    var proxy = new MessageProxy(event.source, event.origin);
    WebAppManager.registerProxy(proxy);  
    proxy.connect(event.data);
  }
}

function listenForPurple() {
  window.addEventListener('message', heardProxyClientHello, false);
}

listenForPurple();



}());