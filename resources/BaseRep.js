// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/Resources'], function (domplate, Resources) {
  
  var thePurple = window.purple;
  
  with(domplate.tags) {
    
    var BaseRep = domplate.domplate({
      makePARTLINK: function(subject) {
        var attrs = {
          "class":"$object|getPartLinkClass PartLink-$targetPart a11yFocus",
          _target: "$targetPart",
          _subject: subject,
          _repObject: '$object', 
          'onclick': '$clickLink'
        };
        return A(attrs);
      },
      getPartLinkClass: function(object) {
        return '';  // no part link
      },
      name: "BaseRep",
    });
  
  }
  
  BaseRep.targetPart = 'editor', // constant for all instances for now
  
  BaseRep.getURL = function(object) {
    // override in reps
    return object.url;
  }

  BaseRep.getLineNumber = function(object) {
    // override in reps
    return object.lineNumber;
  }
  
  BaseRep.getColumnNumber = function(object) {
    // override in reps
    return object.columnNumber;
  }
  
  // Will be called with |this| bound to domplate (rep)
  BaseRep.clickLink = function(event) {
    var target = event.currentTarget;  // the element with the handler
    var destinationFeature = target.getAttribute('target');
    var repObject = target.repObject;
    // This is set by makePARTLINK, I don't know if this is the best soln.
    var rep = target.subject || this;
    var resource = repObject;
    if (! repObject.fetchContent) {
      var url = rep.getURL(repObject);
      if (url) {
        resource = Resources.get(url);
      } 
      if (! resource.fetchContent) {
        BaseRep.onError("No source associated with clickLink target");
        return;
      }
    }
    var lineNumber = rep.getLineNumber(repObject); // the line comes from eg the error message
    var columnNumber = rep.getColumnNumber(repObject); // the line comes from eg the error message
    try {
      rep.openPartWith(destinationFeature, resource, lineNumber, columnNumber);
    } catch(exc) {
      BaseRep.onError(exc);
    }
    event.stopPropagation(); // we only want this one action
    event.preventDefault();
  };
    
  BaseRep.openPartWith = function(feature, resource, lineNumber, columnNumber) {
    var destinationPart = thePurple.getPartByFeature(feature);      
    if (destinationPart) {    
      destinationPart.open(resource, lineNumber, columnNumber);
    } else {
      BaseRep.onError("No part with feature "+feature+" found");
    }
  }
  
  BaseRep.onError = function() {
    console.error.apply(console, arguments);
    alert(arguments[0]);
  }
  return BaseRep;
});