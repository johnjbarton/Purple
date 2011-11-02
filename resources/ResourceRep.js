// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/BaseRep'], function (domplate, BaseRep) {
  
  var thePurple = window.purple;
  
  with(domplate.tags) {
    
    var ResourceRep = domplate.domplate(
      BaseRep, 
      {
      tag: DIV({'class': 'resource'},
          BaseRep.makePARTLINK(BaseRep)("$object.url")   
        ),
      getPartLinkClass: function(object) {
        return object.requestId ? 'partLink' : ""; 
      }
    });
  
  }
  
  return ResourceRep;
});