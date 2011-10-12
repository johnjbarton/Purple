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
      eventSource.addListener(this.recv);
  };

  EventLog.disconnect = function(eventSource) {
      eventSource.removeListener(this.recv);
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
    this.messages.push(event);
    this.toEachPart('appendData', [event]);
  }.bind(EventLog);
  
  EventLog.forEachEvent = function(fncOfData) {
    return this.messages.forEach(fncOfData);
  };
  
  return EventLog;
}());