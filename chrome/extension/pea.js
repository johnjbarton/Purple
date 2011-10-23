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
}

function getOrigin(url) {
  var splits = url.split('/');
  var origin = splits.slice(0, 3).join('/');
  return origin;
}

function startMonitor(url, tabId, errback) {
  var clientOrigin = getOrigin(url);
  return MonitorChrome.connect(clientOrigin, tabId, errback);
}

function stopMonitor(errback) {
  MonitorChrome.disconnect(errback);
}
  
function appendPurple(url, onLoadCallBack) {
  var iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'thePurple');
  iframe.onload = onLoadCallBack;
  iframe.setAttribute('src', url);
  document.body.appendChild(iframe);
}

function getDebuggeeInfo() {
  // Our location is set by background.html, it appends info about our debuggee
  var myURL = window.location.toString();
  var debuggee = {
      contextMenuTabId: parseInt(window.location.hash.substr(1)),
      dogfood: window.location.search
  };
  console.log(window.location.toString()+' gives debuggeeInfo: ', debuggee);
  return debuggee;
}

function getDogfoodURL(debuggeeInfo) {
    var dogfood = debuggeeInfo.dogfood;
    if (dogfood) { 
	return localStorage.getItem('dogfoodURL');
    }
}

function promiseDebuggeeURL(debuggeeInfo) {
  if (debuggeeInfo.dogfood) {
      var dogfoodThisURL = window.location.toString().replace(debuggeeInfo.dogfood,'');
    console.log("dogfood this:"+dogfoodThisURL);
    return dogfoodThisURL;
  }

  var deferred = Q.defer();
  chrome.tabs.get(debuggeeInfo.contextMenuTabId, function(tabInfo) {
      deferred.resolve(tabInfo.url);
    });
  return deferred.promise;
}

function insureNumber(n) {
  return isFinite(n) ? n : null;
}

function promiseDebuggeeWindow(debuggeeInfo) {

  var createData = { url: 'about:blank', type: 'popup' };

  var width = parseInt(window.localStorage.getItem('windowWidth'));
  createData.width = insureNumber(width) || (Math.floor(window.screen.availWidth / 2) - 2);

  var height = parseInt(window.localStorage.getItem('windowHeight'));
  createData.height = insureNumber(height) || window.screen.availHeight;

  var left = parseInt(window.localStorage.getItem('windowLeft'));
  var defaultLeft = window.screen.availLeft;
  if (debuggeeInfo.dogfood) {
      defaultLeft = window.screen.availLeft + (window.screen.availWidth - createData.width);
  }
  createData.left = insureNumber(left) || defaultLeft;
  console.log("chrome.windows.create:", createData);
  var deferred = Q.defer();
  chrome.windows.create(createData, function(win) {
    deferred.resolve(win);
  });
  return deferred.promise;
};

function getPurpleURL () {
  var debuggeeInfo = getDebuggeeInfo();
  var dogfood = getDogfoodURL(debuggeeInfo);
  if (dogfood) {
      console.log("dogfood! "+dogfood);
    return dogfood;
  }

  var purpleURL = window.localStorage.getItem('messageClientURL');
  if(!purpleURL) {
    purpleURL = "http://localhost:8080/file/f/purple.html";
  }
  return purpleURL;
}

function promisePurpleReady(purpleURL) {
  var deferred = Q.defer();

  appendPurple(purpleURL, function onPurpleLoad(){
    deferred.resolve(purpleURL);
  });
  return deferred.promise;
}

function promiseUnloadOuterWindow() {
    var deferred = Q.defer();
    function handle(event) {
      deferred.resolve(event);
      window.removeEventListener('load', handle, false);
    }
    window.addEventListener('unload', handle, false);
    return deferred.promise;
}

function onOuterWindowLoad(event) {
  window.removeEventListener('load', onOuterWindowLoad, false);

  var debuggeeInfo = getDebuggeeInfo();

  // Open a blank window to hold the debuggee
  var win = promiseDebuggeeWindow(debuggeeInfo);

  // Get the URL for the debuggee site
  var debuggeeURL = promiseDebuggeeURL(debuggeeInfo);  

  var done = Q.join(debuggeeURL, win, function(debuggeeURL, win) {
    var debuggeeTabInfo = win.tabs[0];
  
    console.log("ready to load purple with debuggeeURL and win", debuggeeURL, win);
    console.log("starting monitor debuggee tab.id", debuggeeTabInfo.id);

    var purpleURL = getPurpleURL();
    // start the monitor and wait for purple to connect
    var monitor = startMonitor(purpleURL, debuggeeTabInfo.id, debuggerError);
 
    // load purple in our iframe and postMessage to monitor when set up
    var purple = promisePurpleReady(purpleURL);
  
    var purpleConnect = Q.join(monitor, purple, function(monitor, purple) {
      // we have a blank window, with debuggeeTabInfo.id being monitored. Load the page
      chrome.tabs.update(debuggeeTabInfo.id, {url: debuggeeURL});
      return (monitor && purple) ? 'Purple monitored' : 'FAIL';
    });

    var unloadOuterWindow = promiseUnloadOuterWindow();
    Q.when(unloadOuterWindow, function () {
      stopMonitor(debuggerError);
      chrome.tab.remove(debuggeeTabInfo.id);
      unloadOuterWindow.resolve('unload');
    });
   
    return purpleConnect;
  });
  
  Q.when(done, 
    function(done) {
      console.log("Status: "+done);
    }, 
    function() {
      if (arguments[0] instanceof Error) {
        var e = arguments[0];
        e._stack = e.stack && e.stack.split('\n');
        console.error("Purple ERROR: "+e, e);
      } else {
        console.error("Purple FAILED", arguments);
      }
    }
  );  
}

function hookWebNav() {
  var webNavEvents = ['onBeforeNavigate', 'onCommitted', 'onCompleted', 'onCreatedNavigationTarget', 'onDOMContentLoaded', 'onErrorOccurred', 'onReferenceFragmentUpdated'];
  webNavEvents.forEach(function hookOne(eventType) {
    chrome.webNavigation[eventType].addListener(function (details) {
      var last = window.lastWebNavTime || details.timeStamp;
      console.log(eventType+" "+details.url+" in "+details.tabId+" at "+details.timeStamp+" delta: "+(details.timeStamp-last));
      window.lastWebNavTime = last;
    });
  });
}

hookWebNav();

function onWindowUnload(event) {
  window.removeEventListener('unload', onWindowUnload, false);
  stopMonitor(debuggerError);
}

window.addEventListener('load', onOuterWindowLoad, false);

}());