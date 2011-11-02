// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate', '../resources/BaseRep', '../resources/Resources'], function (domplate, BaseRep, Resources) {
  
  //  http://code.google.com/chrome/devtools/docs/protocol/0.1/console.html#type-ConsoleMessage

  with(domplate.tags) {
    var StackFrameRep =  domplate.domplate(
      BaseRep, 
      {
        stackFrameTag:
              TR({'class':'callStackFrame', }, 
                TD('$object|getFunctionName'),
                TD({'title':'$object|getURL', 'class': '$object|getPartLinkClass'},
                   BaseRep.makePARTLINK(BaseRep)('$object|getResourceName')
                )
              ),
        name: "StackFrameRep",
      });
      
    ConsoleEntryRep = domplate.domplate(
      StackFrameRep,
      {
      tag: DIV({'class': 'console-$object.message.level'},
        DIV({'class': 'linkedText $object|hasMore', 'onclick': '$toggleMore'},
          SPAN('$object.message.text'),
          SPAN({'title':'$object|getURL', 'class': 'messageLink $object.message|getPartLinkClass'},
                   BaseRep.makePARTLINK(this)('$object|getResourceName')
          )
        ),
        TABLE({'class':'callStack'},
          TBODY(
            FOR('frame', '$object.message|getFrames',
              TAG(StackFrameRep.stackFrameTag, {object: '$frame'})
            )
          )
        )
      ),
      getURL: function(object) {
        return object.url || (object.message ? object.message.url : '');
      },
      toggleMore: function(event) {
        var target = event.currentTarget;  // the element with the handler
        target.classList.toggle('hadMore');
        target.classList.toggle('hasMore');
      },
      hasMore: function(object) {
        return this.getFrames(object.message).length ? 'hasMore' : '';
      },
      getFrames: function(consoleMessage) {
        return consoleMessage.stackTrace || [];
      },
      
      getFunctionName: function(frame) {
        return frame.functionName;
      },
      getPartLinkClass: function(object) {
        var url = object.url;
        var resource = Resources.get(url);
        return (resource && resource.hasSource) ? 'partLink' : '';
      },
      getResourceName: function(object) {
        var url = this.getURL(object);
        var splits = url.split('/');
        return splits.slice(-1);
      },
      getLineNumber: function(object) {
        return object.message.line;
      },
      name: 'ConsoleEntryRep',

    });
    
    ConsoleEntryRep.messagesClearedEntryRep = domplate.domplate({
        tag: DIV({'class':'consoleCleared'}, "Console Cleared")
      });
    
    ConsoleEntryRep.InternalExceptionTag = domplate.domplate(
      ConsoleEntryRep,
      {
      tag: DIV({'class': 'console-error internalError hasMore', 'onclick': '$toggleMore'}, '$object.message',
        TABLE({'class':'callStack'},
          TBODY (
            FOR('frame', '$object|getFrames',
              TAG(StackFrameRep.stackFrameTag, {object: '$frame'})
            )
          )
        )
      ),
      getFrames: function(message) {
        var stack = message.stack;
        // The internal errors has a funky string stack
        var frames = [];
        if (!stack) {
          return frames;
        }
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
