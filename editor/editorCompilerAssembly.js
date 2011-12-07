// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com
/*global define */

define(['lib/SelfishPart', 'editor/editorFeatureByOrion', 'compiler/traceuratops/compileFeatureByTraceur'], 
function(SelfishPart,                      editor,                               compilerByTraceur) {

  'use strict';
  
  var editorCompilerAssembly = SelfishPart.new('editorCompilerAssembly'); 
  
  editorCompilerAssembly.initialize = function (thePurple) {
      this.editor = editor;
      this.editor.initialize();

      thePurple.registerPart(compilerByTraceur);
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