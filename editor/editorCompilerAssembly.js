// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

/*globals define console window*/

define(['editor/editorDelegator', 'compiler/traceuratops/compileFeatureByTraceur'], 
function(       EditorDelegator,                               compilerByTraceur) {

  // -----------------------------------------------------------------------------------
  // Private impl

  function onSourceChange(name, src, startDamage, endDamage) {
    if (src) {
      var compiled = this.compiler.compile(name, src);
      if (compiled) {
        var value = eval(compiled);
        this.editor.showValue(value);
        // allow the caller to use the result
        return compiled;
      } else {
        var indicators = this.compiler.reporter.errorIndicators;
        var summary;
        indicators.forEach(function summarizeErrors(indicator) {
          if (!summary)  {
            summary = indicator;
          } else {
            if (summary.line === indicator.line) {
              if (indicator.join) {
                summary.token += indicator.token;
              } // else first one wins
            } else {
              this.editor.reportError(summary);
            }
          }
        }.bind(this));
        this.editor.reportError(summary);
      } 
    }
    // else ignore empty buffers
  }
  
  function onLineRevealed(name, beginLine, endLine, tokenStyles) {
    var tokenRanges = this.compiler.getTokenRangesByLines(name, beginLine, endLine);
    this.editor.convertTokenTypes(tokenRanges, tokenStyles);
  }

  //---------------------------------------------------------------------

  function EditorCompilerAssembly(element) {
    this.editor = new EditorDelegator(element);
    this.compiler = compilerByTraceur;
    this.editor.addSourceChangeListener(onSourceChange.bind(this));
    this.editor.addLineRevealedListener(onLineRevealed.bind(this));
    this.open = this.editor.open.bind(this.editor);
  }
  
  //------------------------------------------------------------------------------------
  // API
  EditorCompilerAssembly.prototype = {
   
  };
  
  
  //------------------------
   
  EditorCompilerAssembly.prototype.saveFocus = function() {
    this.activeElement = window.document.activeElement;
  };

  EditorCompilerAssembly.prototype.restoreFocus = function() {
    if(this.activeElement) {
      this.activeElement.focus();
    }
    this.setFocus();
  };
  
  
  return EditorCompilerAssembly;
});