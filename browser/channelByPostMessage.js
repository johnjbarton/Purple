// Purple side of the message channel for browser events
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['../lib/q/q'], function(Q) {
  var thePurple = window.purple; 
  var Assembly = thePurple.Assembly;
  var channel__ = new thePurple.PurplePart('channel');

  Assembly.addListenerContainer(channel__);
  
  channel__.recv = channel__.toEachListener;
  
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
  Browser.connect = function connectToBrowser(channel, onConnect) {
 
    function recvPort(event) {
      console.log("channelByPostMessage.recvPort "+event.origin, event);
      if (!event.data.indexOf || event.data.indexOf(channel.protocolName) !== 0) {
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
      channel.features.push('channel');
      // ok we are ready to connect the dependents and let them talk
      var promiseEnabled = onConnect(channel);
      Q.when(promiseEnabled, function releasePage() {
        channel.send({command: 'releasePage'});
      });
    }  
    
    function requestPort() {
      if (window.parent !== window) { // we are an iframe
        // listen for parent window messages
        window.addEventListener('message', recvPort, false);
        // tell our parent we are loaded
        var proxyClientHello = channel.protocolName+' '+channel.version;
        console.log("send proxyClientHello "+proxyClientHello +" to parent of "+window.location);
        window.parent.postMessage(proxyClientHello, "*"); 
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
  channel__.initialize = function() {
      this.protocolName ='IAmPurple';
      this.version = 1;
  };
  
  channel__.connect = function(onConnect) {
      console.log("Calling Browser.connect");
      Browser.connect(this, onConnect);
  };

  channel__.destroy = function() {
      Browser.disconnect(this);
  };
  
  channel__.implementsFeature('channel');
  thePurple.registerPart(channel__);
  
  return channel__;
});
