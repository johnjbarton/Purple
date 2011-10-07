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
        console.error("Assembly: register part "+part.name+" twice");
        throw new Error("Assembly: register part "+part.name+" twice");
      }
      this.partsByName[part.name] = part;
      this.parts.push(part);
      // Notify all parts, including the one that just registered, of the new part
      var partInfo = {assembly: extendMe, containerName: this.name, mutation: 'add', propertyName: part.name, value: part};
      extendMe.toEachPart('partAdded', [partInfo]);
      if (part.partAdded) {
        // Notify the new part of all the existing parts
        var existingPartInfo = {assembly: extendMe, containerName: this.name, mutation: 'add'};
        extendMe.forEachPart(function toNewPart(existingPart) {
          existingPartInfo.value = existingPart; // TODO go back to just sending the part not partInfo
          part.partAdded(existingPartInfo);
        });
      }
      if (this.toEachPart) {  
        // Notify the parts container listeners 
        this.toEachPart('partAdded', [partInfo]);
      }
    },
    remove: function(part) {
      var index = this.parts.indexOf(part);
      if (index === -1) {
        console.warning("Assembly: unregisterPart called for part not regisitered", {extendMe: extendMe, part: part});
        return;
      }
      var partInfo = {assembly: extendMe, containerName: this.name, mutation: 'delete', propertyName: part.name, value: part};
      extendMe.toEachPart('partDeleted', [partInfo]);
      if (this.toEachPart) {
        this.toEachPart('partDeleted', [partInfo]);
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
  return;
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