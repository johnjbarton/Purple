// Atop Web Inspector: API to Web Inspector back end functions
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function () {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  
  var remoteByWebInspector = new thePurple.PurplePart('remote');
  
  remoteByWebInspector.jsonHandlers = {}; // by domain and function name
  
  // A left paren ( followed by any not-right paren ) followed by right paren
  var reParamList = /\(([^\)]*)\)/; 
  
  // parse the function source to get the parameter name
  function getParamsFromAPI(fnc) {
    var paramList = [];
    var src = fnc.toString();
    var m = reParamList.exec(src);
    if (m && m[1]) {
      var spacyParamList = m[1].split(',');
      spacyParamList.forEach(function(spacy) {
        paramList.push(spacy.trim());
      });
    }
    return paramList;
  }
  
  // build a JSON object for Remote Debugging 
  
  function bindParams(paramNames, argValues) {
    var params = {};
    paramNames.forEach(function(name) {
      if (argValues.length) {
        params[name] = argValues.shift();
      }
    });
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
  function buildImplementation() {
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

  remoteByWebInspector.reParameters = /\(([^\)]*)\)/;

  function marshallForHandler(handler) {
    return function (objFromJSON) {
      var args = [];
      for (var i = 0; i < handler.parameters.length; i++) {
        args[i] = objFromJSON[handler.parameters[i]];
      }
      handler.apply(null, args);
    };
  }
  
  remoteByWebInspector.setResponseHandlers = function (responseHandlerObject) {
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
        var handler = responseHandlerObject[domainName][handlerName];  // implementation function of
        if (!handler) {
          console.trace("remoteByWebInspector");
          console.error("remoteByWebInspector, no handler for "+domainName+"."+handlerName, remoteByWebInspector);
          throw new Error("remoteByWebInspector, no handler for "+domainName+"."+handlerName);
        }
        var m = remoteByWebInspector.reParameters.exec(handlerSpec.toString());
        var params = m[1].split(',');
        handler.parameters = [];
        for (var i = 0; i < params.length; i++) {
          handler.parameters[i] = params[i].trim();
        }
        remoteByWebInspector.jsonHandlers[domainName][handlerName] = marshallForHandler(handler);
      });
    });
  };

  
  //---------------------------------------------------------------------------------------------
  // Implement ChannelPart
  // 
  remoteByWebInspector.channelPart = new thePurple.PurplePart('remoteByWebInspectorChannelPart');
  remoteByWebInspector.channelPart.recv = function(message) {
    console.log("remote.recv", message);
    var data = message.data;
    if (data.source && data.name) {
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
            console.error("remoteByWebInspector ERROR "+exc, exc.stack, data.params);
          }
        }
      }
    }
  };

  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  
  remoteByWebInspector.connect = function(channel) {
    this.channel = channel;
    buildImplementation();
    this.channel.registerPart(this.channelPart);
  };
  
  remoteByWebInspector.disconnect = function(channel) {
    if (this.channel && this.channel === channel) {
      this.channel.unregisterPart(this.channelPart);
      delete this.channel;
    }
  };

  Assembly.addPartContainer(remoteByWebInspector);
  thePurple.registerPart(remoteByWebInspector);

}());