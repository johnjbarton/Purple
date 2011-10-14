// Purple side of the message channel for browser events
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


(function() {
  var thePurple = window.purple; 
  var Assembly = thePurple.Assembly;
  var channelByMessageChannel = new thePurple.PurplePart();
  var channel__ = channelByMessageChannel;
  
  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  channel__.initialize = function(thePurple) {
    this.name ='IAmPurple';
    this.version = 1;
    console.log("Calling Browser.connect");
    Browser.connect(this);
  };

  channel__.destroy = function(thePurple) {
    Browser.disconnect(this);
  }
  
  Assembly.addPartContainer(channel__);  
  
  channel__.recv = function(message) {
    this.toSomeParts('recv', [message]);
  }
  
  thePurple.Browser = {};
  var Browser = thePurple.Browser;
  
  /*
   * In:
   * channel.name: string recognized by browser proxy
   * channel.version: number possibly matched by browser proxy
   * channel.recv: function(message) called on each message
   * Out:
   * channel.send: function(message) callable 
   */
  Browser.connect = function connectToBrowser(channel) {
 
    function recvPort(event) {
      console.log("channel.recvPort ", event);
      if (event.data.indexOf(channel.name) !== 0) {
        return; // not for us
      }
      if (event.ports) {
        window.removeEventListener('message', recvPort, false);
        channel.port = event.ports[0];
        channel.port.onmessage = channel.recv.bind(channel);
        channel.send = function(message) { this.port.postMessage(message); };
        channel.features.push('channel');
      } else {
        console.error("connectToBrowser requires ports from proxy");
      }
    }  
    
    function requestPort() {
      if (window.parent !== window) { // we are an iframe
        window.addEventListener('message', recvPort, false);
        window.parent.postMessage(channel.name+' '+channel.version, "*"); // tell our parent we are loaded
        return true;
      } else {
        console.error("connectToBrowser must be included in an iframe");
        return false;
      }
    }
    
    return requestPort();
  };
  
  Browser.disconnect = function (channel) {
    channel.port.close();
  };
  
  thePurple.registerPart(channel__);
  
}());
