// PurplePart recv message and create log
// connect(source), registerPart(sink)
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['../lib/q/q'], function(Q) {
  
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
    eventSource.addListener(this.recv);
    var connected = eventSource.connect();
    return Q.when(connected, function(connected) {
      return EventLog;
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
    var data = event.data; // MessageEvent comes from postMessage
    if(!data) {
      throw new Error("Log.recv no data", event);
    }
    this.messages.push(data);
    this.toEachPart('appendData', [data, this.messages.length]);
  }.bind(EventLog);
  
  EventLog.max = function() {
    return this.messages.length;
  }
  
  EventLog.get = function(index) {
    return this.messages[index];
  }
  
  EventLog.forEachEvent = function(fncOfData) {
    return this.messages.forEach(fncOfData);
  };
  
  return EventLog;
});