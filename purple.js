// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*
 * Purple: parse, re-run, breakpoint, loop environment.
 * Parts connector
 */ 
 
 window.purple = window.purple || {};
 
(function purpleFrameworkEnclosure() {
 
  var thePurple = window.purple;
 
  // Parts implement these functions
  // If any method returns a truthy value, the remainder are not notified.
  thePurple.PurplePart = {
    // 1. allocate internal data structures
    initialize: function() {
      console.error("PurplePart must implement ");
    },
    // 2. add listeners to other Parts
    connect: function(thePurple) {
      console.error("PurplePart must implement ");
    },
    // end-1. remove listeners from other Parts
    disconnect: function(thePurple) {
      console.error("PurplePart must implement ");
    },
    // end: deallocate internals
    destroy: function() {
      console.error("PurplePart must implement ");
    },
    // ------------------------------------------
    // 3. respond to UI events
    onUserAction: function(action) {
      console.error("PurplePart must implement ");
    },
    // 4. respond to devtools events
    onDevToolEvent: function(event) {
      console.error("PurplePart must implement ");
    },
  };

  thePurple._container = {
    parts: [],
  };
 
  thePurple.registerPart = function(purplePart) {
    if (purplePart) {
	  this._container.parts.push(purplePart);   
	} else {
	  console.error("Purple: register falsy part");
	}
  }

  thePurple.unregisterPart = function(purplePart) {
    var index = this._container.parts.indexOf(purplePart);
    if (index === -1) {
      console.log("Purple: unregisterPart called for part not regisitered", {thePurple: thePurple, part: purplePart});
      return;
    }
    this._container.parts.slice(index, 1);   
  }

  thePurple.somePart = function(method, args) {
    if (!method) {
      console.error("Purple: dispatch with no method name");
      return;
    }
    args = args || [];
    var theUnheardOf = [];
    thePurple._container.parts.some(function oneDispatch(part) {
      if (method[part] && typeof (method[part] === 'function') ) {
        try {
          return part[method].apply(part, args);
        } catch (exc) {
          console.error("Purple: dispatch "+method+" to part threw "+exc, {part: part, exc: exc});
        }
      } else {
        theUnheardOf.push(part);
      }
    });
    if (theUnheardOf.length) {
      console.warning("Purple: somePart does not implement "+method, {part: part});
    }
  }

}());