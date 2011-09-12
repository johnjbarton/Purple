// Atop Web Inspector: API to Web Inspector back end functions
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function () {
  var thePurple = window.purple;
  
  var remote__ = {};
  
   
  
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

  function sendRemoteCommand(domain, method, paramNames, argValues) {
    var params = bindParams(paramNames, argValues);
    var message = {method: domain+'.'+method,  params: params};
    var channel = thePurple.getFeature("channel");
    channel.send(message);
  }
  
  // Walk the remote API and implement each function to send over channel.
  function buildImplementation() {
    var remote =  thePurple.getFeature("remote");
    var api = remote.getAPI();
    var domains = Object.keys(api);
    domains.forEach(function buildSend(domain) {
      remote__[domain] = {};
      var methods = Object.keys(api[domain]);
      methods.forEach(function buildMethod(method) {
        var params = getParamsFromAPI(api[domain][method]);
        remote__[domain][method] = function() {
          sendRemoteCommand(domain, method, params, arguments);
        };
      });
    });
  }

  remote__.reParameters = /\(([^\)]*)\)/;

  function makeHandler(domainName, handlerName) {
    return function (objFromJSON) {
      var handler = remote__.eventsHandlers[domainName][handlerName];
      var args = [];
      for (var i = 0; i < handler.parameters.length; i++) {
        args[i] = objFromJSON[handler[i]];
      }
      handler.apply(null, args);
    };
  }
  
  remote__.setResponseHandlers = function (eventsHandlerObject) {
    this.eventsHandlers = eventsHandlerObject;  // {Debugger:{functions}, Console:{functions}}
    var remote =  thePurple.getFeature("remote");
    var events = remote.getEvents();
    domainNames = Object.keys(events);
    domainNames.forEach(function buildDomainResponse(domainName) {
      var domainHandler = remote__.eventsHandlers[domainName] = {};
      var handlerNames = Object.keys(events[domainName]);
      handlerNames.forEach(function buildHandler(handlerName) {
       var handlerSpec = events[domainName][handlerName]; // an empty function
        var handler = remote__.eventsHandlers[domainName][handlerName];  // implementation function of
        if (!handler) {
          console.trace("remoteByWebInspector");
          console.error("remoteByWebInspector, no handler for "+domainName+"."+handlerName, remote__);
          throw new Error("remoteByWebInspector, no handler for "+domainName+"."+handlerName);
        }
        var m = remote__.reParameters.exec(handlerSpec.toString());
        var params = m[1].split[','];
        handler.parameters = [];
        for (var i = 0; i < params.length; i++) {
          handler.parameters[i] = params[i].trim();
        }
        domainHandler[domainName][handlerName] = makeHandler(domainName, handlerName);
      });
    });
  }

  
  //---------------------------------------------------------------------------------------------
  // Implement ChannelPart
  // 

  remote__.recv = function(message) {
    console.log("remote.recv", message);
    var data = message.data;
    if (data.source && data.name) {
      var splits = data.name.split('.');
      var category = splits[0];
      var methodName = splits[1];
      var handlers = this.eventsHandlers[category];
      if (handlers) {
        var method = handlers[methodName];
        if (method) {
          var objFromJSON = JSON.parse(data.params);
          method.apply(null, objFromJSON);
        }
      }
    }
  };

  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  remote__.initialize = function() {
    buildImplementation();
  };
  
  remote__.featureImplemented = function(feature) {
    if (feature.name === 'channel') {
      this.channel = feature.implementation;
	  thePurple.implementFeature('remote', this);
      this.channel.registerPart(this);
	}
  };
  
  remote__.featureUnimplemented = function(feature) {
    if (feature.name === 'channel') {
      this.channel.unregisterPart(this);
	  thePurple.unimplementFeature('remote', this);
	  delete this.channel;
	}
  };

  thePurple.registerPart(remote__);

}());