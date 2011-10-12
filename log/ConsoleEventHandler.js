// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../browser/remoteByWebInspector', '../resources/Resources', 'ConsoleEntry'], 
  function (remoteByWebInspector, Resources, ConsoleEntry) {
  var thePurple = window.purple;
  
  var consoleEventHandler = new thePurple.PurplePart('consoleEventHandler');
  
  //---------------------------------------------------------------------------------------------
  // Implement Remote.events
  
  consoleEventHandler.responseHandlers = {
    Console: {
        messageAdded: function(message) {
          consoleEventHandler.latestEntry = new ConsoleEntry(message);
          consoleEventHandler.logger.apply(null, [consoleEventHandler.latestEntry]);
        },
        messageRepeatCountUpdated: function(count) {
          consoleEventHandler.latestEntry.updateCount(count);
        },
        messagesCleared: function() {
          consoleEventHandler.latestEntry = ConsoleEntry.messagesClearedEntry;
          consoleEventHandler.logger.apply(null, [consoleEventHandler.latestEntry]);
        }
      }
  };
  
   //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  
  consoleEventHandler.connect = function(channel) {
      this.remote = remoteByWebInspector.create('consoleRemote', this.responseHandlers);
      this.remote.connect(channel);
      this.logger = channel.recv.bind(channel);
	  this.remote.Console.enable();
  };
  
  consoleEventHandler.disconnect = function(channel) {
      this.remote.console.disable();
      this.remote.disconnect(channel);
  };

  thePurple.registerPart(consoleEventHandler);

  return consoleEventHandler;
});