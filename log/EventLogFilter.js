// PurplePart maintains array of filtered pointers to log entries
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define([], function() {
  
  'use strict';
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var filter =  new thePurple.PurplePart('logFilter');
  
  Assembly.addPartContainer(filter);  // downstream event sinks like views

  // Filters will be parts of logs
  
  filter.connect = function(eventLog) {
      this.filteredMessages = [];
      this.sourceLog = eventLog;  // upstream
      this.sourceLog.registerPart(this);
  };

  filter.disconnect = function(eventLog) {
    if (this.sourceLog) {
      delete this.filteredMessages;
      this.sourceLog.unregisterPart(this)
      delete this.sourceLog;
    }
  };
  
  // -----------------------------------------------------------------------------------
  //
  filter.match = function(data) {
    // Here is where the findAnything filter fits.
    return true; 
  };

  // EventSink
  
  filter.appendData = function(data) {
    if (this.match(data)) {
      var index = this.filteredMessages.length;
      this.filteredMessages.push(data);
      this.toEachPart('dataAppended', [data, index]);
    }
  };
  
  // Filter
  
  filter.updateAll = function() {
    this.filteredMessages = [];  // erase
    this.sourceLog.forEach(this.appendData.bind(this));
  };
  
 
  filter.implementsFeature('EventSink');

  return filter;
}());