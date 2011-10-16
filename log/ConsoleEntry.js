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
    ConsoleEntry.messagesClearedEntry = {
      domplateTag: domplate.domplate({
        tag: DIV({'class':'consoleCleared'}, "Console Cleared")
      })
    };
  
    ConsoleEntry.prototype.domplateTag = domplate.domplate({
      tag: DIV({'class': 'consoleEntry '}, '$message.text')
    });
    
    ConsoleEntry.InternalExceptionTag = domplate.domplate({
      tag: DIV({'class': 'internalError hasMore', 'onclick': '$toggleMore'}, '$message',
        TABLE({'class':'callStack'},
          FOR('frame', '$stack|getFrames',
            TR({'class':'callStackFrame'}, 
              TD('$frame.fnName'),
              TD({'class':'objectLink', 'title':'$frame.url'},
                 '$frame.url|getResourceName'
              )
            )      
          )
        )
      ),
      toggleMore: function(event) {
        var target = event.currentTarget;  // the element with the handler
        target.classList.toggle('hadMore');
        target.classList.toggle('hasMore');
      },
      getFrames: function(stack) {
        var frames = [];
        var frameStrings = stack.split('\n');
        // zeroth entry is exception message
        for (var i = 1; i < frameStrings.length; i++) {
          var frame = {};
          //eg:     at Object.<anonymous> (eval at <anonymous> (http://localhost:8080/file/f/lib/domplate/lib/domplate.js:482:34))
          var frameString = frameStrings[i];
          var splits = frameString.split(/\s/);
          frame.fnName = splits.slice(5,-1).join(' ');
          var fileArea = splits.slice(-1)[0];
          var m = /\(([^\)]*)\)/.exec(fileArea);
          var colonSplits = m[1].split(':');
          frame.url = colonSplits.slice(0, -2).join('');
          frame.lineNumber = colonSplits.slice(-2, -1)[0];
          frame.columnNumber = colonSplits.slice(-1)[0];
          frames.push(frame);
        }
        return frames;
      },
      getResourceName: function(url) {
        var splits = url.split('/');
        return splits.slice(-1);
      }
    });
  }
  
  return ConsoleEntry;
});