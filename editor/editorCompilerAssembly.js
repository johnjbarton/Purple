// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['editorFeatureByOrion'], function(editor) {

  'use strict';
  var thePurple = window.purple;
  
  
  var editorCompilerAssembly = new thePurple.PurplePart('editorCompilerAssembly'); 
  
  editorCompilerAssembly.initialize = function () {
      editor.initialize();
      this.compiler = thePurple.getPartByName('compilerByTraceur');
      this.compiler.initialize();
      this.compiler.connect(editor);
  };
  
  editorCompilerAssembly.destroy = function() {
      this.compiler.disconnect(editor);
      this.compiler.destroy();
      editor.destroy();
  };
  
  editorCompilerAssembly.partAdded = function(part) {
    if (part.getName() === 'compilerByTraceur') {
      this.initialize();
    }
  };

  editorCompilerAssembly.partRemoved = function(part) {
    if (part.getName() === 'compilerByTraceur') {
      this.destroy();
    }
  };

  thePurple.registerPart(editorCompilerAssembly);
  
  return editorCompilerAssembly;
});