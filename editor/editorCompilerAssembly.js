// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

/*globals define console window*/

define(['editor/editorInterface', 'editor/editorDelegator',  'q-comm/q-rpc', 'compiler/traceuratops/compileFeatureByTraceur'], 
function(       editorInterface,                   editor,           Q_RPC,                               compilerByTraceur) {

  'use strict';
  
  var editorCompilerAssembly = {
    commands: editorInterface.events,
    events: editorInterface.commands
  };
  
  editorCompilerAssembly.events.open = function(url, line, column) {
    console.log("editor open called with ", arguments);
    var opened = editor.open(url, line, column);
    opened.then(function(openedEditor) {
      return this;
    }).end();
  };
  
  editorCompilerAssembly.initialize = function () {
      this.remote = Q_RPC.makeStub(window, this.commands, this.events);
  
      this.editor = editor;
      editor.initialize();

      this.compiler = compilerByTraceur;
  };
  
  editorCompilerAssembly.destroy = function() {
      this.compiler.disconnect(editor);
      this.compiler.destroy();
      editor.destroy();
  };
  
  editorCompilerAssembly.connect = function(editor){
    this.editorPart.editor = editor;
    editor.setContent("purpleDemo.js",1,1,1, "purple");
  };
  
  editorCompilerAssembly.disconnect = function(editor) {
    if (this.editorPart.editor && editor === this.editorPart.editor) {
        editor.unregisterPart(this.editorPart);
        delete this.editorPart.editor;
    }
  };
  
  // -----------------------------------------------------------------------------------
  // 

  editorCompilerAssembly.onSourceChange = function(name, src, startDamage, endDamage) {
    if (src) {
      var compiled = this.compiler.compile(name, src);
      if (compiled) {
        var value = eval(compiled);
        this.editor.showValue(value, 1, 1);
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
        });
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