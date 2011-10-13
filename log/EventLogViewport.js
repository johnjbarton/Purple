// PurplePart recv message and create log
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define([], function() {
  
  'use strict';
  var thePurple = window.purple;
  var Browser = thePurple.Browser;
  var Renderer = {
    'debugger': function(data) {
      var params = data.params ? Object.keys(data.params).join(',') : "";
      return "debugger."+data.name+"("+params+")";
    },
    'webNavigation': function(data) {
      var params = data.params ? Object.keys(data.params).join(',') : "";
      return "webNavigation."+data.name+"("+params+")";
    }
  };

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
      this.container.appendChild(dataView);
    },
    renderToHTML: function(event) {
      var innerHTML = "";
      try {
        if (event && event.domplateTag) {
          innerHTML = event.domplateTag.tag.render(event);
        } else {
          innerHTML = this.renderToString(event);
        }
      } catch (exc) {
          innerHTML = exc.toString();
      }
      var div = this.container.ownerDocument.createElement('div');
      div.innerHTML = innerHTML;
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
  
      
  EventLogViewport.initializeUI = function () {
    var logElement = document.getElementById('log');
    logElement.style.overflowY = 'scroll';
    renderedLines.connect(logElement);
  };

  EventLogViewport.dataAppended = function(data, index) {
    renderedLines.append(data, index);
  };
  
  EventLogViewport.update = function() {
  
  };
  
  // ---------------------------------------------------------------------------------
  
  
  return EventLogViewport;
  
});