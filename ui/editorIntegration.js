window.purple = window.purple || {}; // our namespace
   
  
window.purple.editorIntegration = {
  // -----------------------------------------------------------------------------------
  // To Editor
  onEditorReady: function(editorAPI) {
    this.editorAPI = editorAPI;
    this.initializeEditor();
  },    
  
  initializeEditor: function() {    
    this.editorAPI.setContent("inBrowser", "");
  },
  
  reportError: function(indicator, location) {
    this.editorAPI.reportError(indicator, location);
  },
  // -----------------------------------------------------------------------------------
  // From editor
  onSourceChange: function(name, src, startDamage, endDamage) {
    console.warning("Source change to "+name+" not overridden");
  },
  
};
