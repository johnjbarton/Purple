// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/PartLinkRep', '../resources/ResourceRep'], function (domplate, PartLinkRep, ResourceRep) {
  
  with(domplate.tags) {
    
    var JavaScriptResourceRep = domplate.domplate(
      ResourceRep,
      {
        tag: DIV({'class': 'resourceJS'},
          TAG(PartLinkRep.tag, {object:'$object'})   
          )
      }
    );
  }
  
  
  return JavaScriptResourceRep;
});