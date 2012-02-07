// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define console */

define(['lib/MetaObject', 'log/SparseArray', 'q/q'], 
function (   MetaObject,       SparseArray,                Q) {
  
var LogBase = MetaObject.extend({
    
  initialize: function(clock, name) {
    this.clock = clock;
    this.store = SparseArray.new(name);
  },
  
  connect: function(hasEnableDisable, viewport) {
    this.hasEnableDisable = hasEnableDisable;
    this.viewport = viewport;
  },
  
  disconnect: function() {
    delete this.hasEnableDisable;
  },
  
  post: function(data) {
    this.store.set(this.clock.p_id++, data);
  },
 
  // Input Management

  getHasEnableDisable: function() {
    if (!this.hasEnableDisable) {
      throw new Error("Connect before using remote category");
    }
    return this.hasEnableDisable;
  },
  
  broadcastEnabled: function() {
    this.toEachListener({type: 'logEnable', enabled: this.enabled});
  },
  
  toggleEnable: function() {
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
  },
  
  // Output Management
  
  show: function() {
    if (!this.viewport.getPartByName(this.store.name)) {
      this.viewport.registerPart(this.store);
      this.viewport.rebuild();
    }
    return true;
  },
    
  hide: function() {
    if (this.viewport.getPartByName(this.store.name)) {
      this.viewport.unregisterPart(this.store);
      this.viewport.rebuild();
    }
    return false;
  },
  
  toggleShow: function(targetState) {
    // TODO get the current state from the UI state
    if ( ((typeof targetState === 'boolean') && !targetState) || this.showing) {
      this.showing = this.hide();
    } else {
      this.showing = this.show();
    }
    this.toEachListener({type:'logShow', show: this.showing});
  }
}); 
   
  return LogBase;
});

