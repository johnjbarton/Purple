// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window*/

define(['q-comm/q-comm'],
function(Q_COMM) {

function buildPromisingCalls(iface, remote) {
  var stub = {};
  Object.keys(iface).forEach(function(method) {
    // functions on stub operate on remote
    stub[method] =  function() {
      var args = Array.prototype.slice.call(arguments);       
      return remote.invoke.apply(remote, [method].concat(args));
    };
  });
  return stub;
}

function stubber(otherWindow, commands, eventHandler) {
  var qStub = Q_COMM.Connection(otherWindow, eventHandler, {origin: window.location.origin});
  return buildPromisingCalls(commands, qStub); 
}

return {
  stubber: stubber
  };
  
});