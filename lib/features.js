// A Purple Feature is a dynamic version of an interface
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/part','lib/Assembly'], function (PurplePart, Assembly){

  var Features = new PurplePart('Features');
  Assembly.addPartContainer(Features);
  
  // name: a property of Features
  // implementation: an object with function properties matching |feature.api|
  Features.verifyFeature = function(name, implementation) {
    var feature = Features.getPartByName(name);
    if (!feature) {
      console.error("verifyFeature ERROR: no feature named "+name);
    }
    if (feature.implementation) {
      var info = {feature: feature, override: implementation};
      console.error("Purple: attempt to implement feature "+name+" without unimplementing it first", info);
      return;
    }
    var api = Object.keys(feature.getAPI());
    api.every(function copyFunction(key) {
      if (implementation[key]) {
        return true;
      } else {
        console.error("Purple: "+key+" not implemented for feature "+feature.name, implementation); 
      }
    });
  };
   
  return Features;
  
});