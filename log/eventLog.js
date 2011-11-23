// PurplePart recv message and create log
// connect(source), registerPart(sink)
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['log/LogBase', 'lib/Assembly'], function(LogBase, Assembly) {
  
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
  
  eventLog.shower = {
    show: function(){
      if (!eventLog.viewport.getPartByName(eventLog.getStore().name)) {
        eventLog.viewport.registerPart(eventLog.getStore());
        eventLog.viewport.rebuild();
      }
      return true;
    },
    hide: function(){
      if (eventLog.viewport.getPartByName(eventLog.getStore().name)) {
        eventLog.viewport.unregisterPart(eventLog.getStore());
        eventLog.viewport.rebuild();
      };
      return false;
    }
  };
  
  eventLog.initialize = function() {
      this.recv = this.recv.bind(this);
      Assembly.addPartContainer(this);
  };
  
  eventLog.connect = function(channel, viewport) {
    this.channel = channel;
    this.viewport = viewport;
    LogBase.connect.apply(this, [eventLog.enabler, viewport]);
    return this;
  };

  eventLog.disconnect = function(eventSource) {
    LogBase.disconnect.apply(this, [eventLog.enabler, eventLog.shower]);
  };
  
  // -----------------------------------------------------------------------------------
  //
  eventLog.recv = function(p_id, data) {
    if(!data) {
      throw new Error("Log.recv no data");
    }
    this.getStore().set(p_id, data);  
    this.toEachPart('appendData', [data, p_id]); // TODO swap args
  }.bind(eventLog);
  
  eventLog.forEachEvent = function(fncOfData) {
    return this.getStore().forEach(fncOfData);
  };
  
  return eventLog;
});