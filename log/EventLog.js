// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define([], function() {
  
  'use strict';
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var EventLog =  new thePurple.PurplePart('EventLog'); 
  
  EventLog.initialize = function() {
      this.messages = [];
      this.sources = {};
      this.sinks = {};
      Assembly.addPartContainer(this.sinks);
  };
  
  EventLog.connect = function(eventSource) {
      this.sources[eventSource.name] = eventSource;
      eventSource.addListener(this.recv);
  };

  EventLog.disconnect = function(eventSource) {
      eventSource.removeListener(this.recv);
  };

  EventLog.destroy = function() {
      delete this.messages;
  }; 
  
  thePurple.registerPart(EventLog);
  
  // -----------------------------------------------------------------------------------
  //
  EventLog.recv = function(event) {
    this.messages.push(event.data);
    this.sinks.toEachPart('appendData', [event.data]);
  }.bind(EventLog);
  
  EventLog.forEachEvent = function(fncOfData) {
    return this.messages.forEach(fncOfData);
  };
  
  return EventLog;
}());