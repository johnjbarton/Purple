// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/Resources', '../lib/reps', '../lib/Rep'], function (domplate, Resources, Reps, Rep) {
  
  var thePurple = window.purple;
  
  with(domplate.tags) {
    
    var PartLinkRep = domplate.domplate(Rep, {
      tag: A({
          "class":"$object|getPartLinkClass PartLink-$targetPart a11yFocus",
          _target: "$targetPart",
          _repObject: '$object', 
          'onclick': '$clickLink'
      }, "$object|getPartLinkText" ),
      getResourceName: function(object) {
        var url = this.getURL(object);
        if (!url) {
          return "No URL for "+object;
        }
        var splits = url.split('/');
        return splits.slice(-1);
      },
      getPartLinkText: function(object) {
        return this.getResourceName(object);
      },
      getPartLinkClass: function(object) {
        var resource = this.getResource(object);
        return (resource && resource.hasSource) ? 'partLink' : 'noSource';
      },
      
      getResource: function(object) {
        var url = this.getURL(object);
        var resource = Resources.get(url);
        return resource;
      },

      // Implements Rep
      name: "PartLinkRep",
      getRequiredPropertyNames: function() {
        return ['url'];
      },
      getOptionalPropertyNames: function() {
        return ['lineNumber', 'columnNumber']; 
      }
    });
  
  }
  
  PartLinkRep.targetPart = 'editor', // constant for all instances for now
  
  PartLinkRep.getURL = function(object) {
    // override in reps
    return object.url;
  }

  PartLinkRep.getLineNumber = function(object) {
    // override in reps
    return object.lineNumber;
  }
  
  PartLinkRep.getColumnNumber = function(object) {
    // override in reps
    return object.columnNumber;
  }
  
  // Will be called with |this| bound to domplate (rep)
  PartLinkRep.clickLink = function(event) {
    var target = event.currentTarget;  // the element with the handler
    var destinationFeature = target.getAttribute('target');
    var repObject = target.repObject;
    var rep = repObject.rep || PartLinkRep;
    var resource = repObject;
    if (!repObject.fetchContent) {
      var url = rep.getURL(repObject);
      if (url) {
        resource = Resources.get(url);
      } 
      if (! resource.fetchContent) {
        PartLinkRep.onError("No source associated with clickLink target");
        return;
      }
    }
    var lineNumber = rep.getLineNumber(repObject); // the line comes from eg the error message
    var columnNumber = rep.getColumnNumber(repObject); // the line comes from eg the error message
    try {
      rep.openPartWith(target, destinationFeature, resource, lineNumber, columnNumber);
    } catch(exc) {
      PartLinkRep.onError(exc);
    }
    event.stopPropagation(); // we only want this one action
    event.preventDefault();
  };
    
  PartLinkRep.openPartWith = function(elt, feature, resource, lineNumber, columnNumber) {
    var destinationPart = thePurple.getPartByFeature(feature);      
    if (destinationPart) {    
      destinationPart.open(elt, resource, lineNumber, columnNumber);
    } else {
      PartLinkRep.onError("No part with feature "+feature+" found");
    }
  }
  
  PartLinkRep.onError = function() {
    console.error.apply(console, arguments);
    alert(arguments[0]);
  }
  
  
  Reps.registerPart(PartLinkRep);
  
  return PartLinkRep;
});