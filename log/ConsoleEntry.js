// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../log/ConsoleEntryRep'], 
function (domplate,                     ConsoleEntryRep) {
  
  function ConsoleEntry(message) {
    //  http://code.google.com/chrome/devtools/docs/protocol/0.1/console.html#type-ConsoleMessage
    this.message = message;
    if (message.stackTrace) {
      this.message.stack = message.stackTrace;
    }
    this.rep = ConsoleEntryRep;
  }
  
  ConsoleEntry.messagesClearedEntry = new ConsoleEntry("");
  ConsoleEntry.messagesClearedEntry.rep = ConsoleEntryRep.messagesClearedEntryRep;
  
  return ConsoleEntry;
});