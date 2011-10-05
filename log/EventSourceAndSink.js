// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function() {
  
  'use strict';
  var thePurple = window.purple;
  var Feature = thePurple.Feature;

  var EventSource = Object.create(Feature.methods);
  EventSource.name = "EventSource";
  EventSource.api = {
    addListener: function (fncOfEvent) {}
  };
 
  var EventSink = thePurple.extend(Object.create(Feature.methods), {
    name: "EventSink",
    api: {
      appendData: function(data) {}
    }
  });
  
  var EventLog = thePurple.extend(Object.create(Feature.methods), {
    name: "EventLog",
    api: {
      forEach: function(fncOfData) {}
    }
  });

  var Features = thePurple.getPartByName('Features');
  Features.registerPart(EventSource);
  Features.registerPart(EventSink);
  Features.registerPart(EventLog);
  
}());