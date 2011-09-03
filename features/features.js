// A Purple Feature is a dynamic version of an interface
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function (){

  var thePurple = window.purple;

  thePurple.Feature = function() {
  };
  
  thePurple.Feature.prototype = {  //TODO Assmebly.
    _listeners: [],
    
    addListener: function(listener) {
      var index = this._listeners.indexOf(listener);
      if (index === -1) {
        this._listeners.push(listener);
      } else {
        thePurple.warn("Purple.Feature addListener already has listener", listener);
      }
    },
    
    removeListener: function(listener) {
      var index = this._listeners.indexOf(listener);
      if (index === -1) {
        thePurple.warn("Purple.Feature removeListener already removed", listener);
      } else {
        this._listeners.slice(index, 1);
      }
    },
     
    someListeners: function(method, args) {
     thePurple.someListeners(this._listeners, method, args);
    },
  
  };


  thePurple._features = {};  // TODO OO Features
  
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
    var api = Object.keys(feature.api);
    api = api.concat(["addListener", "removeListener", "someListeners"]);
    api.every(function copyFunction(key) {
      if (implementation[key]) {
        return true;
      } else {
        thePurple.error("Purple: "+key+" not implemented for feature "+feature.name, implementation); 
      }
    });
    thePurple.forEachPart('featureImplemented', feature);
  };
   
  thePurple.getFeature = function(name) {
    if (!thePurple._features.hasOwnProperty(name)) {
      thePurple.error("Purple: no feature named "+name);
    } else {
      var impl = thePurple._features[name].implementation;
      if (!impl) {
        thePurple.error("Purple: feature "+name+" not implemented");
      } else {
        return impl;
      }
    }
  };
   
  thePurple.getFeatureAPI = function(name) {
    if (!thePurple._features.hasOwnProperty(name)) {
      thePurple.error("Purple: no feature named "+name);
    } else {
      return thePurple._features[name].api;
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
    thePurple.forEachPart('featureUnimplemented', feature);
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