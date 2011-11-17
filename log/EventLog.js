// PurplePart recv message and create log
// connect(source), registerPart(sink)
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['../lib/part', 'log/SparseArray', '../lib/q/q', 'lib/Assembly'], function(PurplePart, SparseArray, Q, Assembly) {
  
  'use strict';
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var EventLog =  new PurplePart('EventLog'); 
  
  EventLog.initialize = function() {
      this.messages = SparseArray.new('BrowserEvents');
      this.recv = this.recv.bind(this);
      Assembly.addPartContainer(this);
  };
  
  EventLog.connect = function(eventSource, filter) {
    filter.registerPart(this.messages);
    eventSource.addListener(this.recv);
    return this;
  };

  EventLog.disconnect = function(eventSource) {
      eventSource.disconnect();
  };
  
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