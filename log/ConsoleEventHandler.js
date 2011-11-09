// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/Base', 'browser/remoteByWebInspector', 'log/EventIndex', 'log/ConsoleEntry'], 
  function (Base,            RemoteByWebInspector,       EventIndex,       ConsoleEntry) {
  var thePurple = window.purple;
  
  var consoleEventHandler = new thePurple.PurplePart('consoleEventHandler');

  //---------------------------------------------------------------------------------------------
  // Implement Remote.events
  
  consoleEventHandler.responseHandlers = {
    Console: {
        messageAdded: function(message) {
          consoleEventHandler.latestEntry = new ConsoleEntry(message);
          this.index.recv( consoleEventHandler.latestEntry );
        },
        messageRepeatCountUpdated: function(count) {
          // ignore this for now
        },
        messagesCleared: function() {
          consoleEventHandler.latestEntry = ConsoleEntry.messagesClearedEntry;
          this.index.recv( consoleEventHandler.latestEntry );
        }
      }
  };
  
   //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  
  // Return a promise that the Console is enabled
  consoleEventHandler.connect = function(channel, filter) {
      this.remote = RemoteByWebInspector.new('consoleRemote');
      this.index = EventIndex.new();
      this.remote.connect(channel, this);
	  return this.remote.Console.enable();
  };
  
  consoleEventHandler.disconnect = function(channel) {
      var disabled = this.remote.Console.disable();
      // Q.when(disabled
      this.remote.disconnect(channel);
      delete this.index;
  };

  thePurple.registerPart(consoleEventHandler);

  return consoleEventHandler;
});