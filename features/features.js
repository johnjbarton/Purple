// A Purple Feature is a dynamic version of an interface
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function (){

  var thePurple = window.purple;

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
  
  var Assembly = thePurple.Assembly;
  
  thePurple._features = {};  
  
  // name: a property of thePurple._features
  // implementation: an object with function properties matching |feature.api|
  thePurple.implementFeature = function(name, implementation) {
    if (!name || !thePurple._features.hasOwnProperty(name)) {
      var info = {unknownFeature: name, _features: thePurple._features};
      thePurple.error("Purple: attempt to implement an unknown feature "+name, info);
      return;
    }
    var feature = thePurple._features[name];
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
    thePurple.forEachPart('featureImplemented', [feature]);
    console.log("Implemented "+name, feature);
  };
   
  thePurple.getFeature = function(name) {
    if (!thePurple._features.hasOwnProperty(name)) {
      thePurple.error("Purple: no feature named "+name);
    } else {
      return thePurple._features[name];
    }
  };
   
  thePurple.unimplementFeature = function(name, implementation) {
    if (!thePurple._features.hasOwnProperty(name)) {
      thePurple.error("Purple: attempt to unimplement an unknown feature "+name);
      return;
    }
    var feature = thePurple._features[name];
    if (!feature.implementation) {
      thePurple.error("Purple: attempt to unimplement an unimplemented feature");
    }
    delete feature.implementation;
    thePurple.forEachPart('featureUnimplemented', [feature]);
  };


  //-----------------------------------------------------------------------------------------
  function fail(featureName, method) {
    thePurple.error("Purple: the method "+method+" of feature "+featureName+" is not implemented");
  }

  thePurple.preInitialize.push(function prepFeatures() {
    Object.keys(thePurple._features).forEach(function addFailure(feature) {
      if (feature.api) {
        Object.keys(feature.api).forEach(function failOne(method) {
          feature.api[method] = fail(feature.name, method);
        });
      }
    });
    
  });
}());