// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/Resources', '../lib/reps', '../lib/Rep'], function (domplate, Resources, reps, Rep) {
  
  var thePurple = window.purple;
  
  with(domplate.tags) {
    var PrimitiveRep = domplate.domplate(Rep, {
      tag: SPAN({"class": 'PrimitiveRep StringRep'}, "$object|getString"),
      getString: function(object) {
        return object ? "'"+object+"'" : "";
      }
    });
    
    var StringRep = domplate.domplate(Rep, {
      tag: SPAN({"class": 'StringRep'}, "$object|getString"),
      getString: function(object) {
        return object ? "'"+object+"'" : "";
      }
    });
    
    var FoldedRep = domplate.domplate(Rep, {
      foldedTag: SPAN({'onclick': '$toggleMore','onmouseenter':'$popup' },  /*twisty in CSS*/
        SPAN({"class": "objectLeftBrace", role: "presentation"}, "{"),
        SPAN({"class": "hasMore objectRightBrace"}, "}")   
      ),
      toggleMore: function(object) {
        alert("open window for "+object);
      },
      popup: function(event) {
        alert("popup");
      },
    });
    
    var objRepShortTag = SPAN({
             "class":"objectRep",
             _repObject: '$object', 
            },    
            SPAN({"class": "objectTitle"}, "$object|getTitle "),
            SPAN({"class": "objectLeftBrace", role: "presentation"}, "{"),
            FOR("prop", "$object|shortPropIterator",
                " $prop.name",
                SPAN({"class": "objectEqual", role: "presentation"}, "$prop.equal"),
                TAG("$prop.tag", {object: "$prop.value"}),
                SPAN({"class": "objectComma", role: "presentation"}, "$prop.delim")
            ),
            SPAN({"class": "objectRightBrace"}, "}") 
          );
    
    var ObjRep = domplate.domplate(FoldedRep, {
      shortTag: objRepShortTag,
      tag: DIV({}, objRepShortTag),
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
        var idProps = [];
        var stringProps = [];
        var otherProps = [];
        for (var p in object) {
          if (ObjRep.showValuesOfTheseNames.indexOf(p) !== -1) {
            idProps.push(this.idProp(object, p));
          } else if (typeof object[p] === 'string') {
            stringProps.push(this.stringProp(object,p));
          } else {
            otherProps.push(this.otherProp(object,p));
          }
        }
        return idProps.concat(stringProps, otherProps);
      },
      idProp: function(object, p) {
        return {
          name: '', // let the string speak for itself
          equal: '',
          tag: StringRep.tag,
          value: object[p]+'',
          delim: ',',
        };
      },
      stringProp: function(object, p) {
        return {
          name: p,
          equal: ':',
          tag: StringRep.tag,
          value: object[p],
          delim: ','
        };
      },
      otherProp: function(object, p) {
        var value = object[p];
        var rep = reps.getRepByObject(value);
        return {
          name: p,
          equal: ':',
          value: value,
          tag: rep.foldedTag || rep.shortTag || rep.tag,
          delim: ',',
        };
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
    
  
  }
   
  reps.registerPart(ObjRep);
  reps.primitiveRep = PrimitiveRep;
  
  return ObjRep;
});