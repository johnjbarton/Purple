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
  return MonitorChrome.connect(clientOrigin, tabId, errback);
};

function stopMonitor(errback) {
  MonitorChrome.disconnect(errback);
};
  
function appendPurple(url, onLoadCallBack) {
  var iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'thePurple');
  iframe.onload = onLoadCallBack;
  iframe.setAttribute('src', url);
  document.body.appendChild(iframe);
}

function getContextMenuOwnerTabId() {
  // Our URL is set by background.html, it appends the tabId that we will debug
  var myURL = window.location.toString();
  var tabId = parseInt(myURL.split('#')[1]);
  return tabId;
}

function promiseTabInfo() {
  MonitorChrome.originalTabId = getContextMenuOwnerTabId();
  var deferred = Q.defer();
  chrome.tabs.get(MonitorChrome.originalTabId, function(tabInfo) {
      deferred.resolve(tabInfo);
    });
  return deferred.promise;
}

function insureNumber(n) {
  return isFinite(n) ? n : null;
}

function promiseDebuggeeWindow() {

    var createData = { url: 'about:blank', type: 'popup' };

   var width = parseInt(window.localStorage.getItem('windowWidth'));
   createData.width = insureNumber(width) || (Math.floor(window.screen.availWidth / 2) - 2);

   var height = parseInt(window.localStorage.getItem('windowHeight'));
   createData.height = insureNumber(height) || window.screen.availHeight;

   var left = parseInt(window.localStorage.getItem('windowLeft'));
   createData.left = insureNumber(left) || window.screen.availLeft;
   console.log("chrome.windows.create:", createData);
   var deferred = Q.defer();
   chrome.windows.create(createData, function(win) {
     deferred.resolve(win);
   });
   return deferred.promise;
};

function getPurpleURL () {
  purpleURL = localStorage['messageClientURL'];
  if(!purpleURL)
    purpleURL = "http://localhost:8080/file/f/purple.html";
  return purpleURL;
}

function onOuterWindowLoad(event) {
  window.removeEventListener('load', onOuterWindowLoad, false);
 
  var win = promiseDebuggeeWindow(tabInfo);
  var tabInfo = promiseTabInfo();  
  var done = Q.join(tabInfo, win, function(tabInfo, win) {
      var debuggeeTabInfo = win.tabs[0];
      console.log("ready to load purple with tabInfo and win", tabInfo, win);
      console.log("starting monitor debugee tab.id", debuggeeTabInfo.id);

      var purpleURL = getPurpleURL();
      // start the monitor and wait for purple to connect
      var monitorReady = startMonitor(purpleURL, debuggeeTabInfo.id, debuggerError);
      // load purple in the iframe and call back to monitor when set up
      var purpleReady = promisePurpleReady(purpleURL);
      var done = Q.join(monitorReady, purpleReady, function(monitorReady, purpleReady) {
	      console.log("monitorReady: %o", monitorReady);
              console.log("purpleReady %o", purpleReady);
     	// we have a blank window, with debuggeeTabInfo.id being monitored. Load the page
	      window.alert('ready to update');
        chrome.tabs.update(debuggeeTabInfo.id, {url: tabInfo.url});
        return (monitorReady && purpleReady) ? 'Purple ready' : 'FAIL';
      });

      var unloadOuterWindow = promiseUnloadOuterWindow();
      Q.when(unloadOuterWindow, function () {
        stopMonitor(debuggerError);
        chrome.tab.remove(debugeeTabInfo.id);
      });
      return done;
    });
  Q.when(done, function(done) {
    console.log("Status: "+done);
      }, function() {
          if (arguments[0] instanceof Error) {
              var e = arguments[0];
              e._stack = e.stack && e.stack.split('\n');
	      console.error("Purple ERROR: "+e, e);
	  } else {
            console.error("Purple FAILED", arguments);
          }
      });  
}

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
	console.log("onBeforeNavigate "+details.url+" in "+details.tabId+" at "+details.timeStamp);
    });

function promisePurpleReady() {
  var deferred = Q.defer();

  appendPurple(purpleURL, function onPurpleLoad(){
	  deferred.resolve(purpleURL);
  });
  return deferred.promise;
}

function onWindowUnload(event) {
  window.removeEventListener('unload', onWindowUnload, false);
  stopMonitor(debuggerError);
}

window.addEventListener('load', onOuterWindowLoad, false);

function promiseUnloadOuterWindow() {
    var deferred = Q.defer();
    function handle(event) {
      deferred.resolve(event);
      window.removeEventListener('load', handle, false);
    }
    window.addEventListener('unload', handle, false);
    return deferred.promise;
}

}());