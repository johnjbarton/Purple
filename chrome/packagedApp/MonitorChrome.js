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

var Debugger = MonitorChrome.Debugger = function(proxy, tabId, handleError){
  this.proxy = proxy;
  this.tabId = tabId; // eg from chrome.windows.create() callback
  this.reportError = function () {
    if(chrome.extension.lastError) {
      handleError(chrome.extension.lastError);
    } // else not an error
  };
};

Debugger.prototype.connect = function() {
  chrome.experimental.debugger.attach(this.tabId, this.reportError);
  chrome.experimental.debugger.onEvent.addListener(this.onEvent.bind(this));
};

Debugger.prototype.disconnect = function() {
  chrome.experimental.debugger.detach(this.tabId, this.reportError);
};

Debugger.prototype.onEvent = function(tabId, method, params) {
  this.proxy.send({source: "debugger", name: method, params: params}); 
};

Debugger.prototype.onDetach = function(tabId) {
  this.proxy.send({source: "debugger", name: "detach"}); 
};

}());