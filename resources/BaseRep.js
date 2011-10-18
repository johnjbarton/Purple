// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/Resources'], function (domplate, Resources) {
  
  var thePurple = window.purple;
  
  with(domplate.tags) {
    var PARTLINK = A({"class":"PartLink PartLink-$.targetPart a11yFocus", _target: "$targetPart", _repObject: '$object', 'onclick': '$clickLink'});
    
    var BaseRep = domplate.domplate({
      PARTLINK: PARTLINK
    });
  
  }
  
  BaseRep.targetPart = 'editor', // constant for all instances for now
  
  // Will be called with |this| bound to domplate (rep)
  BaseRep.clickLink = function(event) {
    var target = event.currentTarget;  // the element with the handler
    var destinationFeature = target.getAttribute('target');
    var repObject = target.repObject;
    var resource = repObject;
    if (! repObject.fetchObject) {
      var url = repObject.url;
      if (url) {
        resource = Resources.get(url);
      } else {
        throw new Error("No source associated with clickLink target");
      }
    }
    
    this.openPartWith(destinationFeature, resource);
    event.stopPropagation(); // we only want this one action
    event.preventDefault();
  };
    
  BaseRep.openPartWith = function(feature, resource) {
    var destinationPart = thePurple.getPartByFeature(feature);      
    if (destinationPart) {    
      destinationPart.open(resource);
    } else {
      throw new Error("No part with feature "+feature+" found");
    }
  }
  return BaseRep;
});