// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/NetworkResource'], function (domplate, NetworkResource) {
  
  function JavaScriptResource(url, isContentScript) {
    this.url = url;
    this.isContentScript = isContentScript;
    this.scripts = {};
    this.targetPart = "editor";
  }
  
  JavaScriptResource.prototype = Object.create(NetworkResource.prototype);
  
  JavaScriptResource.prototype.appendScript = function(scriptId, startLine, startColumn, endLine, endColumn) {
    this.scripts[scriptId] = [startLine, startColumn, endLine, endColumn];
  };

  
  with(domplate.tags) {
    var ObjectLink = A({"class":"objectLink objectLink-$targetPart a11yFocus", _link: "$link"});
    
    JavaScriptResource.prototype.domplateTag = domplate.domplate({
      tag: DIV({'class': 'resourceJS'},
        ObjectLink("$url")   
        )
    });
  }
  
  return JavaScriptResource;
});