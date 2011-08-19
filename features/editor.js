// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function () {
  var thePurple = window.purple;
  
  thePurple.features.editor = {
    name: "editor",
    api: {
      setContent: function(name, src) { },
    
      // name: a key given to setContent,
      // src: new buffer contents, 
      // startDamage: first pos of change (both old and new)
      // endDamage: last pos of change in *old* buffer 
      sourceChange: function(name, src, startDamage, endDamage) { },
    
      // indicator: {token: string, tooltip: string, line: number, column: number }
      reportError: function(indicator) { },
    },
  };
  
}());