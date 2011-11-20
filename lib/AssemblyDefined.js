// Assembly: infrastructure for dispatching events
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


// This object is needed with and without requirejs

function makeAssembly() {

var Assembly = {};
 
Assembly.addPartContainer = function(extendMe, bootstrap) {

  extendMe._partContainer = {
    name: extendMe.name + ".parts",
    parts: [],
    partsByName: {},
    append: function(part) {
      if (this.partsByName.hasOwnProperty(part.name)) {
        console.error("Assembly: register part "+part.name+" twice");
        throw new Error("Assembly: register part "+part.name+" twice");
      }
      this.partsByName[part.name] = part;
      this.parts.push(part);
      // Notify all parts, including the one that just registered, of the new part
      extendMe.toEachPart('partAdded', [part]);
      if (part.partAdded) {
        // Notify the new part of all the existing parts
        extendMe.forEachPart(function toNewPart(existingPart) {
          part.partAdded(existingPart);
        });
      }
      if (this.toEachPart) {  
        // Notify the parts container listeners 
        this.toEachPart('partAdded', [part]);
      }
    },
    remove: function(part) {
      var index = this.parts.indexOf(part);
      if (index === -1) {
        console.warning("Assembly: unregisterPart called for part not regisitered", {extendMe: extendMe, part: part});
        return;
      }
      extendMe.toEachPart('partDeleted', [part]);
      if (this.toEachPart) {
        this.toEachPart('partDeleted', [part]);
      }
      this.parts.slice(index, 1);   
      delete this.partsByName[part.name];
    }
  };
  
  extendMe.registerPart = function(part) {
    if (part) {
      if (!part.name) {
        console.error("Assembly: registerPart requires part.name ", part);
      } else {
        this._partContainer.append(part);
      }
	} else {
	  console.error("Assembly: register falsy part");
	}
  };

  extendMe.unregisterPart = function(part) {
    this._partContainer.remove(part);
  };
  
  extendMe.getPartByName = function(name) {
    return this._partContainer.partsByName[name];
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
          var _stack = exc.stack ? exc.stack.split('\n') : "no stack";
          console.error("Assembly: "+iterator+" "+method+" to "+listener.name+" threw "+exc, {listener: listener, stack: _stack});
        }
      } else {
        theUnheardOf.push(listener);
      }
    });
    if (theUnheardOf.length) {
     // console.warn("Assembly: some listeners do not implement "+method, theUnheardOf);
    }
  };

  extendMe.toSomeParts = function(method, args) {
    return extendMe._dispatchToListeners('some', extendMe._partContainer.parts, method, args);
  };

  extendMe.toEachPart = function(method, args) {
    return extendMe._dispatchToListeners('forEach', extendMe._partContainer.parts, method, args);
  };

  extendMe.forEachPart = function(fnc) {
    extendMe._partContainer.parts.forEach(fnc); 
  };

  extendMe._registerPartsAsModel = function() {
  return;
     
  };

  if (!bootstrap) {  
    extendMe._registerPartsAsModel();
  }
};
  
  // -----------------------------------------------------------------------
  // This is completely independent of the part container stuff above.
  
  Assembly.addListenerContainer = function(extendMe) {
   
    extendMe._listeners = [];
   
    extendMe.addListener = function(fncOfEvent) {
      if (!fncOfEvent) {
        throw new Error("pass a function to addListener", extendMe);
      }
      var index = this._listeners.indexOf(fncOfEvent);
      if (index === -1) {
        this._listeners.push(fncOfEvent);
      }
    };
   
    extendMe.removeListener = function(fncOfEvent) {
      var index = this._listeners.indexOf(fncOfEvent);
      if (index !== -1) {
        this._listeners.slice(index, 1); 
      }
    };
   
    extendMe.getListeners = function() {
      return this._listeners;
    };
    
    extendMe.toEachListener = function(event) {
      var max = this._listeners.length;
      var args = event instanceof Array ? event : [event];
      for(var i = 0; i < max; i++) {
        this._listeners[i].apply(null, args);
      }
    };
  };
  
  return Assembly;

};
