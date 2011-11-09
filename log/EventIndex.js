// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/Base'], 
  function (Base) {
  
  var EventIndex = {};
  
  EventIndex.recv = function(data) {
    this.objectBuffer.push(data);
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
  
  EventIndex.initialize = function() {
      this.objectBuffer = [];
  };
  
  EventIndex.disconnect = function() {
      delete this.objectBuffer;
  };

  return Base.extend(EventIndex);
});