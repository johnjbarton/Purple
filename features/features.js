// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function (){

  var thePurple = window.purple;

  thePurple.Feature = function() {
  };
  
  thePurple.Feature.prototype = {
    _listeners: [],
    
    api: {
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
    },
  };


  thePurple.features = {};  
  
  // feature: a property of thePurple.features, {name: string, api: [functions]}
  // implementation: an object with function properties matching |feature|
  thePurple.features.implement = function(feature, implementation) {
    if (!feature.name || !thePurple.features.hasOwnProperty(feature.name)) {
      var info = {unknownFeature: feature, features: thePurple.features};
      thePurple.error("Purple: attempt to implement an unknown feature", info);
      return;
    }
    if (feature.implementation) {
      var info = {feature: feature, override: implementation};
      thePurple.error("Purple: attempt to implement feature "+feature.name+" without unimplementing it first", info);
      return;
    }
    feature.implementation = implementation;
    var api = Object.keys(feature.api);
    api = api.concat(["addListener", "removeListener", "someListeners"]);
    api.every(function copyFunction(key) {
      if (implementation[key]) {
        feature[key] = implementation[key];
        return true;
      } else {
        thePurple.error("Purple: "+key+" not implemented for feature "+feature.name, implementation); 
      }
    });
  };
   
  function fail(featureName, method) {
    thePurple.error("Purple: the method "+method+" of feature "+featureName+" is not implemented");
  }
   
  thePurple.features.unimplement = function(feature, implementation) {
    if (!feature.name || !thePurple.features.hasOwnProperty(feature.name)) {
      thePurple.error("Purple: attempt to unimplement an unknown feature", feature);
      return;
    }
    if (!feature.implementation) {
      thePurple.error("Purple: attempt to unimplement an unimplemented feature");
    }
    Object.key(feature.api).forEach(function removeKey(method) {
      feature.implementation[method] = fail(feature.name, method);
    });
  };


  //-----------------------------------------------------------------------------------------
  thePurple.preInitialize.push(function prepFeatures() {
    Object.keys(thePurple.features).forEach(function addFailure(feature) {
      if (feature.api) {
        Object.keys(feature.api).forEach(function failOne(method) {
          feature.api[method] = fail(feature.name, method);
        });
      }
    });
    
  });
}());