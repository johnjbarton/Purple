// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function() {
  
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
  
  var logViewport__ =  new thePurple.PurplePart('log');  // the __ bit just makes the method names stand out.
  
  logViewport__.featureImplemented = function(feature) {
    if (feature.name === 'logFilter') {
      this.messagesInViewport = [];
      this.sourceLog = feature.implementation;
      this.initializeUI();
      this.update();
    } 
  };

  logViewport__.featureUnimplemented = function(feature) {
    if (feature.name === 'logFilter') {
      delete this.messagesInViewport;
    } 
  };
  
  thePurple.registerPart(logViewport__);
  
  // -----------------------------------------------------------------------------------
  logViewport__.initializeUI = function () {
    var logElement = document.getElementById('log');
    logElement.style.overflowY = 'scroll';
  };

  logViewport__.dataAppended = function(data) {
    // if the viewport is looking at the bottom
    this.update();
  };
  
  logViewport__.update = function() {
  
  };
  
  logViewport__.render = function(data) {
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
  
}());