// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['EventLog', 'EventLogFilter', 'EventLogViewport', 'ConsoleEventHandler', 'NetworkEventHandler', '../lib/q/q'], 
function(     log,       filter,               viewport,   consoleEventHandler,   networkEventHandler,            Q) {

  'use strict';
  var thePurple = window.purple;
  
  var eventLogViewAssembly = new thePurple.PurplePart('eventLogViewAssembly'); 
  
  eventLogViewAssembly.initialize = function () {
    this.channel.initialize();
    log.initialize();
    filter.initialize();
    viewport.initialize();
  };
  
  eventLogViewAssembly.connect = function() {
    log.connect(this.channel);
    // connect the default indexes to the output of the log and the input of the filter
    var jsPromise = this.jsEventHandler.connect(log, filter);
    var consolePromise = this.consoleEventHandler.connect(log, filter);
    var networkPromise = this.networkEventHandler.connect(log, filter);
    return Q.join(jsPromise, consolePromise, networkPromise, function (jsPromise, consolePromise, networkPromise) {
      console.log("js, console, net enabled");
      // connect the output of the filter to the input of the viewport
      viewport.connect(filter);
      // release the page
      var promiseEnabled = onConnect(channel);
      Q.when(promiseEnabled, function releasePage() {
        channel.send({command: 'releasePage'});
      });
    });
  };
  
  eventLogViewAssembly.disconnect = function() {
    this.networkEventHandler.disconnect(this.channel);
    this.consoleEventHandler.disconnect(this.channel);
    this.jsEventHandler.disconnect(this.channel);
    log.disconnect(this.channel);
    filter.disconnect(log);
    viewport.disconnect(filter);
  };
  
  eventLogViewAssembly.destroy = function() {
    viewport.destroy();
    log.destroy();
    filter.destroy();
  };

  eventLogViewAssembly.partAdded = function(part) {
    if (part.hasFeature('channel')) {
      this.channel = part;
    } else if (part.name === 'jsEventHandler') {  // TODO this needs to be dynamic some other way.
      this.jsEventHandler = part;
    } else if (part.name === 'consoleEventHandler') {
      this.consoleEventHandler = part;
    } else if (part.name === 'networkEventHandler') {
      this.networkEventHandler = part;
    } 
    if (this.channel && this.jsEventHandler && this.consoleEventHandler && this.networkEventHandler && !this.initialized) {
      this.initialized = true;
      eventLogViewAssembly.initialize();
      this.channel.connect(this.connect.bind(this));
    }
  };

  eventLogViewAssembly.partRemoved = function(part) {
    var stillAlive = this.channel;
    if (stillAlive) {
      var mineRemoved = (part === this.channel);
      if (mineRemoved) {
        eventLogViewAssembly.disconnect();
        eventLogViewAssembly.destroy();
      }
    }
  };

  thePurple.registerPart(eventLogViewAssembly);
  
  return eventLogViewAssembly;
});