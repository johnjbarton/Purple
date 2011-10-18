// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate'], function (domplate) {
  
  with(domplate.tags) {
   var PARTLINK = A({"class":"PartLink PartLink-$object.rep.targetPart a11yFocus", _target: "$object.rep.targetPart", 'onclick': '$object.rep.clickLink'});
    
    var ResourceRep = domplate.domplate({
      tag: DIV({'class': 'resource'},
          PARTLINK("$object.url")   
        )
    });
  
    ResourceRep.PARTLINK = PARTLINK;
  }
  
  ResourceRep.targetPart = 'editor', // constant for all instances
  
  // Will be called with |this| bound to $object
  ResourceRep.clickLink = function(event) {
    var target = event.currentTarget;  // the element with the handler
    var destinationFeature = target.getAttribute('target');
    this.openPartWith.apply(this, [destinationFeature]);
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