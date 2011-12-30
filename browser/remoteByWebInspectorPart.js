// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define console*/

define(['browser/remoteByWebInspector', 'lib/MetaObject', 'lib/part'], function (remoteByWebInspector, MetaObject, PurplePart) {
  
  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  var remoteByWebInspectorPart = MetaObject.extend(PurplePart.prototype, remoteByWebInspector);
  
  // JSON object messages from channel are passed to the indexer handlers
  remoteByWebInspectorPart.connect = function(channel, indexer) {
     
    this._addHandlers(indexer); 
    remoteByWebInspector.buildImplementation(this, channel);  // route inputs to handlers
    
    this.onEvent = this.recvEvent.bind(this);
    channel.addListener(this.onEvent);     // input for events
    
    
    this.onResponse = this.recvResponse.bind(this);
    channel.addListener(this.onResponse);  // input for sendCommand responses
  };
  
  remoteByWebInspectorPart.disconnect = function(log, channel) {
    if (this.onEvent) {
      channel.removeListener(this.onEvent);
      delete this.onEvent;
      channel.removeListener(this.onReponse);
      delete this.onResponse;
    } // else not connected
  };
  
  return remoteByWebInspectorPart;

});
