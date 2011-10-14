// See Purple/licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function () {
  var thePurple = window.purple;
  
  var channel = new thePurple.Feature({
    name: "channel",
    api: {
      //-------------------
      // Commands to channel
      send: function(message) { },
    
      //---------------------------
      // (register for) Events From channel
      
      registerPart: function(part) {},
      unregisterPart: function(part) {}

    },
    events: {
      recv: function(message) {}
    }
  });
  var Features = thePurple.getPartByName('Features');
  Features.registerPart(channel);
  
}());