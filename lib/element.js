// HTML Element utils, some copied from fbug (BSD)
// http://code.google.com/p/fbug/source/browse/branches/firebug1.9/content/firebug/lib/dom.js
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define([], function () {

var Element = {};

Element.isAncestorOf = function(potentialAncestor, elt) {
  for (var parent = elt; parent; parent = parent.parentNode) {
    if (parent === potentialAncestor) {
      return true;
    }
  }
};

return Element;

});
