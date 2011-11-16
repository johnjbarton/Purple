// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['lib/part', 'editor/editorFeatureByOrion', 'compiler/traceuratops/compileFeatureByTraceur', 'lib/purple'], 
function(PurplePart,                      editor,                               compilerByTraceur,   thePurple) {

  'use strict';
  
  var editorCompilerAssembly = new PurplePart('editorCompilerAssembly'); 
  
  editorCompilerAssembly.initialize = function () {
      editor.initialize();
      this.compiler = compilerByTraceur;
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

  return editorCompilerAssembly;
});