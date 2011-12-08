// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*global chrome console */

function AppState(client) {
  this.name = 'crx2app_' + ( ++AppState.totalClients );
  this.debuggerTabId =  client.tab.id;
  this.debuggerURL = client.url;
  this.bindListeners();
}

AppState.totalClients = 0;

AppState.prototype = {
  // Open a web page for debugging by client
  open: function(createData) {
    if (this.window) { 
      chrome.tabs.create({windowId: this.window.id, url: createData.url}, this.onDebuggeeTab);
    } else {
      var cleanCreateData = this._cleanseCreateData(createData);
      chrome.windows.create(cleanCreateData, this.onDebuggeeWindow);
    }
  },
  
  // callback from chrome.windows.create
  // @param http://code.google.com/chrome/extensions/dev/windows.html#type-Window
  onDebuggeeWindow: function(win) {
    console.assert(win.tabs.length === 1, "The number of tabs in a newly created window should be one");
    this.window = win;
    this.onDebugeeTab(win.tabs[0]);
  },
  
  onDebuggeeTab: function(tab) {
    this.tab = tab;
    
  },
  
  // copy allowed fields, force values on others
  _cleanseCreateData: function(createData) {
    return {
      url: createData.url,
      left: createData.left,
      top: createData.top,
      width: createData.width,
      height: createData.height,
      focused: createData.focused,
      type: createData.type,
      incognito: true   // Forced 
    };
  },
  
  _bindListeners: function() {
    this.onDebuggeeWindow.bind(this);
    this.onDebuggeeTab.bind(this);
  }
};