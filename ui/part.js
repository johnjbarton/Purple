// Links 
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define([], function (){

  function openResourceInPart(resource, feature, event) {
    var destinationPart = null;
    thePurple.forEachPart(function findPart(part) {
      if (part.hasFeature(feature)) {
        destinationPart = part;
        return true;
      }
    });
    if (destinationPart) {    
      destinationPart.open(resource);
    } else {
      throw new Error("No part with feature "+feature+" found");
    }
  }

  function link(element, resource, destinationFeature) {
    var bound = openResourceInPart.bind(resource, destinationFeature);
    element.addEventListener('click', bound, false);
    element._partLinkListener = bound;
  }

  function unlink(element) {
    var bound = element._partLinkListener = bound;
    if (bound) {
      element.removeEventListener('click', bound, false);
    }
  }
  
  return {link: link, unlink: unlink};
  
});