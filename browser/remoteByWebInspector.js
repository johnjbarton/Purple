// Atop Web Inspector: API to Web Inspector back end functions
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['../browser/remote'], function (remote) {
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

  function makeSendRemoteCommand(channel, domain, method, paramNames) {
    // we close over the argumentes
    return function sendRemoteCommand() {  // arguments here will depend upon method
      var params = bindParams(paramNames, arguments);
      var message = {method: domain+'.'+method,  params: params};
      channel.send(message);
    }
  }
  
  // Walk the remote API and implement each function to send over channel.
  function buildImplementation(remoteByWebInspector) {
    var Features = thePurple.getPartByName('Features');
    var remote =  Features.getPartByName("remote");
    var api = remote.getAPI();
    var domains = Object.keys(api);
    domains.forEach(function buildSend(domain) {
      remoteByWebInspector[domain] = {};
      var methods = Object.keys(api[domain]);
      methods.forEach(function buildMethod(method) {
        var paramNames = getParamsFromAPI(api[domain][method]);
        remoteByWebInspector[domain][method] = makeSendRemoteCommand(remoteByWebInspector.channel, domain, method, paramNames);
      });
    });
  }

  function marshallForHandler(handler) {
    return function (objFromJSON) {
      var args = [];
      for (var i = 0; i < handler.parameters.length; i++) {
        args[i] = objFromJSON[handler.parameters[i]];
      }
      handler.apply(null, args);
    };
  }
  
  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  var RemoteByWebInspector = Object.create(thePurple.PurplePart.methods);
  
  RemoteByWebInspector.connect = function(channel) {
    this.channel = channel;
    buildImplementation(this);
    this.channel.addListener(this.recv);
  };
  
  RemoteByWebInspector.disconnect = function(channel) {
    if (this.channel && this.channel === channel) {
      this.channel.removeListener(this.recv);
      delete this.channel;
    }
  };
  
  //---------------------------------------------------------------------------------------------
  // As ChannelPart
  // 
  RemoteByWebInspector.recv = function(message) {
    //console.log("remote.recv", message);
    var data = message.data;
    if (data && data.source && data.name) {
      if (data.name === 'response') {
        this.onResponse(data);
      } else {
        this.onEvent(data);
      }
    }
  };
  
  RemoteByWebInspector.onEvent = function(data) {
    var splits = data.name.split('.');
    var category = splits[0];
    var methodName = splits[1];
    var handlers = this.jsonHandlers[category];
    if (handlers) {
      var method = handlers[methodName];
      if (method) {
        try {
          var objFromJSON = data.params;
          if (typeof(objFromJSON) === 'string') {
            objFromJSON = JSON.parse(data.params);
          }
          method.apply(null, [objFromJSON]);
        } catch(exc) {
          console.error("RemoteByWebInspector ERROR "+exc, exc.stack, data.params);
        }
      }
    }
  };
  
  RemoteByWebInspector.setResponseCallbacks = function(fncOfResponse, fncOfError){
    this.sendRequestCallback = fncOfResponse;
    this.sendRequestErrBack = fncOfError;
  };
  
  RemoteByWebInspector.onResponse = function(data) {
    if(this.sendRequestCallback) {
      if (data.result) {
        this.sendRequestCallback(data.result);
      } else if (data.error) {
        this.sendRequestErrBack(data.error);
      } else {
        this.sendRequestErrBack({error:"onResponse with incorrect data"});
      }
      delete this.sendRequestCallback;  // hey you had your chance
      delete this.sendRequestErrBack;
    }
  };
  
  
  function addHandlers(remoteByWebInspector, responseHandlerObject) {
    this.responseHandlerObject = responseHandlerObject;  // {Debugger:{functions}, Console:{functions}}
    var Features = thePurple.getPartByName('Features');
    var remote =  Features.getPartByName("remote");
    var events = remote.getEvents();
    var domainNames = Object.keys(events);
    domainNames.forEach(function buildDomainResponse(domainName) {
      remoteByWebInspector.jsonHandlers[domainName] = {};
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
        remoteByWebInspector.jsonHandlers[domainName][handlerName] = marshallForHandler(handler);
      }.bind(this));
    });
  }
  
  RemoteByWebInspector.create = function(name, handlers) {
    var remote = Object.create(RemoteByWebInspector);
    thePurple.PurplePart.apply(remote, [name]);
    remote.jsonHandlers = {}; // by domain and function name
    remote.recv = remote.recv.bind(remote);
    addHandlers(remote, handlers);
    return remote;
  };
  
  return RemoteByWebInspector;

});
