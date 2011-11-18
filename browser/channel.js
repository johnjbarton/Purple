// See Purple/licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/Feature', 'lib/features'], function (Feature, Features) {
  
  var channel = Feature.new({
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
  
  Features.registerPart(channel);
  
  return channel;
  
}());