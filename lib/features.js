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
  
  Feature.prototype = {
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
  
  thePurple.Features = {};
  Assembly.addPartContainer(thePurple.Features);
  
  // name: a property of thePurple.Features
  // implementation: an object with function properties matching |feature.api|
  thePurple.implementFeature = function(name, implementation) {
    var feature = thePurple.Features.getPartByName(name);
    if (feature.implementation) {
      var info = {feature: feature, override: implementation};
      thePurple.error("Purple: attempt to implement feature "+name+" without unimplementing it first", info);
      return;
    }
    feature.implementation = implementation;
    Assembly.addPartContainer(feature.implementation);  
    var api = Object.keys(feature.getAPI());
    api.every(function copyFunction(key) {
      if (implementation[key]) {
        return true;
      } else {
        thePurple.error("Purple: "+key+" not implemented for feature "+feature.name, implementation); 
      }
    });
    thePurple.toEachPart('featureImplemented', [feature]);
    console.log("Implemented "+name, feature);
  };
   
  thePurple.getFeature = function(name) {
    debugger; // use thePurple.Features.getPartByName
  };
   
  thePurple.unimplementFeature = function(name, implementation) {
    var feature = thePurple.Features.getPartByName(name); 
    if (!feature.implementation) {
      thePurple.error("Purple: attempt to unimplement an unimplemented feature");
    }
    delete feature.implementation;
    thePurple.toEachPart('featureUnimplemented', [feature]);
  };


  //-----------------------------------------------------------------------------------------
  function makeFail(featureName, method) {
    return function() {
      thePurple.error("Purple: the method "+method+" of feature "+featureName+" is not implemented");
    } 
  }

  thePurple.preInitialize.push(function prepFeatures() {
    thePurple.Features.forEachPart(function addFailure(feature) {
      if (feature.api) {
        Object.keys(feature.api).forEach(function failOne(method) {
          feature.api[method] = makeFail(feature.name, method);
        });
      }
    });
    
  });
}());