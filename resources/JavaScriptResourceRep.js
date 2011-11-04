// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/PartLinkRep', '../resources/ResourceRep', '../lib/Reps'], 
function (                    domplate,                PartLinkRep,                ResourceRep,         Reps) {
  
  with(domplate.tags) {
    
    var JavaScriptResourceRep = domplate.domplate(
      ResourceRep,
      {
        tag: DIV({'class': 'resourceJS'},
          TAG(PartLinkRep.tag, {object:'$object'})   
        ),
        name: 'JavaScriptResourceRep'
      }
    );
  }
  
  Reps.registerPart(JavaScriptResourceRep);
  
  return JavaScriptResourceRep;
});