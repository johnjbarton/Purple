// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/Resources'], function (domplate, Resources) {
  
  var thePurple = window.purple;
  
  with(domplate.tags) {
    var PARTLINK = A({"class":"$object|getPartLinkClass PartLink-$targetPart a11yFocus", _target: "$targetPart", _repObject: '$object', 'onclick': '$clickLink'});
    
    var BaseRep = domplate.domplate({
      PARTLINK: PARTLINK,
      getPartLinkClass: function(object) {
        return '';  // no part link
      }
    });
  
  }
  
  BaseRep.targetPart = 'editor', // constant for all instances for now
  
  // Will be called with |this| bound to domplate (rep)
  BaseRep.clickLink = function(event) {
    var target = event.currentTarget;  // the element with the handler
    var destinationFeature = target.getAttribute('target');
    var repObject = target.repObject;
    var resource = repObject;
    if (! repObject.fetchContent) {
      var url = repObject.url;
      if (url) {
        resource = Resources.get(url);
      } 
      if (! resource.fetchContent) {
        BaseRep.onError("No source associated with clickLink target");
      }
    }
    try {
      this.openPartWith(destinationFeature, resource);
    } catch(exc) {
      BaseRep.onError(exc);
    }
    event.stopPropagation(); // we only want this one action
    event.preventDefault();
  };
    
  BaseRep.openPartWith = function(feature, resource) {
    var destinationPart = thePurple.getPartByFeature(feature);      
    if (destinationPart) {    
      destinationPart.open(resource);
    } else {
      BaseRep.onError("No part with feature "+feature+" found");
    }
  }
  
  BaseRep.onError = function() {
    console.error.apply(console, arguments);
    alert(arguments[0]);
  }
  return BaseRep;
});