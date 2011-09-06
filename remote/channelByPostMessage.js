// Purple side of the message channel for browser events
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


(function() {
  var thePurple = window.purple; 
  var Assembly = thePurple.Assembly;
  var channelByPostMessage = new thePurple.Feature();
  var channel__ = channelByPostMessage;
  
  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  channel__.initialize = function(thePurple) {
    this.protocolName ='IAmPurple';
    this.version = 1;
    console.log("Calling Browser.connect");
    Browser.connect(this);
  };

  channel__.destroy = function(thePurple) {
    Browser.disconnect(this);
  }
  
  Assembly.addPartContainer(channel__);  
  
  channel__.recv = function(message) {
    this.someParts('recv', [message]);
  }
  
  thePurple.Browser = {};
  var Browser = thePurple.Browser;
  
  /*
   * In:
   * channel.protocolName: string recognized by browser proxy
   * channel.version: number possibly matched by browser proxy
   * channel.recv: function(message) called on each message
   * Out:
   * channel.send: function(message) callable 
   */
  Browser.connect = function connectToBrowser(channel) {
 
    function recvPort(event) {
      // Apparently we cannot check event.origin === ourParentLocation 
      var pLoc = window.parent.location;  // this is a bogus object.
      var ourParentOrigin = pLoc.protocol+'//'+pLoc.host+(pLoc.port ? ":"+pLoc.port : "");
      console.log("channel.recvPort ourOrigin: "+ourParentOrigin, event);
      if (event.data.indexOf(channel.protocolName) !== 0) {
        return; // not for us
      }
      window.removeEventListener('message', recvPort, false);
      if (event.ports && event.ports.length) {
        channel.port = event.ports[0];
        channel.port.onmessage = channel.recv.bind(channel);
        channel.send = function(message) { this.port.postMessage(message); };
      } else {
        // no MessageChannel support I guess.
        channel.onmessage = channel.recv.bind(channel);
        channel.source = event.source;
        channel.origin = event.origin; 
        window.addEventListener('message', channel.onmessage, false);
        channel.send = function(message) { 
          channel.source.postMessage(message, channel.origin); 
        };
      }
      thePurple.implementFeature('channel', channel);
    }  
    
    function requestPort() {
      if (window.parent !== window) { // we are an iframe
        window.addEventListener('message', recvPort, false);
        window.parent.postMessage(channel.protocolName+' '+channel.version, "*"); // tell our parent we are loaded
        return true;
      } else {
        console.error("connectToBrowser must be included in an iframe");
        return false;
      }
    }
    
    return requestPort();
  };
  
  Browser.disconnect = function (channel) {
    if (channel.port) {
      channel.port.close();
    } else {
      window.removeEventListener('message', channel.onmessage, false);
    }
  };
  
  thePurple.registerPart(channel__);
  
}());
