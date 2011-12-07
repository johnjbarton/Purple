// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

/*global define */

define(['../lib/Base', '../lib/part'], 
function(       Base,     PurplePart) {
  var SelfishPart = Base.becomeSelfish(PurplePart);
  
  return SelfishPart;
});