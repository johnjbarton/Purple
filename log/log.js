// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function() {
  
  'use strict';
  var thePurple = window.purple;
  var Browser = thePurple.Browser;

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
    Browser.connect(this.channel);
  };
  
  log__.destory = function() {
    Browser.disconnect(this.channel);
  };
  
  thePurple.registerPart(log__);
  
  // -----------------------------------------------------------------------------------
   log__.post = function(event) {
     this.messages.push(event.data);
     console.log(this.messages.length+":", event.data);
   };
  
}());