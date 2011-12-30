// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['log/LogBase', 'browser/remoteByWebInspectorPart', 'resources/Resources', 'resources/Resource','log/SparseArray','lib/q/q', 'lib/part'], 
function (   LogBase,           remoteByWebInspectorPart,            Resources,             Resource,      SparseArray,         Q, PurplePart) {
  
  var LoggingNetworkEventHandler = LogBase.new('networkLog');
  
  LoggingNetworkEventHandler.getOrCreateResource = function(url) {
    var resource = Resources.get(url);
    if (!resource) {
      resource = Resource.new(url);
      Resources.append(url, resource);
    }
    return resource;
  };
  
  LoggingNetworkEventHandler.requests = {};

  // close over the handler here to narrow the interface to Resource
  // |this| will be bound to a Resource
  
  function fetchContent(fncOfContent, fncOfError) {
    if (this.requestId) {
      var responseBody = LoggingNetworkEventHandler.remote.Network.getResponseBody(this.requestId);
      Q.when(responseBody, fncOfContent, fncOfError);
    } else {
      fncOfError("Resource not loaded: "+this.url);
    }
  }

  LoggingNetworkEventHandler.setRequestById = function(requestId, resource) {
    if (this.requests.hasOwnProperty(requestId)) {
      throw new Error("duplicate requestId, "+requestId+" something is wrong ");
    }
    this.requests[requestId] = resource;
    resource.fetchContent = fetchContent;
    resource.hasSource = true;
  };
  
  LoggingNetworkEventHandler.getRequestById = function(requestId) {
    if (this.requests.hasOwnProperty(requestId)) {
      return this.requests[requestId];
    } else {
      throw new Error("Expected resource at "+requestId+"but none was found");
    }
  };
  

  //---------------------------------------------------------------------------------------------
  // Implement Remote.events
  LoggingNetworkEventHandler.responseHandlers = {
    Network: {
        dataReceived: function(requestId, timestamp, dataLength, encodedDataLength){
          var resource = LoggingNetworkEventHandler.getRequestById(requestId);
          resource.progress = resource.progress || [];
          resource.progress.push({timestamp: timestamp, dataLength: dataLength, encodedDataLength: encodedDataLength});
        },
        loadingFailed: function(requestId, timestamp, errorText, canceled){
          var resource = LoggingNetworkEventHandler.getRequestById(requestId);
          resource.timestamps.loadingFailed = timestamp;
          resource.errorText = errorText;
          resource.canceled = canceled;
        },
        loadingFinished: function(requestId, timestamp){
          var resource = LoggingNetworkEventHandler.getRequestById(requestId);
          resource.timestamps.loadingFailed = timestamp;
        },
        requestServedFromCache: function(requestId){
          var resource = LoggingNetworkEventHandler.getRequestById(requestId);
          resource.servedFromCache = true;
        },
        requestServedFromMemoryCache: function(requestId, loaderId, documentURL, timestamp, initiator, cachedResource, p_id){
          var url = cachedResource.url;
          var resource = LoggingNetworkEventHandler.getOrCreateResource(url);
          resource.documentURL = documentURL;
          resource.requestId = requestId;
          resource.loaderId = loaderId;
          resource.timestamps = {"fromMemoryCache": timestamp};
          resource.initiator = initiator;
          resource.resource = cachedResource;
          LoggingNetworkEventHandler.setRequestById(requestId, resource);
          LoggingNetworkEventHandler.store.set(p_id, resource);
        },
        requestWillBeSent: function(requestId, loaderId, documentURL, request, timestamp, initiator, stackTrace, redirectResponse, p_id){
          var url = request.url;
          var resource = LoggingNetworkEventHandler.getOrCreateResource(url);
          resource.documentURL = documentURL;
          resource.requestId = requestId;
          resource.loaderId = loaderId;
          resource.request = request;
          resource.timestamps = {"sent": timestamp};
          resource.initiator = initiator;
          resource.stackTrace = stackTrace;
          resource.redirectResponse = redirectResponse;
          LoggingNetworkEventHandler.setRequestById(requestId, resource);
          LoggingNetworkEventHandler.store.set(p_id, resource);
        },
        responseRecieved: function(requestId, timestamp, type, response){
          var resource = LoggingNetworkEventHandler.getRequestById(requestId);
          resource.timestamps.responseRecieved = timestamp;
          resource.type = type;
          resource.response = response;
        }
      },
      WebNavigation: {
        onBeforeNavigate: function(details, p_id){
          LoggingNetworkEventHandler.store.set(p_id, details);
        },
        onBeforeRetarget: function(details, p_id){
          LoggingNetworkEventHandler.store.set(p_id, details);
        },
        onCommitted: function(details, p_id){
          LoggingNetworkEventHandler.store.set(p_id, details);
        },
        onCompleted: function(details, p_id){
          LoggingNetworkEventHandler.store.set(p_id, details);
        },
        onDOMContentLoaded: function(details, p_id){
          LoggingNetworkEventHandler.store.set(p_id, details);
        },
        onErrorOccurred: function(details, p_id){
          LoggingNetworkEventHandler.store.set(p_id, details);
        }
      }
  };
  
   //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  
  LoggingNetworkEventHandler.connect = function(channel, viewport) {
      this.store = SparseArray.new('NetworkEvents');
      this.remote = remoteByWebInspectorPart.new('networkRemote');
      this.remote.connect(channel, this);
      LogBase.connect.apply(this, [this.remote.Network, viewport]);
	  this.remote.Network.enable();
  };
  
  LoggingNetworkEventHandler.disconnect = function(channel) {
      this.remote.Network.disable();
      this.remote.disconnect(channel);
      delete this.store;
  };

  var networkEventHandler = LoggingNetworkEventHandler.new('NetworkEvents');

  return networkEventHandler;
});