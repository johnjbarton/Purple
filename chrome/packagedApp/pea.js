// Purple Extension Adapter, part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

var WebAppManager = (function () {

  var WebAppManager = {
    purpleTargetID: 6565259,
  };

  WebAppManager.initialize = function() {
    // TODO read options from localStorage
  };

  WebAppManager.destroy = function() {
    // TODO flush options to localStorage
  };

  WebAppManager.loadTargetApp = function(url) {
    // random int between purple and 2 * purple
    var targetID = Math.floor(WebAppManager.purpleTargetID * (Math.random() + 1.0) );
    var createData = {
      url: url,
      tabId: WebAppManager.purpleTargetID, 
      focused: false,
      type: normal,
    };
    chrome.windows.create(createData, function onCreated(win) {
      console.log("created window for web app "+url, win);
    });
  };

}());

function loadWebApp(event) {
  var urlInput = document.getElementById('webAppURL');
  var url = urlInput.value;
  WebAppManager.loadWebApp(url);
}

function wireButton(event) {
  window.removeEventListener('load', wireButton, false);
  var button = document.getElementById('loadWebApp');
  button.addEventListener('click', loadWebApp, true);
}

window.addEventListener('load', wireButton, false);
