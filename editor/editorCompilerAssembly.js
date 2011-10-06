// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['editorFeatureByOrion'], function(editor) {

  'use strict';
  var thePurple = window.purple;
  
  var compiler = thePurple.getPartByName('compilerByTraceur');
  
  var editorCompilerAssembly = new thePurple.PurplePart('editorCompilerAssembly'); 
  
  editorCompilerAssembly.initialize = function () {
      editor.initialize();
      compiler.initialize();
      compiler.connect(editor);
  };
  
  editorCompilerAssembly.destroy = function() {
      compiler.disconnect(editor);
      compiler.destroy();
      editor.destroy();
  };
  
  editorCompilerAssembly.partAdded = function(partInfo) {
    if (partInfo.value.getName() === 'compilerByTraceur') {
      this.initialize();
    }
  };

  editorCompilerAssembly.partRemoved = function(partInfo) {
    if (partInfo.value.getName() === 'compilerByTraceur') {
      this.destroy();
    }
  };

  thePurple.registerPart(editorCompilerAssembly);
  
  return editorCompilerAssembly;
});