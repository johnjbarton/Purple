// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/Resources', '../lib/reps', '../lib/Rep'], function (domplate, Resources, reps, Rep) {
  
  var thePurple = window.purple;
  
  with(domplate.tags) {
    
    var ObjRep = domplate.domplate(Rep, {
      tag: DIV({
             "class":"$object|getPartLinkClass PartLink-$targetPart a11yFocus",
             _target: "$targetPart",
             _repObject: '$object', 
             'onclick': '$clickLink'
            },    
            SPAN({"class": "objectTitle"}, "$object|getTitle "),
            SPAN({"class": "objectLeftBrace", role: "presentation"}, "{"),
            FOR("prop", "$object|shortPropIterator",
                " $prop.name",
                SPAN({"class": "objectEqual", role: "presentation"}, "$prop.equal"),
                TAG("$prop.tag", {object: "$prop.object"}),
                SPAN({"class": "objectComma", role: "presentation"}, "$prop.delim")
            ),
            SPAN({"class": "objectRightBrace"}, "}") 
          ),
      getTitle: function(object) {
        return "Constructor";
      },
      shortPropIterator: function(object) {
        var props = [];
        for (var p in object) {
          var prop = {};
          prop.name = p;
          prop.equal = ':';
          var value = object[p];
          prop.tag = reps.getRepByObject(value);
          prop.object = value;
          prop.delim = ',';
        }
      },
      
      // Implements Rep
      name: "ObjRep",
      getRequiredPropertyNames: function() {
        return [];
      },
      getOptionalPropertyNames: function() {
        return []; 
      }
    });
    
    var PrimitiveRep = domplate.domplate(Rep, {
      tag: DIV({"class": 'PrimitiveRep'}, "$object|getString"),
      getString: function(object) {
        return object+"";
      }
    });
  
  }
   
  reps.registerPart(ObjRep);
  reps.primitiveRep = PrimitiveRep;
  
  return ObjRep;
});