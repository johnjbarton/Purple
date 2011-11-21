// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/Base', 'lib/part', 'lib/q/q', 'lib/Assembly'], 
function (   Base, PurplePart,         Q,       Assembly) {
  
  var LogBase = Base.extend(PurplePart.prototype);
    
  LogBase.initialize = function(name) {
    PurplePart.apply(this, [name]);
    Assembly.addListenerContainer(this);
    this.implementsFeature('Log'); // proxy for enable
  };
  
  LogBase.connect = function(hasEnableDisable) {
    this.hasEnableDisable = hasEnableDisable;
  };
  
  LogBase.disconnect = function() {
    delete this.hasEnableDisable;
  };

  LogBase.getHasEnableDisable = function() {
    if (!this.hasEnableDisable) {
      throw new Error("Connect before using remote category");
    }
    return this.hasEnableDisable;
  };
  
  LogBase.toggleEnable = function() {
    var abler = this.getHasEnableDisable().enable;
    if (this.enabled) {
      abler = this.getHasEnableDisable().disable;
    }
    
    var promiseAbled = abler.apply(this.getHasEnableDisable, []);
    
    var log = this;
    Q.end(
      Q.when(promiseAbled, function(promiseAbled) {
        log.enabled = !log.enabled;
        log.toEachListener({type: 'logEnable', enabled: log.enabled});
        return this.enabled;
      }, function(err) {
        console.error("Enable FAILED: "+err, {stack: err.stack});
      })
    );
  };
    
  return LogBase;
});