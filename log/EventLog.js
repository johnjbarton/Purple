// PurplePart recv message and create log
// connect(source), registerPart(sink)
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
      Assembly.addPartContainer(this);
  };
  
  EventLog.connect = function(eventSource) {
      this.sources[eventSource.name] = eventSource;
      eventSource.registerPart(EventLog);
  };

  EventLog.disconnect = function(eventSource) {
      eventSource.unregisterPart(EventLog);
  };

  EventLog.destroy = function() {
      delete this.messages;
  }; 
  
  thePurple.registerPart(EventLog);
  window.addEventListener('pagehide', function (){
    thePurple.unregisterPart(EventLog);
  }, false);
  
  // -----------------------------------------------------------------------------------
  //
  EventLog.recv = function(event) {
    this.messages.push(event.data);
    this.toEachPart('appendData', [event.data]);
  }.bind(EventLog);
  
  EventLog.forEachEvent = function(fncOfData) {
    return this.messages.forEach(fncOfData);
  };
  
  return EventLog;
}());