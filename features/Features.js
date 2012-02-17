// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define*/

// A namespace and registry for services
// By changing which implementation file is bound to the dependency, 
// we load different implemenations of the same interface. 

define(['editor/editorInserter'], function(editor) {

var Features = {
  editor: editor.commands
};

return Features;

});