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
  
  log__.partAdded = function(partInfo) {
    if (partInfo.value === this) {
      this.messages = [];
    } else if (partInfo.name === 'channel') {
      var channel = partInfo.implementation;
      channel.registerPart(this);
    }
  };

  log__.partRemoved = function(partInfo) {
    if (partInfo.value === this) {
      delete this.messages;
    } else if (partInfo.name === 'channel') {
      var channel = partInfo.implementation;
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