// Purple side of the message channel for browser events
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


(function() {
  var thePurple = window.purple; 
  var Assembly = thePurple.Assembly;
  var channel__ = new thePurple.PurplePart('channel');
  

  Assembly.addPartContainer(channel__);  
  
  channel__.recv = function(message) {
    this.toSomeParts('recv', [message]);
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
      console.log("channelByPostMessage.recvPort "+event.origin, event);
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
  
  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  channel__.featureImplemented = function(feature) {
    console.log("channel featureImplement called with feature", feature);
    if (feature.name === 'load') {
      this.protocolName ='IAmPurple';
      this.version = 1;
      console.log("Calling Browser.connect");
      Browser.connect(this);
    }
  };

  channel__.featureUnimplemented = function(feature) {
    if (feature.name === 'load') {
      Browser.disconnect(this);
    }
  };
  
  thePurple.registerPart(channel__);
  
}());
