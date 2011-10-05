// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define([], function() {
  
  'use strict';
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var EventLog =  new thePurple.PurplePart('EventLog');  // the __ bit just makes the method names stand out.
  
  EventLog.partAdded = function(partInfo) {
    if (partInfo.value === this) {
      this.messages = [];
      this.sources = {};
      this.sinks = {};
      Assembly.addPartContainer(this.sinks);
    } else if (partInfo.value.hasFeature('EventSource')) {
      this.sources[partInfo.value.getName()] = partInfo.value;
      partInfo.value.addListener(this.recv);
    }
  };

  EventLog.partRemoved = function(partInfo) {
    if (partInfo.value === this) {
      delete this.messages;
    } else if (partInfo.name === 'channel') {
      var channel = partInfo.implementation;
      channel.unregisterPart(this);
    }
  };
  
  thePurple.registerPart(EventLog);
  
  // -----------------------------------------------------------------------------------
   EventLog.recv = function(event) {
     this.messages.push(event.data);
     this.sinks.toEachPart('appendData', [event.data]);
   }.bind(EventLog);
   
   EventLog.forEachEvent = function(fncOfData) {
     return this.messages.forEach(fncOfData);
   };
  
   return EventLog;
}());