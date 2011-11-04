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
      this.recv = this.recv.bind(this);
      Assembly.addPartContainer(this);
  };
  
  EventLog.connect = function(eventSource) {
    var channel = eventSource.connect(this.recv);
    return Q.when(channel, function(channel) {
      return this;
    });
  };

  EventLog.disconnect = function(eventSource) {
      eventSource.disconnect();
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