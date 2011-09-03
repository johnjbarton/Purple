// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function() {
  
  'use strict';
  var thePurple = window.purple;
  var Browser = thePurple.Browser;
  var Renderer = {
  };

  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var log__ =  new thePurple.PurplePart();  // the __ bit just makes the method names stand out.
  
  log__.initialize = function() {
    this.messages = [];
    this.channel = {
      name: 'IAmPurple',
      version: 1,
      recv: log__.post.bind(log__)
    };
    console.log("Calling Browser.connect");
    Browser.connect(this.channel);
    var logElement = document.getElementById('log');
    logElement.style.overflowY = 'scroll';
  };
  
  log__.destory = function() {
    Browser.disconnect(this.channel);
  };
  
  thePurple.registerPart(log__);
  
  // -----------------------------------------------------------------------------------
   log__.post = function(event) {
     this.messages.push(event.data);
     var logElement = document.getElementById('log');
     var entry = document.createElement('div');
     var text = this.messages.length+": "+event.data.source;
     entry.innerHTML = text;
     logElement.appendChild(entry);
     console.log(this.messages.length+": "+event.data.source, event.data);
   };
   
   log__.render = function(data) {
     if (data.source) {
       var renderer = Renderer[data.source];
       if (renderer) {
         console.log(this.messages.length+": ", renderer(data));
       } else {
         console.log(this.messages.length+": "+data.source+"?", data);
       }
     } else {
       console.log(this.messages.length+":", data);
     }
     
   };
  
}());