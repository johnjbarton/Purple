// PurplePart maintains array of filtered pointers to log entries
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function() {
  
  'use strict';
  var thePurple = window.purple;
  var Browser = thePurple.Browser;
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var filter__ =  new thePurple.PurplePart('logFilter');  // the __ bit just makes the method names stand out.
  
  filter__.featureImplemented = function(feature) {
    if (feature.name === 'log') {
      this.filteredMessages = [];
      this.sourceLog = feature.implementation;
      this.sourceLog.registerPart(this);
    } 
  };

  filter__.featureUnimplemented = function(feature) {
    if (feature.name === 'load') {
      delete this.filteredMessages;
      delete this.sourceLog;
    } 
  };
  
  thePurple.registerPart(filter__);
  
  // -----------------------------------------------------------------------------------
  filter__.match = function(data) {
    // Here is where the findAnything filter fits.
    return true; 
  };

  // log event handler
  filter__.dataAppended = function(data) {
    if (this.match(data)) {
      this.filterMessages.push(data);
      this.toEachPart('dataAppended', [data]);
    }
  };
  
}());