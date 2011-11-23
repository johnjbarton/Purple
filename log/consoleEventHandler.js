// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['log/LogBase', 'browser/remoteByWebInspector', 'log/SparseArray', 'log/ConsoleEntry'], 
  function   (LogBase,          RemoteByWebInspector,       SparseArray,       ConsoleEntry) {
  
  var consoleEventHandler = LogBase.new('consoleLog');

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
  consoleEventHandler.connect = function(channel, viewport) {
      this.store = SparseArray.new('ConsoleEvents');
      this.remote = RemoteByWebInspector.new('consoleRemote');
      
      this.remote.connect(channel, this);
      LogBase.connect.apply(this, [this.remote.Console, viewport]);   // this causes the event store to be pulled into the viewport   
  };
  
  consoleEventHandler.disconnect = function(channel) {
      if (consoleEventHandler.enabled) {
        throw new Error("Disable before disconnecting");
      }
      this.remote.disconnect(channel);
  };
  

  return consoleEventHandler;
});