// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['EventLog', 'EventLogFilter', 'EventLogViewport'], function(log, filter, viewport) {

  'use strict';
  var thePurple = window.purple;
  
  var eventLogViewAssembly = new thePurple.PurplePart('eventLogViewAssembly'); 
  
  eventLogViewAssembly.initialize = function () {
    log.initialize();
    filter.initialize();
    viewport.initialize();
    log.connect(this.channel);
    filter.connect(log);
    viewport.connect(filter);
  };
  
  eventLogViewAssembly.destroy = function() {
    log.disconnect(this.channel);
    filter.disconnect(log);
    viewport.disconnect(filter);
    viewport.destroy();
    log.destroy();
    filter.destroy();
  };

  eventLogViewAssembly.partAdded = function(partInfo) {
    if (partInfo.value.hasFeature('channel')) {
      this.channel = partInfo.value;
      eventLogViewAssembly.initialize();
    }
  };

  eventLogViewAssembly.partRemoved = function(partInfo) {
    var stillAlive = this.channel;
    if (stillAlive) {
      var mineRemoved = (partInfo.value === this.channel);
      if (mineRemoved) {
        eventLogViewAssembly.destroy();
      }
    }
  };

  thePurple.registerPart(eventLogViewAssembly);
  
  return eventLogViewAssembly;
});