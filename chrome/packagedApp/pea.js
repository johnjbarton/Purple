// Purple Extension Adapter, part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function() {
  "use strict;"

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
    console.log("Calling windows.create for "+url, createData);
    chrome.windows.create(createData, function onCreated(win) {
      console.log("created window for web app "+url, win);
      WebAppManager.updateHistory(url);
    });
    console.log("Called windows.create for "+url, createData);
  };
  
  // Call sync with 'load' event, but win may not be usable yet
  WebAppManager.setDevTool = function(win) {
    this.devToolWindow = win;
    win.document.addEventListener('load', WebAppManager.onDevToolLoad, false);
  };
  
  WebAppManager.onDevToolLoad = function() {
//    win.removeEventListener('load', WebAppManager.onDevToolLoad, false);
console.log("onDevToolLoad", arguments);
    WebAppManager.startProxy();
  }
  
  WebAppManager.startProxy = function() {
    this.proxy = new MessageProxy(this.devToolWindow);
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
window.onDevToolLoad = WebAppManager.onDevTooLoad;
function appendPurple() {
  var iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'thePurple');
  iframe.setAttribute('src', "http://orionhub.org/file/Fu/purple.html");
  iframe.setAttribute('style', 'display: none;'); // don't show while loading
  iframe.setAttribute('onload', 'window.onDevToolLoad();'); // JavaScript
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

function MessageProxy(win) {
  this.otherWindow = win;
  this.targetOrigin = win.location.toString();
  this.channel = new MessageChannel();
  this.channel.port1.onmessage = this.onMessage;
  this.otherWindow.postMessage('hello', this.targetOrigin, [this.channel.port2]);
}

MessageProxy.prototype = {
  post: function(data) {
    this.otherWindow.postMessage(data);
  },
  tsop: function(event) {
    console.log("MessageProxy.tsop ", event);
  }
};

}());