// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate'], function (domplate) {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  
  
  //  http://code.google.com/chrome/devtools/docs/protocol/0.1/console.html#type-ConsoleMessage

  with(domplate.tags) {

    ConsoleEntryRep = domplate.domplate({
      tag: DIV({'class': 'console-$object.message.type hasMore', 'onclick': '$object.rep.toggleMore'}, '$object.message.text',
        TABLE({'class':'callStack'},
          FOR('frame', '$object.message.stack|getFrames',
            TR({'class':'callStackFrame'}, 
              TD('$frame.functionName'),
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
        return stack;
      },
      
      getResourceName: function(url) {
        var splits = url.split('/');
        return splits.slice(-1);
      }

    });
    
    ConsoleEntryRep.messagesClearedEntryRep = domplate.domplate({
        tag: DIV({'class':'consoleCleared'}, "Console Cleared")
      });
    
    ConsoleEntryRep.InternalExceptionTag = domplate.domplate(
      ConsoleEntryRep,
      {
      tag: DIV({'class': 'console-error internalError hasMore', 'onclick': '$toggleMore'}, '$object.message',
        TABLE({'class':'callStack'},
          FOR('frame', '$object.stack|getFrames',
            TR({'class':'callStackFrame'}, 
              TD('$frame.fnName'),
              TD({'class':'objectLink', 'title':'$frame.url'},
                 '$frame.url|getResourceName'
              )
            )      
          )
        )
      ),
      getFrames: function(stack) {
        // The internal errors has a funky string stack
        var frames = [];
        var frameStrings = stack.split('\n');
        // zeroth entry is exception message
        for (var i = 1; i < frameStrings.length; i++) {
          var frame = {};
          //eg:     at Object.<anonymous> (eval at <anonymous> (http://localhost:8080/file/f/lib/domplate/lib/domplate.js:482:34))
          var frameString = frameStrings[i];
          var splits = frameString.split(/\s/);
          frame.functionName = splits.slice(5,-1).join(' ');
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
      
    });
  }
  
  return ConsoleEntryRep;
});