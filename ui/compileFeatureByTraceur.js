// See license.txt for BSD license
// Some characters in this file from Apache 2.0 licensed code elsewhere in this project.
// Copyright Google 2011.  johnjbarton@johnjbarton.com

/*
 * Traceur to Editor Integration 
 */


(function() {
  'use strict';
  
  var thePurple = window.purple;


  var indicatorGetters = {
    "%s is not defined": function(format, args, message) {
      return {token: 'undefined', tooltip: message};
    },
  };

  function reportToPurple(location, kind, format, args) {
    var i = 0;
    var message = format.replace(/%s/g, function() {
      return args[i++];
    });
      
    var indicator; // temp hack to shut jslint up
    var getIndicatorForMessage = indicatorGetters[format];
    if (getIndicatorForMessage) {
      indicator = getIndicatorForMessage(format, args, message);
    } else {
      if (location) {
        format = location + ': ' + message;
      }
      console.log("Unknown Traceur error: "+format);
      indicator = {token: 'error', tooltip: message};
    }
	indicator.line = location.line;
	indicator.column = location.column;
	
	this.errorIndicators = this.errorIndicators || [];
	this.errorIndicators.push(indicator);
  }
  
  function evaluate(res) {
    var source = traceur.codegeneration.ProjectWriter.write(res);
    thePurple.log("Traceur generated code", source);
    try {
      return ('global', eval)(source);
    } catch(ex) {
      return ex;
    }
  }

  
  thePurple.compileFeatureByTraceur = new thePurple.PurplePart();
  
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var compiler__ = thePurple.compileFeatureByTraceur;
    
  compiler__.connect = function(thePurple){
    this.editor = thePurple.getFeature('editor');
    this.editor.setContent("purpleDemo.js", "purple");
    this.editor.addListener(this);
  }
  
  compiler__.disconnect = function(thePurple) {
    this.editor.removeListener(this);
  };
  
  // -----------------------------------------------------------------------------------
  // From editor
  
  compiler__.onSourceChange = function(name, src, startDamage, endDamage) {
    if (src) {
      var res = this.compile(name, src);
      if (res) {
        var value = evaluate(res);
        this.editor.showValue(value, 1, 1);
      } else {
        this.editor.reportError(this.reporter.errorIndicators[0]);
      } 
    }
    // else ignore empty buffers
  };
  
  compiler__.compile = function(name, src) {
    
    var project = new traceur.semantics.symbols.Project();
    var contents = src;
    var sourceFile = new traceur.syntax.SourceFile(name, contents);
    project.addFile(sourceFile);

    this.reporter = new traceur.util.ErrorReporter();
    this.reporter.reportMessageInternal = reportToPurple;
    this.compiler = new traceur.codegeneration.Compiler(this.reporter, project);
    this.compiler.parseFile_(sourceFile);
    this.compiler.analyzeFile_(sourceFile);
    this.compiler.transformFile_(sourceFile);

    if (this.compiler.hadError_()) {
      return null;
    }
    return this.compiler.results_;
  };
  
  thePurple.registerPart(thePurple.compileFeatureByTraceur);

})();
