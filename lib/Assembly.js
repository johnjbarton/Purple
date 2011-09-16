// Assembly: infrastructure for dispatching events
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function(){

window.purple = window.purple || {};
var thePurple = window.purple;
var Assembly = thePurple.Assembly = {};
 
Assembly.addPartContainer = function(extendMe, bootstrap) {

  extendMe._partContainer = {
    name: extendMe.name + ".parts",
    parts: [],
    partsByName: {},
    append: function(part) {
      if (this.partsByName.hasOwnProperty(part.name)) {
        console.warn("Assembly: register part "+part.name+" twice");
      }
      this.partsByName[part.name] = part;
      this.parts.push(part);
      if (this.toEachPart) {
        this.toEachPart('change', [{mutation: 'add', propertyName: part.name, value: part}]);
      }
    },
    remove: function(part) {
      var index = this.parts.indexOf(part);
      if (index === -1) {
        console.warning("Assembly: unregisterPart called for part not regisitered", {extendMe: extendMe, part: part});
        return;
      }
      this.parts.slice(index, 1);   
      delete this.partsByName[part.name];
      this.toEachPart('change', [{mutation: 'delete', propertyName: part.name, value: part}]);
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
          console.error("Assembly: "+iterator+" "+method+" to "+listener.name+" threw "+exc, {listener: listener, stack: exc.stack});
        }
      } else {
        theUnheardOf.push(listener);
      }
    });
    if (theUnheardOf.length) {
      console.warn("Assembly: some listeners do not implement "+method, theUnheardOf);
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
      // Ok we are going meta here...
      Assembly.addPartContainer(extendMe._partContainer, true); // Now the partContainer can have parts
      var models = thePurple.getPartByName('models');
      models.registerPart(extendMe._partContainer);  // and listeners can look them up to add parts for callbacks
  };

  if (!bootstrap) {  
    extendMe._registerPartsAsModel();
  }
};

  // The root has been created but we did not add its part container because addition req. root. Now fix it.
  Assembly.addPartContainer(thePurple, true);  

}());