// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define console */

define(['lib/MetaObject', 'lib/part', 'log/SparseArray', 'lib/q/q', 'lib/Assembly'], 
function (   MetaObject, PurplePart,       SparseArray,         Q,       Assembly) {
  
  var LogBase = MetaObject.extend(PurplePart.prototype);
    
  LogBase.initialize = function(name) {
    PurplePart.apply(this, [name]);
    this.store = SparseArray.new(name);
    Assembly.addListenerContainer(this);
    this.implementsFeature('Log'); // proxy for enable
  };
  
  LogBase.connect = function(hasEnableDisable, outputAssembly) {
    this.hasEnableDisable = hasEnableDisable;
    this.outputAssembly = outputAssembly;
  };
  
  LogBase.disconnect = function() {
    delete this.hasEnableDisable;
  };
  
  // TODO Base.delegate(['get', 'set'], this.store)
  LogBase.getStore = function() {
    return this.store;
  };
 
  // Input Management

  LogBase.getHasEnableDisable = function() {
    if (!this.hasEnableDisable) {
      throw new Error("Connect before using remote category");
    }
    return this.hasEnableDisable;
  };
  
  LogBase.broadcastEnabled = function() {
    this.toEachListener({type: 'logEnable', enabled: this.enabled});
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
        log.broadcastEnabled();
        return this.enabled;
      }, function(err) {
        console.error("Enable FAILED: "+err, {stack: err.stack});
      })
    );
  };
  
  // Output Management
  
  LogBase.show = function() {
    if (!this.outputAssembly.getPartByName(this.getStore().name)) {
      this.outputAssembly.registerPart(this.getStore());
      this.outputAssembly.rebuild();
    }
    return true;
  };
    
  LogBase.hide = function() {
    if (this.outputAssembly.getPartByName(this.getStore().name)) {
      this.outputAssembly.unregisterPart(this.getStore());
      this.outputAssembly.rebuild();
    };
    return false;
  };
  
  LogBase.toggleShow = function(targetState) {
    // TODO get the current state from the UI state
    if ( ((typeof targetState === 'boolean') && !targetState) || this.showing) {
      this.showing = this.hide();
    } else {
      this.showing = this.show();
    }
    this.toEachListener({type:'logShow', show: this.showing});
  };
    
  return LogBase;
});