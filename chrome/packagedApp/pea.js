// Purple Extension Adapter, part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

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
  return WebAppManager;
}());

function loadWebApp(event) {
  var urlInput = document.getElementById('webAppURL');
  var url = urlInput.value;
  WebAppManager.loadTargetApp(url);
  turnOnPurple();
  return false;
}

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
}

function onWindowLoad(event) {
  window.removeEventListener('load', onWindowLoad, false);
  wireButton();
  appendPurple();
}

window.addEventListener('load', onWindowLoad, false);

