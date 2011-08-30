// Purple side of the message channel for browser events
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function(){
  function route(event) {
    console.log("channel.route ", event);
  }
  window.addEventListener('message', route, false);
  
  function pokeParent(event) {
    if (window.parent !== window) { // we are an iframe
      window.parent.postMessage('IAmPurple', "*"); // tell our parent we are loaded
    }
  }
  
  window.addEventListener('load', pokeParent, false);
}());