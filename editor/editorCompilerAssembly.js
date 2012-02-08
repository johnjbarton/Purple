// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

/*globals define console window*/

define(['editor/editorInterface', 'editor/editorDelegator',  'q-comm/q-rpc', 'compiler/traceuratops/compileFeatureByTraceur'], 
function(       editorInterface,         editor,                     Q_RPC,                               compilerByTraceur) {

  'use strict';
  
  var editorCompilerAssembly = {
    commands: editorInterface.events,
    events: editorInterface.commands
  };
  
  editorCompilerAssembly.events.open = function(url, line, column) {
    console.log("editor open called with ", arguments);
    editor.open(url, line, column);
  };
  
  editorCompilerAssembly.initialize = function () {
      this.remote = Q_RPC.makeStub(window.parent, this.commands, this.events);
  
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