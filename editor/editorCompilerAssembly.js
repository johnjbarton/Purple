// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

/*globals define console window*/

define(['editor/editorInterface', 'editor/editorDelegator', 'compiler/traceuratops/compileFeatureByTraceur'], 
function(       editorInterface,                   editor,                               compilerByTraceur) {

  // Web Inspector bug 'use strict';
  
  var editorCompilerAssembly = {
    commands: editorInterface.events,
    events: editorInterface.commands
  };
  
  editorCompilerAssembly.events.open = function(url, line, column, fncOfEditor) {
    console.log("editor open called with ", arguments);
    var opened = editor.open(url, line, column);
    opened.then(fncOfEditor).end();
  };
  
  editorCompilerAssembly.events.show = function(name, src, lineNumber, columnNumber, endNumber) {
    console.log("editor show called with ", arguments);
    editor.setContent(name, lineNumber, columnNumber, endNumber, src);
  };
  
  editorCompilerAssembly.initialize = function () {
  
      this.editor = editor;
      editor.initialize();

      this.compiler = compilerByTraceur;
      
      this.editor.addListener(function(method, args) {
        this[method].apply(this, args);
      }.bind(this));
  };
 
  editorCompilerAssembly.saveFocus = function() {
    this.activeElement = window.document.activeElement;
  };

  editorCompilerAssembly.restoreFocus = function() {
    if(this.activeElement) {
      this.activeElement.focus();
    }
    editor.setFocus();
  };
  
  // -----------------------------------------------------------------------------------
  // 

  editorCompilerAssembly.onSourceChange = function(name, src, startDamage, endDamage) {
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
  };
  
  editorCompilerAssembly.onLineRevealed = function(name, beginLine, endLine, tokenStyles) {
    var tokenRanges = this.compiler.getTokenRangesByLines(name, beginLine, endLine);
    this.editor.convertTokenTypes(tokenRanges, tokenStyles);
  };
  
  return editorCompilerAssembly;
});