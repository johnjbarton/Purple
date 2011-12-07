// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define*/

define([], function () {
  
  // https://github.com/Gozala/selfish
  
  var Base = {
  
    'new': function() {
      var obj = Object.create(this);
      obj.initialize.apply(obj, arguments);
      return obj;
    },
    
    _mergeOne: function(argument, key) {
      this[key] = argument[key];
    },
    
    merge: function() {
       for (var i = 0; i < arguments.length; i++) {
         var argument = arguments[i];
         Object.keys(argument).forEach(this._mergeOne.bind(this, argument));
       }
       return this;
    },
    
    // An object with |this| as its prototype, and props from arguments
    extend: function() {
      return this.merge.apply(Object.create(this), arguments);
    },
    
    _objBecomeSelfish: function(obj) {
      var behavior = {};
      var state = {};
      Object.keys(obj).forEach(function(key) {
        if (typeof obj[key] === 'function') {
          behavior[key] = obj[key];
        } else {
          state[key] = obj[key];
        }
      });
      
      var prototype = Object.getPrototypeOf(obj);
      // (Possibly dangerous?) fallback if the initialize is not overridden
      if ( !behavior.initalize && prototype.constructor) {
        if(prototype.constructor !== Object) {
          behavior.initialize = prototype.constructor;
        }
      }
      
      return this.merge(
        Object.create(
          this.merge(                   // new type's functions:
            Base,                       // Is a selfish object
            prototype, // inherit obj's prototype,
            behavior                    // and obj's functions
          )
        ),
        state  // having obj's state as its state
      );
    },
    
    _ctorBecomeSelfish: function(ctor) {
      return this.merge(
        Object.create(
          this.merge(             // the new type's functions:
            Base,                 // isA selfish object,
            ctor.prototype        // inherit ctor's functions
          )
        ),
        {
          initialize: ctor        // match selfish  
        }
      );
    },
    
    // For classical JS objects to Selfish objects.
    becomeSelfish: function(objOrCtor) {
      if (typeof objOrCtor === 'function' && objOrCtor.prototype) {
        return this._ctorBecomeSelfish(objOrCtor);
      } else {
        return this._objBecomeSelfish(objOrCtor);
      }
    }

  };  


    
  return Base;
});