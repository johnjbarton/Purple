// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate'], function (domplate) {
  
  var thePurple = window.purple;
  
  with(domplate.tags) {
   var PARTLINK = A({"class":"PartLink PartLink-$.targetPart a11yFocus", _target: "$targetPart", _repObject: '$object', 'onclick': '$clickLink'});
    
    var ResourceRep = domplate.domplate({
      tag: DIV({'class': 'resource'},
          PARTLINK("$object.url")   
        )
    });
  
    ResourceRep.PARTLINK = PARTLINK;
  }
  
  ResourceRep.targetPart = 'editor', // constant for all instances
  
  // Will be called with |this| bound to domplate (rep)
  ResourceRep.clickLink = function(event) {
    var target = event.currentTarget;  // the element with the handler
    var destinationFeature = target.getAttribute('target');
    var repObject = target.repObject;
    this.openPartWith.apply(repObject, [destinationFeature]);
  };
    
  ResourceRep.openPartWith = function(feature) {
    var destinationPart = thePurple.getPartByFeature(feature);      
    if (destinationPart) {    
      destinationPart.open(this);
    } else {
      throw new Error("No part with feature "+feature+" found");
    }
  }
  return ResourceRep;
});