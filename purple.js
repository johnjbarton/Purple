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
  thePurple.PurplePart = function PurplePart() {};
  thePurple.PurplePart.prototype = {
    // 1. allocate internal data structures
    initialize: function() { },
    // 2. add listeners to other Parts
    connect: function(thePurple) { },
    // end-1. remove listeners from other Parts
    disconnect: function(thePurple) { },
    // end: deallocate internals
    destroy: function() { },
    // ------------------------------------------
    // 3. Respond to new Features
    featureImplemented: function(feature) {},
    featureUnimplemented: function(feature) {},
  };

  Assembly.addPartContainer(thePurple);  
  
  thePurple.preInitialize = [];   // system-level init
  thePurple.postDestroy = [];
  
  thePurple.initialize = function() {
    thePurple.preInitialize.forEach(function callEm(fnc) {
      fnc.apply(null, [thePurple]);
    });
    thePurple.forEachPart('initialize', [thePurple]);
    thePurple.forEachPart('connect', [thePurple]);
  };
  
  thePurple.destroy = function() {
    thePurple.forEachPart('disconnect', [thePurple]);
    thePurple.forEachPart('destroy', [thePurple]);
    thePurple.postDestroy.forEach(function callEm(fnc) {
      fnc.apply(null, [thePurple]);
    });
  };
  
  function gcLoad() {
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