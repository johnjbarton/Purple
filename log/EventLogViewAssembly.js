// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['EventLog', 'EventLogFilter', 'EventLogViewport'], function(log, filter, viewport) {

  'use strict';
  var thePurple = window.purple;
  
  var eventLogViewAssembly = new thePurple.PurplePart('eventLogViewAssembly'); 
  
  eventLogViewAssembly.partAdded = function (partInfo) {
    if (partInfo.value === log) {
      log.registerPart(filter);
    } else if (partInfo.value === filter) {
      filter.registerPart(viewport);
    }
  };
  
  eventLogViewAssembly.partRemoved = function(partInfo) {
    if (partInfo.value === log) {
      log.unregisterPart(filter);
    } else if (partInfo.value === filter) {
      filter.unregisterPart(viewport);
    }
  };

  thePurple.registerPart(eventLogViewAssembly);
  
  return eventLogViewAssembly;
});