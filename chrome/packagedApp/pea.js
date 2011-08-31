// Purple Extension Adapter, part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function() {
  "use strict;"

var MonitorChrome = window.MonitorChrome;

 
function debuggerError(error) {
    if (error) {
	  console.error(error.message, error);
	} else {
	  console.error("debuggerError with no chrome.extension.lastError");
	}
  };

function getOrigin(url) {
    var splits = url.split('/');
    var origin = splits.slice(0, 3).join('/');
    return origin;
}

function startMonitor(url, tabId, errback) {
  var clientOrigin = getOrigin(url);
  MonitorChrome.listenForClient(clientOrigin, tabId, errback);
};
  
function appendPurple(url) {
  var iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'thePurple');
  iframe.setAttribute('src', url);
  document.body.appendChild(iframe);
}

function onWindowLoad(event) {
  window.removeEventListener('load', onWindowLoad, false);
  // Our URL is set by background.html, it appends the tabId that we will debug
  var myURL = window.location.toString();
  var tabId = parseInt(myURL.split('#')[1]);
  var purpleURL = "http://orionhub.org/file/Fu/purple.html";
  startMonitor(purpleURL, tabId, debuggerError);
  appendPurple(purpleURL);
}

window.addEventListener('load', onWindowLoad, false);

}());