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
  };

  filter.disconnect = function(eventLog) {
      delete this.filteredMessages;
      delete this.sourceLog;
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
      this.filterMessages.push(data);
      this.toEachPart('dataAppended', [data]);
    }
  };
  
  // Filter
  
  filter.updateAll = function() {
    this.filterMessages = [];  // erase
    this.sourceLog.forEach(this.appendData.bind(this));
  };
  
 
  filter.implementsFeature('EventSink');

  return filter;
}());