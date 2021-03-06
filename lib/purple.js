// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*
 * This is a 'super-global' passed down to all of the contained iframes,
 * It should be loaded only by the top frame.
 * Purple: parse, re-run, breakpoint, loop environment.
 * Parts connector
 */ 

if (window.purple) { 
  console.error("purple.js loaded incorrectly  in "+window.location);
  console.trace();
}
window.purple = {};
 
window.purple = function purpleFrameworkEnclosure() {
 
  var Assembly = makeAssembly();
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
 
  thePurple.fixWI = function(obj) {
    if (obj && 'stack' in obj) {
      var stack = obj.stack;
      obj._stack = stack.split('\n');
    }
    return obj;
  }
 
  // To bootstrap, this call is in Assembly.js:  Assembly.addPartContainer(thePurple);  

  thePurple.name = 'purple';
  
  thePurple.p_id = 0; // global 'clock'
  
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
  
  
  // TODO place with Base.js
  thePurple.extend = function() {
    var obj = {};
    for (var i = 0; i < arguments.length; i++) {
      var rhs = arguments[i];
      var props = Object.keys(rhs);
      for (var j = 0; j < props.length; j++) {
        var prop = props[j];
        obj[prop] = rhs[prop];
      }
    }
    return obj;
  };
  
  thePurple.getPartByFeature = function(feature) {
    var destinationPart = null;
    thePurple.forEachPart(function findPart(part) {
      if (part.hasFeature(feature)) {
        destinationPart = part;
        return true;
      }
    });
    return destinationPart;
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
  
  Assembly.addPartContainer(thePurple, true);  
  
  return thePurple;
}();

console.log("thePurple is defined ", window.purple);