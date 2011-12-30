// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/MetaObject', 'lib/domplate/lib/domplate','resources/ResourceRep'], function (MetaObject, domplate, ResourceRep) {
  
  var Resource = MetaObject.extend({
    initialize: function(url) {
      this.url = url;
      this.rep = ResourceRep;
    }
  });
  
  return Resource;
});