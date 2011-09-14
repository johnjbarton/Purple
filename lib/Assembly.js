// Assembly: infrastructure for dispatching events
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function(){

window.purple = window.purple || {};
var thePurple = window.purple;
var Assembly = thePurple.Assembly = {};
 
 function unGetterify(obj) {
    var un = {};
    var props = Object.keys(obj);
    props.forEach(function unOne(prop) {
      un[prop] = obj[prop];
    });
    return un;
  }
 
Assembly.addPartContainer = function(extendMe) {

  extendMe._partContainer = {
    parts: []
  };
 
  extendMe.registerPart = function(part) {
    if (part) {
	  this._partContainer.parts.push(part);   
	} else {
	  console.error("Assembly: register falsy part");
	}
  };

  extendMe.unregisterPart = function(part) {
    var index = this._partContainer.parts.indexOf(part);
    if (index === -1) {
      console.log("Assembly: unregisterPart called for part not regisitered", {extendMe: extendMe, part: part});
      return;
    }
    this._partContainer.parts.slice(index, 1);   
  };

  extendMe._dispatchToListeners = function(iterator, listeners, method, args) {
    if (!method) {
      console.error("Assembly: "+iterator+"Listeners with no method name");
      return;
    }
    args = args || [];
    var theUnheardOf = [];
    listeners[iterator](function oneDispatch(listener) {
      if (listener[method] && typeof (listener[method] === 'function') ) {
        try {
          return listener[method].apply(listener, args);
        } catch (exc) {
          console.error("Assembly: "+iterator+" Listeners "+method+" to listener threw "+exc, {listener: listener, stack: exc.stack});
        }
      } else {
        theUnheardOf.push(listener);
      }
    });
    if (theUnheardOf.length) {
      console.warn("Assembly: some listeners do not implement "+method, theUnheardOf);
    }
  };

  extendMe.someParts = function(method, args) {
    return extendMe._dispatchToListeners('some', extendMe._partContainer.parts, method, args);
  };

  extendMe.forEachPart = function(method, args) {
    return extendMe._dispatchToListeners('forEach', extendMe._partContainer.parts, method, args);
  };

};

}());