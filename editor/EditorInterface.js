// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*globals define*/

define(['editor/editorCompilerAssembly'], 
function (      EditorCompilerAssembly) {
  
  function EditorInterface(element) {
    EditorCompilerAssembly.call(this, element);
  }
  
  EditorInterface.prototype = {
  
    /* Open a file for editing
    ** @param url: GET target for source code
    ** @param line: 1 based line to be centered, default 1
    ** @param col:  1 based column to be centered, default 1
    */
    open: EditorCompilerAssembly.prototype.open
  };
  
  return EditorInterface;
  
});