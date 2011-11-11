// Atop Web Inspector: API to Web Inspector back end functions
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['browser/remote', 'lib/Base', 'lib/q/q'], function (remote, Base, Q) {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  
  // A left paren ( followed by any not-right paren ) followed by right paren
  var reParamList = /\(([^\)]*)\)/; 
  var reParameters = /\(([^\)]*)\)/;
  
  // parse the function source to get the parameter name
  function getParamsFromAPI(fnc) {
    var paramList = [];
    var src = fnc.toString();
    var m = reParamList.exec(src);
    if (m && m[1]) {
      var spacyParamList = m[1].split(',');
      spacyParamList.forEach(function(spacy) {
        var paramName = spacy.trim();
        if (paramName) {
          paramList.push(spacy.trim());
        }
      });
    }
    return paramList;
  }
  
  // build a JSON object for Remote Debugging 
  
  function bindParams(paramNames, argValues) {
    var params = {};
    var max = Math.min(paramNames.length, argValues.length);
    for(var i = 0; i < max; i++) {
      var name = paramNames[i];
      params[name] = argValues[i];
    }
    return params;
  }

  var commandCounter = 0;
  var deferredById = {};

  function makeSendRemoteCommand(channel, domain, method, paramNames) {
    // we close over the argumentes
    return function sendRemoteCommand() {  // arguments here will depend upon method
      var params = bindParams(paramNames, arguments);
      var message = {method: domain+'.'+method,  params: params, cmd_id: commandCounter++};
      // store the deferred for recvResponseData
      var deferred = deferredById[message.cmd_id] = Q.defer();
      channel.send(message);
      // callers can wait on the promise to be resolved by recvResponseData
      return deferred.promise; 
    };
  }
  
  // Walk the remote API and implement each function to send over channel.
  function buildImplementation(remoteByWebInspector, channel) {
    var Features = thePurple.getPartByName('Features');
    var remote =  Features.getPartByName("remote");
    var api = remote.getAPI();
    var domains = Object.keys(api);
    domains.forEach(function buildSend(domain) {
      remoteByWebInspector[domain] = {};
      var methods = Object.keys(api[domain]);
      methods.forEach(function buildMethod(method) {
        var paramNames = getParamsFromAPI(api[domain][method]);
        // each RHS is a function returning a promise
        remoteByWebInspector[domain][method] = makeSendRemoteCommand(channel, domain, method, paramNames);
      });
    });
  }

  function marshallForHandler(indexer, handler) {
    return function (objFromJSON, p_id) {
      var args = [];
      for (var i = 0; i < handler.parameters.length; i++) {
        args[i] = objFromJSON[handler.parameters[i]];
      }
      args.push(p_id);  // purple specific clock tick postpended
      handler.apply(indexer, args);
    };
  }
  
  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  var RemoteByWebInspector = Base.extend(thePurple.PurplePart.methods);
  
  RemoteByWebInspector.connect = function(channel, indexer) {
      
    this._addHandlers(indexer); 
    buildImplementation(this, channel);  // route inputs to handlers
    
    this.onEvent = this.recvEvent.bind(this);
    channel.addListener(this.onEvent);     // input for events
    
    
    this.onResponse = this.recvResponse.bind(this);
    channel.addListener(this.onResponse);  // input for sendCommand responses
  };
  
  RemoteByWebInspector.disconnect = function(log, channel) {
    if (this.onEvent) {
      channel.removeListener(this.onEvent);
      delete this.onEvent;
      channel.removeListener(this.onReponse);
      delete this.onResponse;
    } // else not connected
  };
  
  //---------------------------------------------------------------------------------------------
  // As Channel Part
  // 
  RemoteByWebInspector.recvEvent = function(p_id, data) {
    // {source: "debugger", name: "response", result: result, request: request}
    if (data && data.source && data.name) {
      if (data.name !== 'response') {
        this.recvEventData(p_id, data);
      }
    }
  };

  RemoteByWebInspector.recvEventData = function(p_id, data) {
    return this.categorize(p_id, data, this.applyToparsedJSON);
  };

  RemoteByWebInspector.categorize = function(p_id, data, thenFnOfIdDataMethod) {
    var splits = data.name.split('.');
    var category = splits[0];
    var methodName = splits[1];
    var handlers = this.jsonHandlers[category];
    if (handlers) {
      var method = handlers[methodName];
      if (method) {
        return thenFnOfIdDataMethod(p_id, data, method);
      }
    }
  };
  
  RemoteByWebInspector.applyToparsedJSON = function(p_id, data, method) {
    try {
      var objFromJSON = data.params;
      if (typeof(objFromJSON) === 'string') {
        objFromJSON = JSON.parse(data.params);
      }
      return method.apply(null, [objFromJSON, p_id]);
    } catch(exc) {
      console.error("RemoteByWebInspector ERROR "+exc, exc.stack, data.params);
    }
  };
  
  RemoteByWebInspector.recvResponse = function(p_id, data) {
    // {source: "debugger", name: "response", result: result, request: request}
    if (data && data.source && data.name) {
      if (data.name === 'response') {
        this.recvResponseData(p_id, data);
      } 
    }  // else not a response
  };
  
  
  RemoteByWebInspector.recvResponseData = function(p_id, data) {
    var cmd_id = data.request.cmd_id; // set by sendRemoteCommand
    var deferred = deferredById[cmd_id];
    if (deferred) {
      try {
      if (data.result) {
        deferred.resolve(data.result);
      } else if (data.error) {
        deferred.reject(data.error);
      } else {
        deferred.reject({error:"recvResponseData with incorrect data"});
      }
      } finally {
        console.log("recvResponseData completed "+cmd_id, data);
        delete deferredById[cmd_id];
      }
    } // else another remote may have created the request
  };
  
  
  RemoteByWebInspector._addHandlers = function(indexer) {
    this.jsonHandlers = {}; // by domain and function name
    var responseHandlerObject = indexer.responseHandlers;  // {Debugger:{functions}, Console:{functions}}
    var remoteImpl = this;
    
    var Features = thePurple.getPartByName('Features');
    var remote =  Features.getPartByName("remote");
    var events = remote.getEvents();
    var domainNames = Object.keys(events);
    domainNames.forEach(function buildDomainResponse(domainName) {
      remoteImpl.jsonHandlers[domainName] = {};
      var handlerNames = Object.keys(events[domainName]);
      handlerNames.forEach(function buildHandler(handlerName) {
        var handlerSpec = events[domainName][handlerName]; // an empty function
        var handlersByDomain = responseHandlerObject[domainName];
        if (!handlersByDomain) {
          return;
        }
        var handler = handlersByDomain[handlerName];  // implementation function of
        if (!handler) {
          console.trace("RemoteByWebInspector");
          console.error("RemoteByWebInspector, no handler for "+domainName+"."+handlerName, RemoteByWebInspector);
          throw new Error("RemoteByWebInspector, no handler for "+domainName+"."+handlerName);
        }
        var m = reParameters.exec(handlerSpec.toString());
        var params = m[1].split(',');
        handler.parameters = [];
        for (var i = 0; i < params.length; i++) {
          var param = params[i].trim();
          if (param) {
            handler.parameters[i] = param;
          }
        }
        remoteImpl.jsonHandlers[domainName][handlerName] = marshallForHandler(indexer, handler);
      }.bind(this));
    });
  };
  
  RemoteByWebInspector.initialize = function(name) {
    thePurple.PurplePart.apply(remote, [name]);
  };
  
  return RemoteByWebInspector;

});
