// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*
 * Purple: parse, re-run, breakpoint, loop environment.
 * Parts connector
 */ 
 
 window.purple = window.purple || {};
 
(function purpleFrameworkEnclosure() {
 
  var thePurple = window.purple;
  
  function unGetterify(obj) {
    var un = {};
    var props = Object.keys(obj);
    props.forEach(function unOne(prop) {
      un[prop] = obj[prop];
    });
    return un;
  }
  
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
    // 3. respond to UI events
    onUserAction: function(action) { },
    // 4. respond to devtools events
    onDevToolEvent: function(event) { },
  };

  thePurple._container = {
    parts: [],
  };
 
  thePurple.registerPart = function(purplePart) {
    if (purplePart) {
	  this._container.parts.push(purplePart);   
	} else {
	  thePurple.error("Purple: register falsy part");
	}
  };

  thePurple.unregisterPart = function(purplePart) {
    var index = this._container.parts.indexOf(purplePart);
    if (index === -1) {
      thePurple.log("Purple: unregisterPart called for part not regisitered", {thePurple: thePurple, part: purplePart});
      return;
    }
    this._container.parts.slice(index, 1);   
  };

  thePurple.someListeners = function(listeners, method, args) {
    if (!method) {
      thePurple.error("Purple: someListeners with no method name");
      return;
    }
    args = args || [];
    var theUnheardOf = [];
    listeners.some(function oneDispatch(listener) {
      if (listener[method] && typeof (listener[method] === 'function') ) {
        try {
          return listener[method].apply(listener, args);
        } catch (exc) {
          thePurple.error("Purple: someListeners "+method+" to listener threw "+exc, {listener: listener, exc: unGetterify(exc)});
        }
      } else {
        theUnheardOf.push(listener);
      }
    });
    if (theUnheardOf.length) {
      thePurple.warn("Purple: some listeners do not implement "+method, theUnheardOf);
    }
  };
  
  thePurple.someParts = function(method, args) {
    return thePurple.someListeners(thePurple._container.parts, method, args);
  };
  
  
  thePurple.preInitialize = [];   // system-level init
  thePurple.postDestroy = [];
  
  thePurple.initialize = function() {
    thePurple.preInitialize.forEach(function callEm(fnc) {
      fnc.apply(null, [thePurple]);
    });
    thePurple.someParts('initialize', [thePurple]);
    thePurple.someParts('connect', [thePurple]);
  };
  
  thePurple.destroy = function() {
    thePurple.someParts('disconnect', [thePurple]);
    thePurple.someParts('destroy', [thePurple]);
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