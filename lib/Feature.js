// A Purple Feature is a dynamic version of an interface
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/MetaObject'], function (MetaObject){

  var Feature = MetaObject.extend({
    getName: function() {
      return this.name;
    },
    getAPI: function() {
      return this.api;
    },
    getEvents: function() {
      return this.events;
    },
    getTypes: function() {
      return this.types;
    },
    getImplementation: function() {
      return this.implementation;
    },
    //--------
    initialize: function(spec) {
      this.name = spec.name;
      this.api = spec.api;
      this.events = spec.events;
      this.types = spec.types;
    }
  });
  
  return Feature;
  
});