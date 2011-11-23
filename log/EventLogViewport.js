// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['log/consoleEntryRep','../resources/objRep','lib/reps', 'lib/Assembly', 'lib/part' ], 
function(ConsoleEntryRep, ObjRep, reps, Assembly, PurplePart) {
  
  'use strict';
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var EventLogViewport =  new PurplePart('EventLogViewport');  // 
  
  Assembly.addPartContainer(EventLogViewport);
  
  EventLogViewport.initialize = function() {
    this.scrollLock = false; // false means the viewport tracks the bottom of the log
    this.onPoll = this.poll.bind(this);
    this.pollInterval = 100;
    
    reps.rehash();
  };
    
  EventLogViewport.connect = function(log) {
    log.registerPart(this); // for appendData notification that drive input to output (for now)
    
    this.initializeUI();
    if (this.optionPolling) {
      this.beginPolling();
    } else {
      this.endPolling();
    }
    this.update();
  };

  EventLogViewport.disconnect = function() {
      this.endPolling();
  };
  
  // Extend Assembly methods
  
  var superRegisterPart = EventLogViewport.registerPart;
  EventLogViewport.registerPart = function(part) {
    superRegisterPart.apply(this, [part]);
    this.toggleClass(part.name, true);
  };
  
  var superUnregisterPart = EventLogViewport.unregisterPart;
  EventLogViewport.unregisterPart = function(part) {
    superUnregisterPart.apply(this, [part]);
    this.toggleClass(part.name, false);
  };
  
  EventLogViewport.toggleClass = function(name, on) {
    var logElt = document.getElementById('log');
    if (on) {
      logElt.classList.add(name);
    } else {
      logElt.classList.remove(name);
    }
  };
  
  // -----------------------------------------------------------------------------------
  EventLogViewport.computeLineHeight = function() {
    return 14;
  };
  
  var renderedLines = {
    connect: function(elt) {
      this.container = elt;
    },
    append: function(data, p_id) {
      var dataView = this.renderToHTML(p_id, data);
      if (dataView) {
        // debug
        var p_id_div = this.container.ownerDocument.createElement('span');
        p_id_div.classList.add('p_id');
        p_id_div.innerHTML = p_id;
        dataView.insertBefore(p_id_div, dataView.firstChild);
        this.container.appendChild(dataView);
      } 
    },
    clear: function() {
      this.container.innerHTML = "";  // do we need to worry about event listeners leaking?
      this.lastPID = 0;
    },
    renderToHTML: function(p_id, object) {
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
          consoleEntryRep.InternalExceptionTag.tag.replace({object: exc}, div, consoleEntryRep.InternalExceptionTag);
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

  //-------------------------------------------------------
  // Query the indexes for entries from event p_id that match the constraints.
  EventLogViewport.pullEntry = function(p_id) {
    var constraint = {  // TODO from findAnything
      matches: function(entry) {
        return true;
      }
    };
    // We want to visit each index so they all can contribute items from p_id.
    // p_id is a proxy for 'time': 
    //   every log entry that can ever appear in the viewport must have a p_id
    //   p_id increase monotonically
    //   an index may or may not have an entry for a p_id
    this.forEachPart(function filterAndAppendMatches(index) {
      var indexEntry = index.get(p_id);
      if (indexEntry) {
        if(constraint.matches(indexEntry)) {
            renderedLines.append(indexEntry, p_id);
        }
      }
    });
  };

  EventLogViewport.update = function() {
    if (!this.scrollLock) {
      var max = window.purple.p_id; // TODO via initialize
      var last = renderedLines.lastPID; 
      // work bottom up and stop once we fill the viewport
      for (var ndx = last; ndx <= max; ndx++) {
        this.pullEntry(ndx);
      }
      renderedLines.lastPID = max;
    }
    delete this.queueUpdate;
  };
  
  EventLogViewport.rebuild = function() {
    renderedLines.clear();
    this.update();
  }
  
  EventLogViewport.boundUpdate = EventLogViewport.update.bind(EventLogViewport);
  
  EventLogViewport.appendData = function (data, p_id) {
    if (!this.queueUpdate) {
      this.queueUpdate = EventLogViewport.boundUpdate;
      window.setTimeout(this.queueUpdate);
    }
  };
  
  EventLogViewport.poll = function(event) {
    console.log("EventLogViewport poll", event);
    this.update();
  };
  
  EventLogViewport.beginPolling = function() {
    this.pollingId = window.setInterval(this.onPoll, this.pollInterval);
  };
  
  EventLogViewport.endPolling = function() {
    if (this.pollingId) {
      window.clearInterval(this.pollId);
    }
  };
  
  // ---------------------------------------------------------------------------------
  
  
  return EventLogViewport;
  
});