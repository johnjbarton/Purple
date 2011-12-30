// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*globals define*/

define([], function () {
  
  // based on https://github.com/Gozala/selfish
  
  var Base = {
    'new': function() {
      var obj = Object.create(this);
      obj.initialize.apply(obj, arguments);
      return obj;
    },
    
    mergeOneMethod: function(sender, key) {
      var method = sender[key];
      if (typeof method === 'function') {
        this[key] = method;
      }
    },
    
    mergeMethods: function() {
       var result = this;
       for (var i = 0; i < arguments.length; i++) {
         var argument = arguments[i];
         Object.keys(argument).forEach(
           this.mergeOneMethod.bind(this, argument)
         );
       }
       return result;
    },
    
    extend: function() {
      // An empty object with |this| as its prototype, and props from arguments
      return this.mergeMethods.apply(Object.create(this), arguments);
    }
  };  
    
  return Base;
});