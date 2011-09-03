// Atop Web Inspector: API to Web Inspector back end functions
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function () {
  var thePurple = window.purple;
  
  var remoteByWebInspector = new thePurple.Feature();
  var remote__ = remoteByWebInspector;
  
   
  
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
  
  function bindParams(domain, method, paramNames, argValues) {
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
    var api =  thePurple.getFeatureAPI("remote");
    var domains = Object.keys(api);
    domains.forEach(function buildDomain(domain) {
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

  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  remote__.initialize = function() {
    buildImplementation();
  };
  
  remote__.featureImplemented = function(feature) {
    if (feature.name === 'channel') {
	  thePurple.implementFeature('remote', this);
	}
  };
  
  remote__.featureUnimplemented = function(feature) {
    if (feature.name === 'channel') {
	  thePurple.unimplementFeature('remote', this);
	}
  };


}());