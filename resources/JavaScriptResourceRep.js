// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/ResourceRep'], function (domplate, ResourceRep) {
  
  with(domplate.tags) {
    
    var JavaScriptResourceRep = domplate.domplate(
      ResourceRep,
      {
        tag: DIV({'class': 'resourceJS'},
          ResourceRep.PARTLINK("$object.url")   
          )
      }
    );
  }
  
  
  return JavaScriptResourceRep;
});