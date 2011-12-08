// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com


function main() {
  
  // Meta object to create adapters on request
  var chromeAdapterFactory = {
    adapterCtors: {
      'debugger': Debugger2JSON,
    },
    
    getByName: function(obj, name) {
      if (obj.hasOwnProperty(name)) {
        return obj[name];
      }
    },
    
    methods: {
      
      // 
      attach: function(adapterName) {
        var adapter = this.getByName(this.adapterCtors, adapterName);
        if (adapter) {
          
        }
      }
    },
    
    //  handle meta-requests for given client 
    onRequest: function(client, request) {
      var method = this.getByName(this.methods, request.method);
      if (method) {
        method.apply(this, [client].concat(request.params)); 
      }
    }
  };
  
  // JSONable objects come up from content-script and are routed
  // to one of the chromeAdapters. 
  var chromeAdapters = {
    'crx2app': chromeAdapterFactory
  };
  
  crxEnd.attach(chromeAdapters, AppState);
  
}();

