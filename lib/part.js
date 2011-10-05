// API for Parts in the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function(){

window.purple = window.purple || {};
var thePurple = window.purple;

  // Parts implement these functions
  // If any method returns a truthy value, the remainder are not notified.
  thePurple.PurplePart = function PurplePart(name) {
    if (!name) {
      throw new Error("Attempt to create part without a name");
    }
    this.name = name;
    this.features = [];
  };
  
  thePurple.PurplePart.prototype = {
    getName: function() { 
      return this.name; 
    },
    implementsFeature: function(featureName) {
      if (!this.hasFeature(featureName)) {
        this.features.push(featureName);
      }
    },
    hasFeature: function(featureName) {
      return (this.features.indexOf(featureName) !== -1);
    }
  };
  
}());