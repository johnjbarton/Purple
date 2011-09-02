// See Purple/licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function () {
  var thePurple = window.purple;
  
  thePurple._features.channel = {
    name: "channel",
    api: {
      //-------------------
      // Commands to channel
      send: function(message) { },
    
      //---------------------------
      // (register for) Events From channel
      
      registerPart: function() {},
      unregisterPart: function() {}

    }
  };
  
}());