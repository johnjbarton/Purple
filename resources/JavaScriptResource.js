// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/JavaScriptResourceRep'], function (domplate, JavaScriptResourceRep) {
  
  function JavaScriptResource(url, isContentScript) {
    this.url = url;
    this.isContentScript = isContentScript;
    this.scripts = {};
    this.targetPart = "editor";
    this.rep = JavaScriptResourceRep;
  }
  
  JavaScriptResource.prototype.appendScript = function(scriptId, startLine, startColumn, endLine, endColumn) {
    this.scripts = this.scripts || {};
    this.scripts[scriptId] = [startLine, startColumn, endLine, endColumn];
  };

  return JavaScriptResource;
});