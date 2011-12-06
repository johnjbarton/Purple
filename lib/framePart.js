// Loads an iframe and returns a promise for {feature}
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global define window */

define(['lib/Base', 'lib/q/q', 'editor/editorCompilerAssembly'], function (Base, Q, editorCompilerAssembly) {

  var framePart = Base.extend({
    _getFrameId: function() {
      var creationTime = new Date().getTime();
      return "purple_"+creationTime;
    },
  
    _postIdOnLoad: function(iframe, iframeId) {
      function awaitLoad(event){
        iframe.contentWindow.postMessage({iframeId: iframeId});
        iframe.removeEventListener('load', awaitLoad, false);
      }
      iframe.addEventListener('load', awaitLoad, false);
    },
  
    _promiseLoadedFrameMessage: function(iframe, iframeId) {
      var defer = Q.defer();
      function awaitHello(event) {
        if (event.data.iframeId === iframeId) {
          window.removeEventListener('message', awaitHello, false);
          defer.resolve(iframe.contentWindow[event.data.purpleFramePart]);
        }
      }
      window.addEventListener('message', awaitHello, false);

      return defer.promise;
    },
  
    promisePart: function(src, insertAfterElement) {
      var iframe = insertAfterElement.ownerDocument.createElement('iframe');

      var iframeId = this._getFrameId();
      this._postIdOnLoad(iframe, iframeId);
      
      iframe.setAttribute('src', src);
      insertAfterElement.parentElement.insertBefore(iframe, insertAfterElement.nextSibling);
      
      return this._promiseLoadedFrameMessage(iframe, iframeId);
    }
  });

  return framePart;
});