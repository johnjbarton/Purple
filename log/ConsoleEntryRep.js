// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/domplate/lib/domplate', 'resources/PartLinkRep', 'resources/Resources', 'lib/reps',  'lib/Rep'], 
function (                    domplate,                PartLinkRep,                Resources,         Reps,           Rep) {
  
  with(domplate.tags) {
    var StackFrameRep =  domplate.domplate(
      PartLinkRep, 
      {
        tag:  // the property |tag| is special, see domplate isTag()
              TR({'class':'callStackFrame', }, 
                TD('$object|getFunctionName'),
                TD({'title':'$object|getTooltipText'},
                   TAG(PartLinkRep.tag, {object:'$object'})
                )
              ),

        getFunctionName: function(frame) {
          return frame.functionName;
        },

        getTooltipText: function(object) {
          var line = this.getLineNumber(object);
          return this.getURL(object)+(line ? ('@'+line) : "");
        },
      
        name: "StackFrameRep",
        
        getRequiredPropertyNames: function() {
          return ['url', 'functionName']
        }
      }
    );
    Reps.registerPart(StackFrameRep);

    //  http://code.google.com/chrome/devtools/docs/protocol/0.1/console.html#type-ConsoleMessage

    var ConsoleEntryRep = domplate.domplate(
      Rep,
      {
      tag: DIV({'class': 'console-$object.message.level'},
        DIV({'class': 'linkedText $object|hasMore', 'onclick': '$toggleMore'},
          IMG({'class':'closedTwisty', 'src':"../ui/icons/from-firebug/twistyClosed.png"}),
          IMG({'class':'openedTwisty', 'src':"../ui/icons/from-firebug/twistyOpen.png"}),
          SPAN('$object.message.text'),
          SPAN({'title':'$object|getTooltipText', 'class': 'messageLink'},
            TAG(PartLinkRep.tag, {object:'$object'})
          )
        ),
        TABLE({'class':'callStack'},
          TBODY(
            FOR('frame', '$object.message|getFrames',
              TAG(StackFrameRep.tag, {object: '$frame'})
            )
          )
        )
      ),
      getURL: function(object) {
        if (object.url) {
          return object.url;
        }
        if (object.message) { 
          if (object.message.url) {  
            return object.message.url;  
          } else {  // missing or blank
            if (object.message.stackTrace) {
              return object.message.stackTrace[0] && object.message.stackTrace[0].url;
            }
          }
        }
        console.log("getURL fails for %o", object);
        return "(no URL)";
      },
      getTooltipText: function(object) {
        return this.getURL(object);
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
      getLineNumber: function(object) {
        return object.message && object.message.line;
      },
      name: 'ConsoleEntryRep',
      getRequiredPropertyNames: function() {
        return ['message'];
      },
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
              TAG(StackFrameRep.tag, {object: '$frame'})
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
          if (frameString.indexOf('    at') === 0) {
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
        }
        return frames;
      },
    });
  }
  
  Reps.registerPart(ConsoleEntryRep);
  
  return ConsoleEntryRep;
});
