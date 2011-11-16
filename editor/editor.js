// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/Feature', 'lib/features'], function (Feature, Features) {
  
  var editor = Feature.new({
    name: "editor",
    api: {
      //-------------------
      // Commands to editor
      open: function(source) {}, // source.url
      
      setContent: function(name, src) { },
    
      // indicator: {token: string, tooltip: string, line: number, column: number }
      reportError: function(indicator) { },
      
      showValue: function(value, line, col) {},
      
      //---------------------------
      // Events From Editor. Listeners will see onX called when editor fires _X
      
      // name: a key given to setContent,
      // src: new buffer contents, 
      // startDamage: first pos of change (both old and new)
      // endDamage: last pos of change in *old* buffer 
      _sourceChange: function(name, src, startDamage, endDamage) {}

    }
  });
  
  Features.registerPart(editor);
  
  return editor;
  
});