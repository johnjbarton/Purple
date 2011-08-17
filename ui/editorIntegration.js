window.purple = window.purple || {}; // our namespace
  
window.purple.editorIntegration = {

  onEditorReady: function(editorAPI) {
  	this.editorAPI = editorAPI;
  	this.initializeEditor();
  	//editor.getTextView().addEventListener(eventName, forwarder, forwarder.forwardIt, remoteMethod);
  },  	
  
  initializeEditor: function() {	  
  	this.editorAPI.setContent("unnamed", "");
  }
};
