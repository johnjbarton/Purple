// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*
 * Purple: parse, re-run, breakpoint, loop environment.
 * Parts connector
 */ 
 
 window.purple = window.purple || {};
 
(function purpleFrameworkEnclosure() {
 
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  
  //-------------------------------------------------------------------------
  // Reporting functions that can later be optioned-off 
  thePurple.error = function() {
    console.error.apply(console, arguments);
  };
  thePurple.warn = function() {
    console.warn.apply(console, arguments);
  };
  thePurple.log = function() {
    console.log.apply(console, arguments);
  };
 
  // Parts implement these functions
  // If any method returns a truthy value, the remainder are not notified.
  thePurple.PurplePart = function PurplePart(name) {
    if (!name) {
      throw new Error("Attempt to create part without a name");
    }
    this.name = name;
  };
  
  thePurple.PurplePart.prototype = {
    getName: function() { 
      return this.name; 
    },
    // parts register during load. to get them to unregister we send them 'destroy'
    destroy: function(feature) {},
  };

  // To bootstrap, this call is in Assembly.js:  Assembly.addPartContainer(thePurple);  

  thePurple.name = 'purple';
  
  thePurple.preInitialize = [];   // system-level init
  thePurple.postDestroy = [];
  thePurple.initialize = function() {
    thePurple.preInitialize.forEach(function callEm(fnc) {
      fnc.apply(null, [thePurple]);
    });
  };
  
  thePurple.destroy = function() {
    thePurple.forEachPart(function forceUnregister(part) {
      thePurple.unregisterPart(part);
    });
    thePurple.postDestroy.forEach(function callEm(fnc) {
      fnc.apply(null, [thePurple]);
    });
  };
  
  function gcLoad(event) {
    if(event.target.location.toString() !== document.location.toString()) {
      return; // not our load
    }
    thePurple.initialize();
    window.removeEventListener('load', gcLoad, false);
  }
  window.addEventListener('load', gcLoad, false);

  function gcUnLoad() {
    thePurple.destroy();
    window.removeEventListener('unload', gcLoad, false);
  }
  window.addEventListener('unload', gcUnLoad, false);
  
}());