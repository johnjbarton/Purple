// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['log/LogBase', 'browser/remoteByWebInspector', 'resources/Resources', 'resources/Resource','log/SparseArray','lib/q/q', 'lib/part'], 
function (   LogBase,           remoteByWebInspector,            Resources,             Resource,      SparseArray,         Q, PurplePart) {
  
  var networkEventHandler = LogBase.new('networkLog');
  
  networkEventHandler.getOrCreateResource = function(url) {
    var resource = Resources.get(url);
    if (!resource) {
      resource = Resource.new(url);
      Resources.append(url, resource);
    }
    return resource;
  };
  
  networkEventHandler.requests = {};

  // close over the handler here to narrow the interface to Resource
  // |this| will be bound to a Resource
  
  function fetchContent(fncOfContent, fncOfError) {
    if (this.requestId) {
      var responseBody = networkEventHandler.remote.Network.getResponseBody(this.requestId);
      Q.when(responseBody, fncOfContent, fncOfError);
    } else {
      fncOfError("Resource not loaded: "+this.url);
    }
  }

  networkEventHandler.setRequestById = function(requestId, resource) {
    if (this.requests.hasOwnProperty(requestId)) {
      throw new Error("duplicate requestId, "+requestId+" something is wrong ");
    }
    this.requests[requestId] = resource;
    resource.fetchContent = fetchContent;
    resource.hasSource = true;
  };
  
  networkEventHandler.getRequestById = function(requestId) {
    if (this.requests.hasOwnProperty(requestId)) {
      return this.requests[requestId];
    } else {
      throw new Error("Expected resource at "+requestId+"but none was found");
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
        requestServedFromMemoryCache: function(requestId, loaderId, documentURL, timestamp, initiator, cachedResource, p_id){
          var url = cachedResource.url;
          var resource = networkEventHandler.getOrCreateResource(url);
          resource.documentURL = documentURL;
          resource.requestId = requestId;
          resource.loaderId = loaderId;
          resource.timestamps = {"fromMemoryCache": timestamp};
          resource.initiator = initiator;
          resource.resource = cachedResource;
          networkEventHandler.setRequestById(requestId, resource);
          networkEventHandler.store.set(p_id, resource);
        },
        requestWillBeSent: function(requestId, loaderId, documentURL, request, timestamp, initiator, stackTrace, redirectResponse, p_id){
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
          networkEventHandler.store.set(p_id, resource);
        },
        responseRecieved: function(requestId, timestamp, type, response){
          var resource = networkEventHandler.getRequestById(requestId);
          resource.timestamps.responseRecieved = timestamp;
          resource.type = type;
          resource.response = response;
        }
      },
      WebNavigation: {
        onBeforeNavigate: function(details, p_id){
          networkEventHandler.store.set(p_id, details);
        },
        onBeforeRetarget: function(details, p_id){
          networkEventHandler.store.set(p_id, details);
        },
        onCommitted: function(details, p_id){
          networkEventHandler.store.set(p_id, details);
        },
        onCompleted: function(details, p_id){
          networkEventHandler.store.set(p_id, details);
        },
        onDOMContentLoaded: function(details, p_id){
          networkEventHandler.store.set(p_id, details);
        },
        onErrorOccurred: function(details, p_id){
          networkEventHandler.store.set(p_id, details);
        }
      }
  };
  
   //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  
  networkEventHandler.connect = function(channel, filter) {
      this.store = SparseArray.new('NetworkEvents');
      this.remote = remoteByWebInspector.new('networkRemote');
      filter.registerPart(this.store);
      this.remote.connect(channel, this);
      LogBase.connect.apply(this, [this.remote.Network]);
	  this.remote.Network.enable();
  };
  
  networkEventHandler.disconnect = function(channel) {
      this.remote.Network.disable();
      this.remote.disconnect(channel);
      delete this.store;
  };

  return networkEventHandler;
});