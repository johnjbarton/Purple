// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define console */

define(['log/ChromeLog', 'log/EventLogViewport', 'resources/Resources', 'MetaObject/q/q'], 
function(    chromeLog,               viewport,             resources,                Q) {

  'use strict';
  
  var ChromeLogAssembly = {
    eventHandlers: {
      windows: {},  // TODO handlers post to chromeLog
      tabs: {},
      'debugger': {}
    }
  };
  
  ChromeLogAssembly.initialize = function (clock){
    chromeLog.initialize(clock);
    viewport.initialize(clock);
  };
  
  ChromeLogAssembly.connect = function() {
    // Attach the output of the JSON pipe from the browser to the input of the message buffer
    chromeLog.connect(viewport);
    
    // connect the output of the chromeLog to the input of the viewport
    viewport.connect(chromeLog);
    
    return viewport;
  };
  
  ChromeLogAssembly.disconnect = function() {
    chromeLog.disconnect(this.channel);
    viewport.disconnect(chromeLog);
  };
  
  ChromeLogAssembly.destroy = function() {
    viewport.destroy();
    chromeLog.destroy();
  };

  
  return ChromeLogAssembly;
});