// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/Base', 'lib/part', 'browser/remoteByWebInspector', 'log/SparseArray', 'log/ConsoleEntry'], 
  function   (Base,    PurplePart,   RemoteByWebInspector,       SparseArray,       ConsoleEntry) {
  
  var consoleEventHandler = new PurplePart('consoleEventHandler');

  //---------------------------------------------------------------------------------------------
  // Implement Remote.events
  
  consoleEventHandler.responseHandlers = {
    Console: {
        messageAdded: function(message, p_id) {
          consoleEventHandler.latestEntry = new ConsoleEntry(message);
          this.store.set(p_id, consoleEventHandler.latestEntry);
        },
        messageRepeatCountUpdated: function(count) {
          // ignore this for now
        },
        messagesCleared: function(p_id) {
          consoleEventHandler.latestEntry = ConsoleEntry.messagesClearedEntry;
          this.store.set(p_id, consoleEventHandler.latestEntry);
        }
      }
  };
  
   //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  
  // Return a promise that the Console is enabled
  consoleEventHandler.connect = function(channel, filter) {
      this.remote = RemoteByWebInspector.new('consoleRemote');
      this.store = SparseArray.new('ConsoleEvents');
      filter.registerPart(this.store);  // this causes the event store to be pulled into the viewport
      this.remote.connect(channel, this);
	  return this.remote.Console.enable();
  };
  
  consoleEventHandler.disconnect = function(channel) {
      var disabled = this.remote.Console.disable();
      // Q.when(disabled
      this.remote.disconnect(channel);
  };

  return consoleEventHandler;
});