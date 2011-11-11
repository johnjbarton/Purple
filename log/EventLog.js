// PurplePart recv message and create log
// connect(source), registerPart(sink)
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['log/SparseArray', '../lib/q/q'], function(SparseArray, Q) {
  
  'use strict';
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var EventLog =  new thePurple.PurplePart('EventLog'); 
  
  EventLog.initialize = function() {
      this.messages = SparseArray.new('BrwoserEvents');
      this.recv = this.recv.bind(this);
      Assembly.addPartContainer(this);
  };
  
  EventLog.connect = function(eventSource, filter) {
    filter.registerPart(this.messages);
    eventSource.addListener(this.recv);
    var connected = eventSource.connect();
    return Q.when(connected, function(connected) {
      return EventLog;
    });
  };

  EventLog.disconnect = function(eventSource) {
      eventSource.disconnect();
  };

  thePurple.registerPart(EventLog);
  
  window.addEventListener('pagehide', function (){
    thePurple.unregisterPart(EventLog);
  }, false);
  
  // -----------------------------------------------------------------------------------
  //
  EventLog.recv = function(p_id, data) {
    if(!data) {
      throw new Error("Log.recv no data");
    }
    this.messages.set(p_id, data);  // TODO SparseArray
    this.toEachPart('appendData', [data, p_id]); // TODO swap args
  }.bind(EventLog);
  
  EventLog.forEachEvent = function(fncOfData) {
    return this.messages.forEach(fncOfData);
  };
  
  return EventLog;
});