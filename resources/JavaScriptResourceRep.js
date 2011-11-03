// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/BaseRep', '../resources/ResourceRep'], function (domplate, BaseRep, ResourceRep) {
  
  with(domplate.tags) {
    
    var JavaScriptResourceRep = domplate.domplate(
      ResourceRep,
      {
        tag: DIV({'class': 'resourceJS'},
          TAG(BaseRep.tag, {object:'$object'})   
          )
      }
    );
  }
  
  
  return JavaScriptResourceRep;
});