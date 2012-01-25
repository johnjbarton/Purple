// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals getChromeExtensionPipe window console Q require document */

function failConnection(err) {
    console.err("Error "+err, err);
}

function initialize() {

// dynamically load the debugger code
   require({
      paths: {
        "crx2app": "../lib/crx2app/extension",
        "browser/remote": "../lib/crx2app/extension/rpc"
      }
    }); 

   require.onError = function(err) {
     console.error(err+"", {stack: err.stack.split('\n')});
   };

   require(['crx2app/appEnd/connection', 'LogAssembly', 'crx2app/rpc/ChromeProxy', '../lib/q/q'], 
   function (               connection,   LogAssembly,               ChromeProxy,            Q) {
   
     connection.attach(function onConnectedToChrome() {
       // wrap the connection in rpc stuff for chrome.* api
       var chromeProxy = ChromeProxy.new(connection, LogAssembly.eventHandlers);
     
       // wrap the connection in more rpc stuff for remote debug protocol through chrome.debugger,
       // and attach to a new tab, enable debugging and update the page to the given URL.
       var testURL = window.location.toString();
       var debuggerProxy = chromeProxy.openDebuggerProxy(testURL, LogAssembly.eventHandlers);
     
       // when we are attached to the given page, test it.
       Q.when(debuggerProxy, function(debuggerProxy) {
         console.log("debuggerProxy ready");
       }, failConnection).end();
     
       function detach() {
         connection.detach();
       }

       window.addEventListener('unload', detach, false);
   });
  });
}

function onLoad() {
  // clean up
  window.removeEventListener('load', onLoad, false);
  
  // connect to the chromeIframe
  initialize();
}

window.addEventListener('load', onLoad, false);



