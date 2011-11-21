// PurplePart recv message and create log
// connect(source), registerPart(sink)
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['log/LogBase', 'log/SparseArray', 'lib/Assembly'], function(LogBase, SparseArray, Assembly) {
  
  'use strict';
  
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var eventLog =  LogBase.new('browserLog'); 
  
  eventLog.enabler = {
    enable: function() {
      eventLog.channel.addListener(eventLog.recv);
    },
    disable: function() {
      // currently Debugger.onEvent is wired into MonitorChrome, 
      // need an new path back to implement enable/disable.
      // For now just disconnect from the channel.
      eventLog.channel.removeListener(eventLog.recv);
    }
  };
  
  eventLog.initialize = function() {
      this.messages = SparseArray.new('BrowserEvents');
      this.recv = this.recv.bind(this);
      Assembly.addPartContainer(this);
  };
  
  eventLog.connect = function(channel, filter) {
    this.channel = channel;
    LogBase.connect.apply(this, [eventLog.enabler]);
    filter.registerPart(this.messages);
    return this;
  };

  eventLog.disconnect = function(eventSource) {
      // TODO
  };
  
  // -----------------------------------------------------------------------------------
  //
  eventLog.recv = function(p_id, data) {
    if(!data) {
      throw new Error("Log.recv no data");
    }
    this.messages.set(p_id, data);  
    this.toEachPart('appendData', [data, p_id]); // TODO swap args
  }.bind(eventLog);
  
  eventLog.forEachEvent = function(fncOfData) {
    return this.messages.forEach(fncOfData);
  };
  
  return eventLog;
});