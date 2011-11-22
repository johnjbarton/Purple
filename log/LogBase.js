// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/Base', 'lib/part', 'log/SparseArray', 'lib/q/q', 'lib/Assembly'], 
function (   Base, PurplePart,       SparseArray,         Q,       Assembly) {
  
  var LogBase = Base.extend(PurplePart.prototype);
    
  LogBase.initialize = function(name) {
    PurplePart.apply(this, [name]);
    this.store = SparseArray.new(name);
    Assembly.addListenerContainer(this);
    this.implementsFeature('Log'); // proxy for enable
  };
  
  LogBase.connect = function(hasEnableDisable, hasShowHide) {
    this.hasEnableDisable = hasEnableDisable;
    this.hasShowHide = hasShowHide;
  };
  
  LogBase.disconnect = function() {
    delete this.hasEnableDisable;
  };
  
  // TODO Base.delegate(['get', 'set'], this.store)
  LogBase.getStore = function() {
    return this.store;
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
    
    var promiseAbled = abler.apply(this.getHasEnableDisable(), []);
    
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
  
  LogBase.toggleShow = function() {
    var shower = this.hasShowHide.show;
    if (this.showing) {
      shower = this.hasShowHide.hide;
    }
    
    this.showing = shower.apply(this.hasShowHide, []);
    this.toEachListener({type:'logShow', show: this.showing});
  };
    
  return LogBase;
});