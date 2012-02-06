// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

/*globals define*/

define(['log/LogBase', 'MetaObject/q/q'], function(LogBase, Q) {
  
  'use strict';
  
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var ChromeLog =  LogBase.new('browserLog'); 
  
  ChromeLog.enabler = {
    enable: function() {
      return Q.ref('enabled');
    },
    disable: function() {
      return Q.ref('disabled');
    }
  };
  
  ChromeLog.initialize = function(clock) {
    LogBase.initialize.apply(this, ['chrome', clock]);
    this.recv = this.recv.bind(this);
  };
  
  ChromeLog.connect = function(viewport) {
    this.viewport = viewport;
    LogBase.connect.apply(this, [ChromeLog.enabler, viewport]);
    return this;
  };

  ChromeLog.disconnect = function(eventSource) {
    LogBase.disconnect.apply(this, [ChromeLog.enabler, ChromeLog.shower]);
  };
  
  // -----------------------------------------------------------------------------------
  //
  ChromeLog.recv = function(data) {
    if(!data) {
      throw new Error("Log.recv no data");
    }
    this.post(data);  
  }.bind(ChromeLog);
  
  ChromeLog.forEachEvent = function(fncOfData) {
    return this.getStore().forEach(fncOfData);
  };
  
  return ChromeLog;
});