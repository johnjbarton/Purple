// A Purple Feature is a dynamic version of an interface
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function (){

  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;

  var Feature = thePurple.Feature = function(spec) {
    this.name = spec.name,
    this.api = spec.api;
    this.events = spec.events;
    this.types = spec.types;
  };
  
  Feature.methods = Feature.prototype = {
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
    }
  };
  
  var Features = new thePurple.PurplePart('Features');
  Assembly.addPartContainer(Features);
  
  // name: a property of Features
  // implementation: an object with function properties matching |feature.api|
  Features.verifyFeature = function(name, implementation) {
    var feature = Features.getPartByName(name);
    if (!feature) {
      thePurple.error("verifyFeature ERROR: no feature named "+name);
    }
    if (feature.implementation) {
      var info = {feature: feature, override: implementation};
      thePurple.error("Purple: attempt to implement feature "+name+" without unimplementing it first", info);
      return;
    }
    var api = Object.keys(feature.getAPI());
    api.every(function copyFunction(key) {
      if (implementation[key]) {
        return true;
      } else {
        thePurple.error("Purple: "+key+" not implemented for feature "+feature.name, implementation); 
      }
    });
  };
   
  thePurple.registerPart(Features);
  
}());