// Purple side of the message channel for browser events
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

/*globals define console window getChromeExtensionPipe */

// This constant contains a digest of the public key for crx2app
var iframeDomain ="chrome-extension://bbjpappmojnmallpnfgfkjmjnhhplgog";

define(['../lib/q/q', 'lib/part', 'lib/Assembly', iframeDomain+"/appEnd/proxyChromePipe.js"], 
function(         Q, PurplePart,       Assembly,                                chromePipe) {

  var channel = new PurplePart('channel');

  // this function comes from the non-AMD file proxyChromePipe.js
  var connection = getChromeExtensionPipe(iframeDomain);
 
  function loadIframe(url, parentSelector) {
    var iframe = window.document.createElement('iframe');
    iframe.setAttribute('src', url);
    var elt = window.document.querySelector(parentSelector);
    elt.appendChild(iframe);
    return iframe;
  }
  /*
   * In:
   * channel.protocolName: string recognized by browser proxy
   * channel.version: number possibly matched by browser proxy
   * channel.recv: function(message) called on each message
   * Out:
   * channel.send: function(message) callable 
   */
  function promiseChannel(channel) {
    var deferred = Q.defer();
    
    connection.attach(function onConnectedToChrome() {
      console.log("channelByPostMessage.attach");
      
      channel.onmessage = channel.recv.bind(channel);
      connection.addListener(channel.onmessage);
      channel.send = connection.postMessage; 

      channel.features.push('channel');
      // ok we are ready to connect the dependents and let them talk
      deferred.resolve(channel);
    });  
    // dynamically load the chromeIframe, it will connect and fire the callback
    // (if we load the iframe statically, the iframe load event will have fired
    loadIframe(iframeDomain + "/appEnd/chromeIframe.html", "body");
    
    return deferred.promise;
  }
  
  Assembly.addListenerContainer(channel);
  
  channel.recv = function(data) {
    var p_id = channel.thePurple.p_id++;
    channel.toEachListener([p_id, data]);
  };
  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  channel.initialize = function(thePurple) {
      this.protocolName ='IAmPurple';
      this.version = 1;
      this.thePurple = thePurple;
  };
  
  channel.connect = function() {
      return promiseChannel(this);
  };

  channel.disconnect = function() {
    var channel = this;
    if (channel.port) {
      channel.port.close();
    } else {
      window.removeEventListener('message', channel.onmessage, false);
    }
  };
  
  channel.implementsFeature('channel');
  
  return channel;
});
