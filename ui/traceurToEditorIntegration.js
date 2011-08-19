// See license.txt for BSD license
// Some characters in this file from Apache 2.0 licensed code elsewhere in this project.
// Copyright Google 2011.  johnjbarton@johnjbarton.com

/*
 * Traceur to Editor Integration 
 */

window.purple = window.purple || {}; // our namespace
  
window.purple.traceurToEditorIntegration = {
  // -----------------------------------------------------------------------------------
  // To Editor
  onEditorReady: function(editorAPI) {
    this.editorAPI = editorAPI;
    this.initializeEditor();
  },    
  
  initializeEditor: function() {    
    this.editorAPI.setContent("purpleDemo.js", "");
  },
  
  reportError: function(indicator) {
    this.editorAPI.reportError(indicator);
  },
  // -----------------------------------------------------------------------------------
  // From editor
  onSourceChange: function(name, src, startDamage, endDamage) {
    console.warning("Source change to "+name+" not overridden");
  },
  
};

(function() {
  'use strict';

  var hasError = false;
  var errorTypes = {
      "%s is not defined": function(format, args, message) {
        return {token: 'undefined', tooltip: message};
      },
    };
    
  function reportToPurple(location, kind, format, args) {
    var i = 0;
    var message = format.replace(/%s/g, function() {
      return args[i++];
    });
      
    var getIndicator = errorTypes[format];
    if (getIndicator) {
      var indicator = getIndicator(format, args, message);
    } else {
      if (location) format = location + ': ' + message;
      console.log("Unknown Traceur error: "+format);
      var indicator = {token: 'error', tooltip: message};
    }
	indicator.line = location.line;
	indicator.column = location.column;
	
    window.purple.traceurToEditorIntegration.reportError(indicator);
  };

  function compile(name, src) {
    hasError = false;
    
    var reporter = new traceur.util.ErrorReporter();
    reporter.reportMessageInternal = reportToPurple;
    
    var project = new traceur.semantics.symbols.Project();
    var contents = src;
    var sourceFile = new traceur.syntax.SourceFile(name, contents);
    project.addFile(sourceFile);
    var res = traceur.codegeneration.Compiler.compile(reporter, project, false);
    if (reporter.hadError()) {
      hasError = true;
    } else {
      var source = traceur.codegeneration.ProjectWriter.write(res);
      console.log("Traceur generated code", source);
      if (evalCheckbox.checked) {
        try {
          evalElement.textContent = ('global', eval)(source);
        } catch(ex) {
          hasError = true;
          console.error("eval error "+ex, ex);
        }
      }
    }
  }

  window.purple.traceurToEditorIntegration.onSourceChange = function(name, src, startDamage, endDamage) {
    if (src) compile(name, src);
  }
})();
