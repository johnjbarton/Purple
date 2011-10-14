// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate'], function (domplate) {
  
  function NetworkResource(url) {
    this.url = url;
  }
  
  NetworkResource.prototype = {
    get link() {
      return {target:'editor', source:this};
    },
    targetPart: 'editor', // constant for all instances
  };
  
  
  with(domplate.tags) {
    var ObjectLink = A({"class":"objectLink objectLink-$targetPart a11yFocus", _link: "$link"});
    
    NetworkResource.prototype.domplateTag = domplate.domplate({
      tag: DIV({'class': 'resourceNet'},
        ObjectLink("$url")   
        )
    });
  }
  
  return NetworkResource;
});