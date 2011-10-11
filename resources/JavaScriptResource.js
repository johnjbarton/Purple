// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate'], function (domplate) {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  
  function JavaScriptResource(url, isContentScript) {
    this.url = url;
    this.isContentScript = isContentScript;
    this.scripts = {};
  }
  
  JavaScriptResource.prototype = {};
  
  JavaScriptResource.prototype.appendScript = function(scriptId, startLine, startColumn, endLine, endColumn) {
    this.scripts[scriptId] = [startLine, startColumn, endLine, endColumn];
  };
  
  with(domplate.tags) {
    JavaScriptResource.prototype.domplateTag = domplate.domplate({
      tag: DIV({'class': 'resourceJS'}, '$url')
    });
  }
  
  return JavaScriptResource;
});