// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/Base'], 
  function (Base) {
  
  var EventIndex = {};
  
  EventIndex.recv = function(data) {
    this.jsonBuffer.push(data);
  };
  
  EventIndex._update = function() {
    var min = this.objectBuffer.length;
    var max = this.jsonBuffer.length;
    for (var i = min; i < max; i++) {
      var json = this.jsonBuffer[i];
      this.objectBuffer.push( this.remote.dispatchToHandler(json) );
    }
  };
  
  EventIndex._getMatcher = function(constraints) {
    return function(obj) { return true; };
  };

  // API
  
  EventIndex.filter = function(constraints, thenFnOfObject) {
    // flush any new events to the object buffer
    this._update();
    
    var matcher = this._getMatcher(constraints);
    var max = this.objectBuffer.length;
    for (var i = 0; i < max; i++) {
      var obj = this.objectBuffer[i];
      if (matcher(obj)) {
        if (!thenFnOfObject(obj)) break;          
      }
    }
  };
  
  EventIndex.initialize = function(remote) {
      this.jsonBuffer = [];
      this.objectBuffer = [];
      this.remote = remote;
  };
  
  EventIndex.disconnect = function() {
      delete this.jsonBuffer;
      delete this.objectBuffer;
      delete this.remote;
  };

  return Base.extend(EventIndex);
});