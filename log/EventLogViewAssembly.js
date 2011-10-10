// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['EventLog', 'EventLogFilter', 'EventLogViewport'], function(log, filter, viewport) {

  'use strict';
  var thePurple = window.purple;
  
  var eventLogViewAssembly = new thePurple.PurplePart('eventLogViewAssembly'); 
  
  eventLogViewAssembly.initialize = function () {
    this.channel.initialize();
    log.initialize();
    filter.initialize();
    viewport.initialize();
    log.connect(this.channel);
    filter.connect(log);
    viewport.connect(filter);
    // enable the remote browser
    this.remote.connect(this.channel);
    this.jsEventHandler.connect(this.remote);
  };
  
  eventLogViewAssembly.destroy = function() {
    this.jsEventHandler.disconnect(this.remote);
     // disable the remote browser
    this.remote.disconnect(this.channel);
    log.disconnect(this.channel);
    filter.disconnect(log);
    viewport.disconnect(filter);
    viewport.destroy();
    log.destroy();
    filter.destroy();
  };

  eventLogViewAssembly.partAdded = function(part) {
    if (part.hasFeature('channel')) {
      this.channel = part;
    } else if (part.hasFeature('remote')) {
      this.remote = part;
    } else if (part.name === 'jsEventHandler') {  // TODO this needs to be dynamic some other way.
      this.jsEventHandler = part;
    }
    if (this.channel && this.remote && this.jsEventHandler) {
      eventLogViewAssembly.initialize();
    }
  };

  eventLogViewAssembly.partRemoved = function(part) {
    var stillAlive = this.channel;
    if (stillAlive) {
      var mineRemoved = (part === this.channel);
      if (mineRemoved) {
        eventLogViewAssembly.destroy();
      }
    }
  };

  thePurple.registerPart(eventLogViewAssembly);
  
  return eventLogViewAssembly;
});