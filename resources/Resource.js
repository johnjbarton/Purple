// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/Base.js', '../lib/domplate/lib/domplate','../resources/ResourceRep'], function (Base, domplate, ResourceRep) {
  
  var Resource = Base.extend({
    initialize: function(url) {
      this.url = url;
      this.rep = ResourceRep;
    }
  });
  
  return Resource;
});