// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['log/ConsoleEntryRep','../resources/objRep','lib/reps' ], function(ConsoleEntryRep, ObjRep, reps) {
  
  'use strict';
  var thePurple = window.purple;
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var EventLogViewport =  new thePurple.PurplePart('EventLogViewport');  // 
  
  EventLogViewport.initialize = function() {
    this.scrollLock = false; // false means the viewport tracks the bottom of the log
    this.onPoll = this.poll.bind(this);
    this.pollInterval = 100;
    
    this.viewport = {
      rendered: { // these values are controlled by RenderedLines
        first: 0,
        last: 0
      },
      visible: {  // these values are controled by VisibleLines
        first: 0,
        last: 0
      },
    }
    reps.rehash();
  }
    
  EventLogViewport.connect = function(eventLog) {
      this.initializeUI();
      this.log = eventLog
      if (this.optionPolling) {
        this.beginPolling();
      } else {
        this.endPolling();
      }
      this.update();
  };

  EventLogViewport.disconnect = function(eventLog) {
    if (this.log && this.log === eventLog) {
      this.endPolling();
      this.log.unregisterPart(this);
      delete this.log;
      delete this.viewport;
    } 
  };
  
  thePurple.registerPart(EventLogViewport);
  window.addEventListener('pagehide', function() {
    thePurple.unregisterPart(EventLogViewport);
  }, false);
  
  // -----------------------------------------------------------------------------------
  EventLogViewport.computeLineHeight = function() {
    return 14;
  };
  
  var renderedLines = {
    first: 0,
    total: 0,
    connect: function(elt) {
      this.container = elt;
    },
    isRendered: function(index) {
      return (index >= this.first && index < this.first + this.total); 
    },
    append: function(data, index) {
      var dataView = this.renderToHTML(data);
      if (dataView) {
        this.container.appendChild(dataView);
      } 
    },
    renderToHTML: function(object) {
      var div = this.container.ownerDocument.createElement('div');
      try {
        var rep;
        if (object && object.rep) {
          rep = object.rep;
        } else {
          rep = reps.getRepByObject(object);
        }
        // The rep tags are 'controllers/views', $object is their model
        // tag.subject is set by domplate() to the tag, use the default here
        var tag = rep.shortTag || rep.tag;
        tag.replace({object: object}, div);
      } catch (exc) {
          ConsoleEntryRep.InternalExceptionTag.tag.replace({object: exc}, div, ConsoleEntryRep.InternalExceptionTag);
      }
      return div;
    },
    renderToString: function(object) {
      var str = "";
      if(object.toString() === '[object MessageEvent]') {
        str = object.type +" event " + this.summary(object.data);
      } else {
        str = 'Not a MessageEvent,' + this.summary(object);
      }
      return str;
    },
    summary: function(obj) {
      if (!obj) {
        return 'falsy';
      } 
      var objType = typeof obj;
      if (objType === 'string') {
        return obj;
      }
      if (objType !== 'object') {
        return objType;
      }
      var keys = Object.keys(obj);
      var str = '{' + keys.join(',')+'}';
      if (str.length < 100) {
        var sub = [];
        keys.forEach(function (key) {
          sub.push( key+':'+renderedLines.summary(obj[key]) );
        });
        str = '{' + sub.join(',') +'}';
      }
      return str;
    }
  };
  
  EventLogViewport.initializeUI = function () {
    var logElement = document.getElementById('log');
    renderedLines.connect(logElement);
  };

  EventLogViewport.pullEntry = function(index) {
    var data = this.log.get(index);
    renderedLines.append(data, index);
  };

  EventLogViewport.update = function() {
    if (!this.scrollLock) {
      var logMax = this.log.max();
      var last = this.viewport.visible.last; 
      // work bottom up and stop once we fill the viewport
      for (var ndx = (logMax - 1); ndx > last; ndx--) {
        this.pullEntry(ndx);
      }
    }
  };
  
  EventLogViewport.appendData = function (data, index) {
    this.update();
  }
  
  EventLogViewport.poll = function(event) {
    console.log("EventLogViewport poll", event);
    this.update();
  };
  
  EventLogViewport.beginPolling = function() {
    this.log.unregisterPart(this);
    this.pollingId = window.setInterval(this.onPoll, this.pollInterval);
  };
  
  EventLogViewport.endPolling = function() {
    if (this.pollingId) {
      window.clearInterval(this.pollId);
    }
    this.log.registerPart(this);
  };
  
  // ---------------------------------------------------------------------------------
  
  
  return EventLogViewport;
  
});