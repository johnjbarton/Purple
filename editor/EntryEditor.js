// An editor instance that can be added below a log entry
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define window */

define(['lib/framePart', 'lib/q/q', 'editor/editor', 'editor/editorCompilerAssembly'], 
function (   framePart,         Q,          editor,          editorCompilerAssembly) {

  var EntryEditor = framePart.extend({
    
    initialize: function(insertAfterElement) {
      var src = 'editor/index.html';
      var promisedEditor = this.promisePart(src, insertAfterElement);
      var methodNames = Object.keys(editor);
      methodNames.forEach(function(methodName) {
        this[methodName] = EntryEditor.createMethod(promisedEditor, methodName);
      });
    },
    
    createMethod: function(promisedEditor, methodName) {
      return function () { // this function will be a method of the EntryEditor instance
        var args = arguments;  // hold arguments in closure var
        return Q.when(promisedEditor, function(promisedEditor) {
          // Once the editor is loaded and we get the instance we can, finally, call the function
          return promisedEditor[methodName].apply(promisedEditor, args);
        });
      };
    }
    
  });

  // var entryEditor = EntryEditor.new(afterElt); 
  // entryEditor.open(resource, line, col); // calls iframe editor async
  return EntryEditor;
});