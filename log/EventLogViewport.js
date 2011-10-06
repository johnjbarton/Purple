// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define([], function() {
  
  'use strict';
  var thePurple = window.purple;
  var Browser = thePurple.Browser;
  var Renderer = {
    'debugger': function(data) {
      var params = data.params ? Object.keys(data.params).join(',') : "";
      return "debugger."+data.name+"("+params+")";
    },
    'webNavigation': function(data) {
      var params = data.params ? Object.keys(data.params).join(',') : "";
      return "webNavigation."+data.name+"("+params+")";
    }
  };

  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var EventLogViewport =  new thePurple.PurplePart('EventLogViewport');  // 
  
  EventLogViewport.initialize = function() {
    this.messagesInViewport = [];
  }
    
  EventLogViewport.connect = function(eventLog) {
      this.sourceLog = eventLog
      this.initializeUI();
      this.update();
  };

  EventLogViewport.disconnect = function(eventLog) {
    if (this.sourceLog && this.sourceLog === eventLog) {
      delete this.messagesInViewport;
    } 
  };
  
  thePurple.registerPart(EventLogViewport);
  
  // -----------------------------------------------------------------------------------
  EventLogViewport.initializeUI = function () {
    var logElement = document.getElementById('log');
    logElement.style.overflowY = 'scroll';
  };

  EventLogViewport.dataAppended = function(data) {
    // if the viewport is looking at the bottom
    this.update();
  };
  
  EventLogViewport.update = function() {
  
  };
  
  EventLogViewport.render = function(data) {
    if (data.source) {
      var renderer = Renderer[data.source];
      if (renderer) {
        return renderer(data);
      } else {
        return data.source+"?";
      }
    } else {
      return data.toString();
    }
  };
  
  return EventLogViewport;
  
});