// Purple Extension Monitor WebNavigation part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function () {

window.MonitorChrome = window.MonitorChrome || {};
var MonitorChrome = window.MonitorChrome;
var WebNavigation = MonitorChrome.WebNavigation = {
   events: Object.keys(chrome.experimental.webNavigation) // all for now
};

WebNavigation.onEvent = function(proxy, name, details) {
  proxy.send({source: "webNavigation", name: name, details: details});
};

WebNavigation.hookWebNavigation = function(proxy) {
  this.events.forEach(function delegate(eventName) {
    WebNavigation[eventName] = WebNavigation.onEvent.bind(WebNavigation, proxy, eventName);
  });
};

WebNavigation.connect = function() {
  this.events.forEach(function addListeners(event) {
    if (event[0] === 'o' && event[1] === 'n') {
      chrome.experimental.webNavigation[event].addListener(WebNavigation[event].bind(WebNavigation));
    }
  });
};

}());