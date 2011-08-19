// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*
 * Purple: parse, re-run, breakpoint, loop environment.
 * Parts connector
 */ 
 
 window.purple = window.purple || {};
 
(function purpleFrameworkEnclosure() {
 
  var thePurple = window.purple;
  
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
  thePurple.PurplePart = {
    // 1. allocate internal data structures
    initialize: function() {
      thePurple.error("PurplePart must implement ");
    },
    // 2. add listeners to other Parts
    connect: function(thePurple) {
      thePurple.error("PurplePart must implement ");
    },
    // end-1. remove listeners from other Parts
    disconnect: function(thePurple) {
      thePurple.error("PurplePart must implement ");
    },
    // end: deallocate internals
    destroy: function() {
      thePurple.error("PurplePart must implement ");
    },
    // ------------------------------------------
    // 3. respond to UI events
    onUserAction: function(action) {
      thePurple.error("PurplePart must implement ");
    },
    // 4. respond to devtools events
    onDevToolEvent: function(event) {
      thePurple.error("PurplePart must implement ");
    },
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

  thePurple.someParts = function(method, args) {
    if (!method) {
      thePurple.error("Purple: dispatch with no method name");
      return;
    }
    args = args || [];
    var theUnheardOf = [];
    thePurple._container.parts.some(function oneDispatch(part) {
      if (part[method] && typeof (part[method] === 'function') ) {
        try {
          return part[method].apply(part, args);
        } catch (exc) {
          thePurple.error("Purple: dispatch "+method+" to part threw "+exc, {part: part, exc: exc});
        }
      } else {
        theUnheardOf.push(part);
      }
    });
    if (theUnheardOf.length) {
      thePurple.warn("Purple: some parts do not implement "+method, theUnheardOf);
    }
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