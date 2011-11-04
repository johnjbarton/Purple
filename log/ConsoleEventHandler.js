// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../browser/remoteByWebInspector', 'EventIndex', 'ConsoleEntry'], 
  function (remoteByWebInspector, EventIndex, ConsoleEntry) {
  var thePurple = window.purple;
  
  var consoleEventHandler = new thePurple.PurplePart('consoleEventHandler');
  
  //---------------------------------------------------------------------------------------------
  // Implement Remote.events
  
  consoleEventHandler.responseHandlers = {
    Console: {
        messageAdded: function(message) {
          consoleEventHandler.latestEntry = new ConsoleEntry(message);
          return consoleEventHandler.latestEntry;
        },
        messageRepeatCountUpdated: function(count) {
          // ignore this for now
        },
        messagesCleared: function() {
          consoleEventHandler.latestEntry = ConsoleEntry.messagesClearedEntry;
          return consoleEventHandler.latestEntry;
        }
      }
  };
  
   //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  
  consoleEventHandler.connect = function(log) {
      this.remote = remoteByWebInspector.create('consoleRemote', this.responseHandlers);
      this.index = EventIndex.new(this.remote);
      this.remote.connect(log, this);
	  this.remote.Console.enable();
  };
  
  consoleEventHandler.disconnect = function(log) {
      this.remote.Console.disable();
      this.remote.disconnect(log);
      delete this.index;
  };

  thePurple.registerPart(consoleEventHandler);

  return consoleEventHandler;
});