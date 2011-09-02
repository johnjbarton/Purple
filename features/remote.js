// See Purple/licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function () {
  var thePurple = window.purple;
  
  thePurple._features.remote = {
    name: "remote",
    api: {
      Console: {
        enable: function(){},
        disable: function(){}
      },
      Debugger: {
        continueToLocation: function(location) {}
      }

    }
  };
  
}());