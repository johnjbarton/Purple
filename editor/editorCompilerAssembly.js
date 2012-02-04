// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

/*globals define*/

define(['editor/editorDelegator', 'compiler/traceuratops/compileFeatureByTraceur'], 
function(                editor,                               compilerByTraceur) {

  'use strict';
  
  var editorCompilerAssembly = {};
  
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
  
  return editorCompilerAssembly;
});