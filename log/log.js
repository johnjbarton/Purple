// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals getChromeExtensionPipe window console Q require document */

function failConnection(err) {
    console.err("Error "+err, err);
}

window.debugChromeDebuggerRemote = true;

function initialize() {

// dynamically load the debugger code
   require({
      paths: {
        "crx2app": "../lib/crx2app/extension",
        "browser/remote": "../lib/crx2app/extension/rpc",
        'log': "../log",
        'resources': "../resources",
        'lib': "../lib",
        'MetaObject': "../lib/MetaObject"
      }
    }); 

   require.onError = function(err) {
     console.error(err+"", {stack: err.stack.split('\n')});
   };

   require(['crx2app/appEnd/connection', 'ChromeLogAssembly', 'DebuggerLogAssembly', 'crx2app/rpc/ChromeProxy', 'MetaObject/q/q', 'MetaObject/urlUtils'], 
   function (               connection,   ChromeLogAssembly,   DebuggerLogAssembly,               ChromeProxy,                Q,              urlUtils) {
   
     connection.attach(function onConnectedToChrome() {

       var globalClock = {p_id: 0};
       
       ChromeLogAssembly.initialize(globalClock);
       var viewport = ChromeLogAssembly.connect();
     
       // wrap the connection in rpc stuff for chrome.* api
       var chromeProxy = ChromeProxy.new(connection, ChromeLogAssembly.eventHandlers);
     
       var urlParams = urlUtils.extractParametersFromWindow();

       var debuggerProxy;
     
       if (urlParams.tabId) {
         var tabId = parseInt(urlParams.tabId, 10);
         if (tabId && !isNaN(tabId)) {
           DebuggerLogAssembly.initialize(globalClock);
           DebuggerLogAssembly.connect(viewport);
          
           // wrap the connection in more rpc stuff for remote debug protocol through chrome.debugger,
           // and attach to a new tab, enable debugging and update the page to the given URL.
           var pre = DebuggerLogAssembly.onPreAttach.bind(DebuggerLogAssembly);
           var post = DebuggerLogAssembly.onPostAttach.bind(DebuggerLogAssembly);
           debuggerProxy = chromeProxy.openDebuggerProxyOnTab(tabId, pre, post);
         } else {
           window.alert("Not a valid tabId: "+urlParams.tabId);
         }
       } else if (urlParams.url) {
         debuggerProxy = chromeProxy.openDebuggerProxy(urlParams.url, DebuggerLogAssembly.eventHandlers);
       } else {
         window.alert("This application requires ?tabId=<number> or ?url=<string> in the url");
       }
       // when we are attached to the given page, show the log
       Q.when(debuggerProxy, function(debuggerProxy) {
         console.log("debuggerProxy ready");
         DebuggerLogAssembly.showAll();
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



