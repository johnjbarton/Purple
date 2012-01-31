// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['log/LogBase', 'crx2app/rpc/ChromeDebuggerProxy', 'resources/Resources', 'resources/Resource','log/SparseArray','lib/q/q', 'lib/part'], 
function (   LogBase,               ChromeDebuggerProxy,            Resources,             Resource,      SparseArray,         Q, PurplePart) {

  var LoggingNetworkEventHandler = LogBase.extend({
  
   getOrCreateResource: function(url) {
      var resource = Resources.get(url);
      if (!resource) {
        resource = Resource.new(url);
        Resources.append(url, resource);
      }
      return resource;
    },
    
  setRequestById: function(requestId, resource) {
    if (this.requests.hasOwnProperty(requestId)) {
      throw new Error("duplicate requestId, "+requestId+" something is wrong ");
    }
    this.requests[requestId] = resource;
    // close over the handler here to narrow the interface to Resource
    // |this| will be bound to a Resource
    var remote = this;
    resource.fetchContent = function (fncOfContent, fncOfError) {
      if (this.requestId) {
        var responseBody = remote.Network.getResponseBody(this.requestId);
        Q.when(responseBody, fncOfContent, fncOfError);
      } else {
        fncOfError("Resource not loaded: "+this.url);
      }
    };
 
    resource.hasSource = true;
  },
  
  getRequestById: function(requestId) {
    if (this.requests.hasOwnProperty(requestId)) {
      return this.requests[requestId];
    } else {
      throw new Error("Expected resource at "+requestId+"but none was found");
    }
  },

    Network: {
      events: {
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
      }
    },
    WebNavigation: {
      events: {
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
    },
    
    initialize: function(name) {
      this.requests = {};
      LogBase.initialize.apply(this, [name]);
      this.store = SparseArray.new('NetworkEvents');
    },
  
  
    //---------------------------------------------------------------------------------------------
    // Implement PurplePart
  
    connect: function(chromeDebuggerProxy, viewport) {
      chromeDebuggerProxy.registerHandlers(this);
      LogBase.connect.apply(this, [this, viewport]);
    },
  
    disconnect: function() {
      delete this.store;
    }
    
  });
  
  var networkEventHandler = LoggingNetworkEventHandler.new('networkLog');

  return networkEventHandler;
});