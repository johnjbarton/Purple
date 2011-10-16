// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['ConsoleEntry'], function(ConsoleEntry) {
  
  'use strict';
  var thePurple = window.purple;
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var EventLogViewport =  new thePurple.PurplePart('EventLogViewport');  // 
  
  EventLogViewport.initialize = function() {
    this.viewPort = {
      rendered: { // these values are controlled by RenderedLines
        first: 0,
        last: 0
      },
      visible: {  // these values are controled by VisibleLines
        first: 0,
        last: 0
      },
    }
  }
    
  EventLogViewport.connect = function(eventLog) {
      this.initializeUI();
      this.sourceLog = eventLog
      this.sourceLog.registerPart(this);
      this.update();
  };

  EventLogViewport.disconnect = function(eventLog) {
    if (this.sourceLog && this.sourceLog === eventLog) {
      this.sourceLog.unregisterPart(this);
      delete this.sourceLog;
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
    renderToHTML: function(event) {
      var div = this.container.ownerDocument.createElement('div');
      try {
        if (event && event.domplateTag) {
          event.domplateTag.tag.replace(event, div, event.domplateTag);
        } else {
          return;
          div.innerHTML = this.renderToString(event);
        }
      } catch (exc) {
          ConsoleEntry.InternalExceptionTag.tag.replace(exc, div, ConsoleEntry.InternalExceptionTag);
      }
      return div;
    },
    renderToString: function(event) {
      var str = "";
      if(event.toString() === '[object MessageEvent]') {
        str = event.type +" event " + this.summary(event.data);
      } else {
        str = 'Not a MessageEvent,' + this.summary(event);
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
  
  EventLogViewport.onClick = function(event) {
    console.log("click:", event);
    var link = event.target.link;
    if (link && link.source) {
      var target = null;
      thePurple.forEachPart(function findTarget(part) {
        if (part.hasFeature('editor')) {
          target = part;
          return true;
        }
      });
      if (target) {    
        target.open(link.source);
      } else {
        throw new Error("No "+link.target+" found");
      }
    }
  };
  
  EventLogViewport.bindHandlers = function() {
    this.onClick = this.onClick.bind(this);
  };
  
  EventLogViewport.addListeners = function() {
    document.addEventListener('click', this.onClick, true);
  };
      
  EventLogViewport.initializeUI = function () {
    var logElement = document.getElementById('log');
    logElement.style.overflowY = 'scroll';
    renderedLines.connect(logElement);
    
    this.bindHandlers();
    this.addListeners();
  };

  EventLogViewport.dataAppended = function(data, index) {
    renderedLines.append(data, index);
  };
  
  EventLogViewport.update = function() {
  
  };
  
  // ---------------------------------------------------------------------------------
  
  
  return EventLogViewport;
  
});