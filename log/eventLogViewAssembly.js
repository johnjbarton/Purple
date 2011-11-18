// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['log/eventLog', 'log/EventLogViewport', 'resources/Resources', 'lib/q/q', 'lib/part', 'log/javaScriptEventHandler', 'log/consoleEventHandler', 'log/networkEventHandler'], 
function(         log,               viewport,             resources,         Q,  PurplePart,              jsEventHandler,       consoleEventHandler,       networkEventHandler) {

  'use strict';
  
  var eventLogViewAssembly = new PurplePart('eventLogViewAssembly'); 
  
  eventLogViewAssembly.initialize = function (thePurple) {
    log.initialize();
    viewport.initialize();
    thePurple.registerPart(resources);
  };
  
  eventLogViewAssembly.connect = function(channel) {
    
    // Attach the output of the JSON pipe from the browser to the input of the message buffer
    log.connect(channel, viewport);
    
    resources.connect(log.recv);
      // connect the output of the log to the input of the viewport
    viewport.connect(log);
    var channelPromise = channel.connect();
    Q.when(channelPromise, function(channel) {
      // connect the default indexes to the output of the channel and the input of the filter, enabling each remote category
      var jsPromise = jsEventHandler.connect(channel, viewport);
      var consolePromise = consoleEventHandler.connect(channel, viewport);
      var networkPromise = networkEventHandler.connect(channel, viewport);
      var connected = Q.join(jsPromise, consolePromise, networkPromise, function (jsPromise, consolePromise, networkPromise) {
        console.log("js, console, net enabled");
        // release the page
        eventLogViewAssembly.channel.send({command: 'releasePage'});
        return "released page";
      });
      
      Q.when(connected, function success(connected) {
        console.log("eventLogViewAssembly connected "+connected);
      }, function fail(connected){
        console.error("eventLogViewAssembly FAILED "+connected, connected.stack);
      });
    });
    return viewport;
  };
  
  eventLogViewAssembly.disconnect = function() {
    this.networkEventHandler.disconnect(this.channel);
    this.consoleEventHandler.disconnect(this.channel);
    this.jsEventHandler.disconnect(this.channel);
    log.disconnect(this.channel);
    viewport.disconnect(log);
  };
  
  eventLogViewAssembly.destroy = function() {
    viewport.destroy();
    log.destroy();
  };

  eventLogViewAssembly.partAdded = function(part) {
    if (part.hasFeature('channel')) {
      this.channel = part;
      eventLogViewAssembly.connect(this.channel);
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

  
  return eventLogViewAssembly;
});