// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/Resources', '../lib/reps', '../lib/Rep'], function (domplate, Resources, reps, Rep) {
  
  var thePurple = window.purple;
  
  with(domplate.tags) {
    
    var ObjRep = domplate.domplate(Rep, {
      tag: DIV({
             "class":"objectRep",
             _repObject: '$object', 
            },    
            SPAN({"class": "objectTitle"}, "$object|getTitle "),
            SPAN({"class": "objectLeftBrace", role: "presentation"}, "{"),
            FOR("prop", "$object|shortPropIterator",
                " $prop.name",
                SPAN({"class": "objectEqual", role: "presentation"}, "$prop.equal"),
                TAG("$prop.rep.tag", {object: "$prop.object"}),
                SPAN({"class": "objectComma", role: "presentation"}, "$prop.delim")
            ),
            SPAN({"class": "objectRightBrace"}, "}") 
          ),
      getTitle: function(object) {
        var protolink = Object.getPrototypeOf(object);
        if (protolink.hasOwnProperty('constructor')) { // then the prototype<->constructor match is probably intact
          var className = protolink.constructor.name;
          return  (className !== 'Object' ? className : '') || ''; // || use Nonymous naming to get the function name
        }
        // else the object was constructed from a function whose prototype has been walked on.
        return "";
      },
      showValuesOfTheseNames: ['id', 'name'],
      shortPropIterator: function(object) {
        var props = [];
        for (var p in object) {
          var prop = {};
          prop.name = p;
          prop.equal = ':';
          prop.object = '';
          if (ObjRep.showValuesOfTheseNames.indexOf(p) !== -1) {
            var value = object[p];
            prop.object = value + '';
          }
          prop.rep = reps.getRepByObject(prop.object);
          prop.delim = ',';
          props.push(prop);
        }
        return props;
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
      tag: SPAN({"class": 'PrimitiveRep StringRep'}, "$object|getString"),
      getString: function(object) {
        return object ? "'"+object+"'" : "";
      }
    });
  
  }
   
  reps.registerPart(ObjRep);
  reps.primitiveRep = PrimitiveRep;
  
  return ObjRep;
});