// Purple Extension Adapter, part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function(){
  function route(event) {
    console.log("channel.route ", event);
  }
  window.addEventListener('message', route, false);
}());