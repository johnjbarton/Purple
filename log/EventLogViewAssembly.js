// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['EventLog', 'EventLogFilter', 'EventLogViewport'], function(log, filter, viewport) {

  'use strict';
  var thePurple = window.purple;
  
  var eventLogViewAssembly = new thePurple.PurplePart('eventLogViewAssembly'); 
  
  eventLogViewAssembly.initialize = function () {
      log.connect(filter);
      filter.connect(viewport);
  };
  
  eventLogViewAssembly.partRemoved = function() {
      log.disconnect(filter);
      filter.disconnect(viewport);
  };

  thePurple.registerPart(eventLogViewAssembly);
  
  return eventLogViewAssembly;
});