// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/Base', 'lib/part', 'lib/q/q', 'lib/Assembly'], 
function (   Base, PurplePart,         Q,       Assembly) {
  
  var LogBase = Base.extend(PurplePart.prototype);
  Assembly.addListenerContainer(LogBase);
    
  LogBase.initialize = function(name) {
    PurplePart.apply(this, [name]);
    this.implementsFeature('Log'); // proxy for enable
  };
  
  LogBase.connect = function(remoteCategory) {
    this.remoteCategory = remoteCategory;
  };
  
  LogBase.disconnect = function() {
    delete this.remoteCategory;
  };

  LogBase.getRemoteCategory = function() {
    if (!this.remoteCategory) {
      throw new Error("Connect before using remote category");
    }
    return this.remoteCategory;
  };
  
  // returns promise of new enabled state boolean, and dispatches it to listeners.
  LogBase.toggleEnable = function() {
    var abler = this.getRemoteCategory.enable;
    if (this.enabled) {
      abler = this.getRemoteCategory.disable;
    }
    
    var promiseAbled = abler.apply(this.getRemoteCategory, []);
    
    var log = this;
    return Q.when(promiseAbled, function(promiseAbled) {
      log.enabled = !log.enabled;
      log.toEachListener({type: 'partEnabled', enabled: log.enabled});
      return this.enabled;
    }, function(err) {
      console.error("Enable FAILED: "+err, {stack: err.stack});
    });
  };
    
  return LogBase;
});