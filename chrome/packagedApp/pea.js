// Purple Extension Adapter, part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function() {
  "use strict;"

var MonitorChrome = window.MonitorChrome;


var WebAppManager = (function () {

  var WebAppManager = {
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

  WebAppManager.debuggerError = function(error) {
    if (error) {
	  console.error(error);
	} else {
	  console.error("debuggerError with no chrome.extension.lastError");
	}
  };

  WebAppManager.registerWebApp = function(url, win) {
    WebAppManager.updateHistory(url);
    this.win = win;
    this.tabId = win.tabs[0].id;
    MonitorChrome.registerTab(this.tabId, WebAppManager.debuggerError);
  };

  WebAppManager.loadTargetApp = function(url) {
    // random int between purple and 2 * purple
    var targetID = Math.floor(WebAppManager.purpleTargetID * (Math.random() + 1.0) );
    var createData = {
      url: url,
      focused: false,
      type: 'normal',
    };
    chrome.windows.create(createData, function onCreated(win) {
      console.log("created window for web app "+url, win);
      WebAppManager.registerWebApp(url, win);
    });
  };
  
  // Call sync with 'load' event, but win may not be usable yet
  WebAppManager.setDevTool = function(url, win) {
    this.devToolURL = url;
    this.devToolWindow = win;
    var splits = url.split('/');
    var clientOrigin = splits.slice(0, 3).join('/');
    MonitorChrome.listenForClient(clientOrigin);
  };
  
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

function appendPurple(url) {
  var iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'thePurple');
  iframe.setAttribute('src', url);
  iframe.setAttribute('style', 'display: none;'); // don't show while loading
  document.body.appendChild(iframe);
  WebAppManager.setDevTool(url, iframe.contentWindow);
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
  appendPurple("http://orionhub.org/file/Fu/purple.html");
}

window.addEventListener('load', onWindowLoad, false);

}());