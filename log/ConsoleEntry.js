// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate'], function (domplate) {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  
  function ConsoleEntry(message) {
    //  http://code.google.com/chrome/devtools/docs/protocol/0.1/console.html#type-ConsoleMessage
    this.message = message;
  }
  
  ConsoleEntry.prototype = {};
  
  //  http://code.google.com/chrome/devtools/docs/protocol/0.1/console.html#type-ConsoleMessage

  with(domplate.tags) {
    ConsoleEntry.messageClearedEntry = {
      domplateTag: domplate.domplate({
        tag: DIV({'class':'consoleCleared'}, "Console Cleared")
      })
    };
  
    ConsoleEntry.prototype.domplateTag = domplate.domplate({
      tag: DIV({'class': 'consoleEntry '}, '$message.text')
    });
  }
  
  return ConsoleEntry;
});