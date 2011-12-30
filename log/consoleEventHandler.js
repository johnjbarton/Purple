// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define*/

define(['log/LogBase', 'browser/remoteByWebInspectorPart', 'log/SparseArray', 'log/ConsoleEntry'], 
  function   (LogBase,          RemoteByWebInspectorPart,       SparseArray,       ConsoleEntry) {
  
  var LoggingConsole = LogBase.extend({
    eventHandlers: {
      Console: {
        messageAdded: function(message, p_id) {
          LoggingConsole.latestEntry = new ConsoleEntry(message);
          this.store.set(p_id, LoggingConsole.latestEntry);
        },
        messageRepeatCountUpdated: function(count) {
          // ignore this for now
        },
        messagesCleared: function(p_id) {
          LoggingConsole.latestEntry = ConsoleEntry.messagesClearedEntry;
          this.store.set(p_id, LoggingConsole.latestEntry);
        }
      }
    },
    initialize: function(name) {
      LogBase.initialize.apply(this, [name]);
      this.store = SparseArray.new(this.name);
    },
    //---------------------------------------------------------------------------------------------
    // Implement PurplePart
  
    // Return a promise that the Console is enabled
    connect: function(channel, viewport) {
      LogBase.connect.apply(this, [this, viewport]);   // this causes the event store to be pulled into the viewport   
    },
  
    disconnect: function(channel) {
      if (this.enabled) {
        throw new Error("Disable before disconnecting");
      }
      this.remote.disconnect(channel);
    }

  });


  var consoleEventHandler = LoggingConsole.new('consoleLog');

  return consoleEventHandler;
});