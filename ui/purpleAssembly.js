// Set up default UI
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['browser/channelByPostMessage'], 
function(                      channel) {

var purpleAssembly = {
  wireDefaultEditor: function() {
    debugger;
  },

  gcLoad: function (event) {
    var editorFrame = event.target.getElementById('editor.iframe');
    if (editorFrame) {
      return; // not our load
    }
    window.removeEventListener('load', purpleAssembly.gcLoad, false);
    purpleAssembly.wireDefaultEditor(event);
  }
};

window.addEventListener('load', purpleAssembly.gcLoad, false);


});