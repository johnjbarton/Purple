// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window*/

define(['q-comm/q-comm'],
function(Q_COMM) {

  // A left paren ( followed by any not-right paren ) followed by right paren
  var reParamList = /\(([^\)]*)\)/; 
  var reParameters = /\(([^\)]*)\)/;


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

// handlerSpec: empty function with correct arguments.
// return: an array of parameter names

function getParameters(handlerSpec) {
  var m = reParameters.exec(handlerSpec.toString());
  var params = m[1].split(',');
  var parameters = [];
  for (var i = 0; i < params.length; i++) {
    var param = params[i].trim();
    if (param) {
      parameters[i] = param;
    }
  }
  return parameters;
}
  
function makeArgMapper(parameters) {
  return function (paramsFromJSON) {
    var args = [];
    for (var i = 0; i < parameters.length; i++) {
      args[i] = paramsFromJSON[parameters[i]];
    }
    return args;
  };
}

function marshallForHandler(handlerSpec, local, handler) {
  var parameters = getParameters(handlerSpec);
  var argMapper = makeArgMapper(parameters);
  return function (paramsFromJSON) {
    var args = argMapper(paramsFromJSON); 
    handler.apply(local, args);
  };
}


  // return: dictionary of functions accepting json objects, calling local handlers
  // iface: possibly empty functions for each possible method name coming over JSON
  // local: defn for some of the iface entries becomes |this| for handlers
function buildJSONHandlers(iface, local) {
  var jsonHandlers =  {};
  var handlerNames = Object.keys(iface);
  handlerNames.forEach(function buildHandler(handlerName) {
    var handlerSpec = iface[handlerName]; // an empty function, with arguments
    var handler = local[handlerName];  // implementation of that function 
    if (handler) {
      jsonHandlers[handlerName] = marshallForHandler(handlerSpec, local, handler);
    }
  });
}

// otherWindow: eg an iframe or window.parent
// commands: object with function properties, call to otherWindow
// eventInterface: object with function properties, calls from otherWindow
// return: object with remote method calls

function makeStub(otherWindow, commands, eventHandlers) {
  var jsonHandlers = buildJSONHandlers(eventHandlers, eventHandlers);
  // build a connection to otherWindow, identifying ourselves as origin
  var qStub = Q_COMM.Connection(otherWindow, jsonHandlers, {origin: window.location.origin});
  // wrap the connection in an API, the result object has remote method calls
  return buildPromisingCalls(commands, qStub); 
}

return {
  makeStub: makeStub
  };
  
});