// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../browser/remoteByWebInspector', '../resources/Resources', '../resources/Resource'], function (remoteByWebInspector, Resources, Resource) {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;
  
  var networkEventHandler = new thePurple.PurplePart('networkEventHandler');
  
  networkEventHandler.getOrCreateResource = function(url) {
    var resource = Resources.get(url);
    if (!resource) {
      resource = Resource.new(url);
      Resources.append(url, resource);
    }
    return resource;
  };
  
  networkEventHandler.requests = {};
  
  networkEventHandler.setRequestById = function(requestId, resource) {
    if (this.requests.hasOwnProperty(requestId)) {
      throw new Error("duplicate requestId, "+requestId+" something is wrong ");
    }
    this.requests[requestId] = resource;  
  };
  
  networkEventHandler.getRequestById = function(requestId) {
    if (this.requests.hasOwnProperty(requestId)) {
      return this.requests[requestId];
    } else {
      throw new Error("Expected resource at "+requestId+"but none was found");
    }
  };
  
  // close over the handler here to narrow the interface to Resource
  // |this| will be bound to a Resource
  
  Resource.fetchContent = function(fncOfContent, fncOfError) {
    if (this.requestId) {
      networkEventHandler.remote.setResponseCallbacks(fncOfContent, fncOfError);
      networkEventHandler.remote.Network.getResponseBody(this.requestId);
    } else {
      fncOfError("Resource not loaded: "+this.url);
    }
  };

  //---------------------------------------------------------------------------------------------
  // Implement Remote.events
  networkEventHandler.responseHandlers = {
    Network: {
        dataReceived: function(requestId, timestamp, dataLength, encodedDataLength){
          var resource = networkEventHandler.getRequestById(requestId);
          resource.progress = resource.progress || [];
          resource.progress.push({timestamp: timestamp, dataLength: dataLength, encodedDataLength: encodedDataLength});
        },
        loadingFailed: function(requestId, timestamp, errorText, canceled){
          var resource = networkEventHandler.getRequestById(requestId);
          resource.timestamps.loadingFailed = timestamp;
          resource.errorText = errorText;
          resource.canceled = canceled;
        },
        loadingFinished: function(requestId, timestamp){
          var resource = networkEventHandler.getRequestById(requestId);
          resource.timestamps.loadingFailed = timestamp;
        },
        requestServedFromCache: function(requestId){
          var resource = networkEventHandler.getRequestById(requestId);
          resource.servedFromCache = true;
        },
        requestServedFromMemoryCache: function(requestId, loaderId, documentURL, timestamp, initiator, cachedResource){
          var url = cachedResource.url;
          var resource = networkEventHandler.getOrCreateResource(url);
          resource.documentURL = documentURL;
          resource.requestId = requestId;
          resource.loaderId = loaderId;
          resource.timestamps = {"fromMemoryCache": timestamp};
          resource.initiator = initiator;
          resource.resource = cachedResource;
          networkEventHandler.setRequestById(requestId, resource);
          networkEventHandler.logger(resource);
        },
        requestWillBeSent: function(requestId, loaderId, documentURL, request, timestamp, initiator, stackTrace, redirectResponse){
          var url = request.url;
          var resource = networkEventHandler.getOrCreateResource(url);
          resource.documentURL = documentURL;
          resource.requestId = requestId;
          resource.loaderId = loaderId;
          resource.request = request;
          resource.timestamps = {"sent": timestamp};
          resource.initiator = initiator;
          resource.stackTrace = stackTrace;
          resource.redirectResponse = redirectResponse;
          networkEventHandler.setRequestById(requestId, resource);
          networkEventHandler.logger(resource);
        },
        responseRecieved: function(requestId, timestamp, type, response){
          var resource = networkEventHandler.getRequestById(requestId);
          resource.timestamps.responseRecieved = timestamp;
          resource.type = type;
          resource.response = response;
        }
      },
      WebNavigation: {
        onBeforeNavigate: function(details){
          networkEventHandler.logger(details);
        },
        onBeforeRetarget: function(details){
          networkEventHandler.logger(details);
        },
        onCommitted: function(details){
          networkEventHandler.logger(details);
        },
        onCompleted: function(details){
          networkEventHandler.logger(details);
        },
        onDOMContentLoaded: function(details){
          networkEventHandler.logger(details);
        },
        onErrorOccurred: function(details){
          networkEventHandler.logger(details);
        }
      }
  };
  
   //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  
  networkEventHandler.connect = function(channel) {
      this.remote = remoteByWebInspector.create('networkRemote', this.responseHandlers);
      this.remote.connect(channel);
      this.logger = channel.recv.bind(channel);
	  this.remote.Network.enable();
  };
  
  networkEventHandler.disconnect = function(channel) {
      this.remote.Network.disable();
      Resources.disconnect(this.logger);
  };

  thePurple.registerPart(networkEventHandler);

  return networkEventHandler;
});