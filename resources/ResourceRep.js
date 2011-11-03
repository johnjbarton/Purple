// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/PartLinkRep'], function (domplate, PartLinkRep) {
  
  var thePurple = window.purple;
  
  with(domplate.tags) {
    
    var ResourceRep = domplate.domplate(
      PartLinkRep, 
      {
      tag: DIV({'class': 'resource'},
          TAG(PartLinkRep.tag, {object:'$object'})   
        ),
      getPartLinkClass: function(object) {
        return object.requestId ? 'partLink' : ""; 
      }
    });
  
  }
  
  return ResourceRep;
});