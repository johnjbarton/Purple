// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function() {
  
  'use strict';
  var thePurple = window.purple;
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var log__ =  new thePurple.PurplePart('log');  // the __ bit just makes the method names stand out.
  
  log__.featureImplemented = function(feature) {
    if (feature.name === 'load') {
      this.messages = [];
    } else if (feature.name === 'channel') {
      var channel = feature.implementation;
      channel.registerPart(this);
    }
  };

  log__.featureUnimplemented = function(feature) {
    if (feature.name === 'load') {
      delete this.messages;
    } else if (feature.name === 'channel') {
      var channel = feature.implementation;
      channel.unregisterPart(this);
    }
  };
  
  thePurple.registerPart(log__);
  
  // -----------------------------------------------------------------------------------
   log__.recv = function(event) {
     this.messages.push(event.data);
     this.toEachPart('dataAppended', [event.data]);
   };
  
}());