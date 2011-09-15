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
  
  var log__ =  new thePurple.PurplePart('log');  // the __ bit just makes the method names stand out.
  
  log__.featureImplemented = function(feature) {
    if (feature.name === 'load') {
      this.messages = [];
      var logElement = document.getElementById('log');
      logElement.style.overflowY = 'scroll';
    } else if (feature.name === 'channel') {
      var channel = feature.implementation;
      channel.registerPart(this);
    }
  }

  log__.featureUnimplemented = function(feature) {
    if (feature.name === 'load') {
      delete this.messages;
    } else if (feature.name === 'channel') {
      var channel = feature.implementation;
      channel.unregisterPart(this);
    }
  }
  
  thePurple.registerPart(log__);
  
  // -----------------------------------------------------------------------------------
   log__.recv = function(event) {
     this.messages.push(event.data);
     var logElement = document.getElementById('log');
     var entry = document.createElement('div');
     var text = this.messages.length+": "+this.render(event.data);
     entry.innerHTML = text;
     logElement.appendChild(entry);
   };
   
   log__.render = function(data) {
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