// See license.txt for BSD license
// Some characters in this file from Apache 2.0 licensed code elsewhere in this project.
// Copyright Google 2011.  johnjbarton@johnjbarton.com

/*
 * Traceur to Editor Integration 
 */


(function() {
  'use strict';
  
  var thePurple = window.purple;
  var ParseTreeStyler = thePurple.ParseTreeStyler;

  //---------------------------------------------------------------------------------------
  // Private 
  
  var traceurToEcmaTypes = {
    END_OF_FILE: 'End of File',
    ERROR: 'Error',

    // 7.6 Identifier Names and Identifiers
    IDENTIFIER: 'IdentifierName',

    // 7.6.1.1 keywords
    BREAK: 'ReservedWord',
    CASE: 'ReservedWord',
    CATCH: 'ReservedWord',
    CONTINUE: 'ReservedWord',
    DEBUGGER: 'ReservedWord',
    DEFAULT: 'ReservedWord',
    DELETE: 'ReservedWord',
    DO: 'ReservedWord',
    ELSE: 'ReservedWord',
    FINALLY: 'ReservedWord',
    FOR: 'ReservedWord',
    FUNCTION: 'ReservedWord',
    IF: 'ReservedWord',
    IN: 'ReservedWord',
    INSTANCEOF: 'ReservedWord',
    NEW: 'ReservedWord',
    RETURN: 'ReservedWord',
    SWITCH: 'ReservedWord',
    THIS: 'ReservedWord',
    THROW: 'ReservedWord',
    TRY: 'ReservedWord',
    TYPEOF: 'ReservedWord',
    VAR: 'ReservedWord',
    VOID: 'ReservedWord',
    WHILE: 'ReservedWord',
    WITH: 'ReservedWord',

    // 7.6.1.2 Future reserved words
    CLASS: 'ReservedWord',
    CONST: 'ReservedWord',
    ENUM: 'ReservedWord',
    EXPORT: 'ReservedWord',
    EXTENDS: 'ReservedWord',
    IMPORT: 'ReservedWord',
    SUPER: 'ReservedWord',

    // Future reserved words in strict mode
    IMPLEMENTS: 'ReservedWord',
    INTERFACE: 'ReservedWord',
    LET: 'ReservedWord',
    PACKAGE: 'ReservedWord',
    PRIVATE: 'ReservedWord',
    PROTECTED: 'ReservedWord',
    PUBLIC: 'ReservedWord',
    STATIC: 'ReservedWord',
    YIELD: 'ReservedWord',

    // 7.7 Punctuators
    OPEN_CURLY: 'Punctuator',
    CLOSE_CURLY: 'Punctuator',
    OPEN_PAREN: 'Punctuator',
    CLOSE_PAREN: 'Punctuator',
    OPEN_SQUARE: 'Punctuator',
    CLOSE_SQUARE: 'Punctuator',
    PERIOD: 'Punctuator',
    SEMI_COLON: 'Punctuator',
    COMMA: 'Punctuator',
    OPEN_ANGLE: 'Punctuator',
    CLOSE_ANGLE: 'Punctuator',
    LESS_EQUAL: 'Punctuator',
    GREATER_EQUAL: 'Punctuator',
    EQUAL_EQUAL: 'Punctuator',
    NOT_EQUAL: 'Punctuator',
    EQUAL_EQUAL_EQUAL: 'Punctuator',
    NOT_EQUAL_EQUAL: 'Punctuator',
    PLUS: 'Punctuator',
    MINUS: 'Punctuator',
    STAR: 'Punctuator',
    PERCENT: 'Punctuator',
    PLUS_PLUS: 'Punctuator',
    MINUS_MINUS: 'Punctuator',
    LEFT_SHIFT: 'Punctuator',
    RIGHT_SHIFT: 'Punctuator',
    UNSIGNED_RIGHT_SHIFT: 'Punctuator',
    AMPERSAND: 'Punctuator',
    BAR: 'Punctuator',
    CARET: 'Punctuator',
    BANG: 'Punctuator',
    TILDE: 'Punctuator',
    AND: 'Punctuator',
    OR: 'Punctuator',
    QUESTION: 'Punctuator',
    COLON: 'Punctuator',
    EQUAL: 'Punctuator',
    PLUS_EQUAL: 'Punctuator',
    MINUS_EQUAL: 'Punctuator',
    STAR_EQUAL: 'Punctuator',
    PERCENT_EQUAL: 'Punctuator',
    LEFT_SHIFT_EQUAL: 'Punctuator',
    RIGHT_SHIFT_EQUAL: 'Punctuator',
    UNSIGNED_RIGHT_SHIFT_EQUAL: 'Punctuator',
    AMPERSAND_EQUAL: 'Punctuator',
    BAR_EQUAL: 'Punctuator',
    CARET_EQUAL: 'Punctuator',
    SLASH: 'Punctuator',
    SLASH_EQUAL: 'Punctuator',

    // 7.8 Literals
    NULL: 'Punctuator',
    TRUE: 'Punctuator',
    FALSE: 'Punctuator',
    NUMBER: 'NumericLiteral',
    STRING: 'StringLiteral',
    REGULAR_EXPRESSION: 'RegularExpressionLiteral',

    // Harmony extensions
    SPREAD: 'Punctuator',
    AWAIT: 'ReservedWord',
    FAT_ARROW: 'Punctuator',
    THIN_ARROW: 'Punctuator'
    };
  
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
  
  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  thePurple.compileFeatureByTraceur = new thePurple.PurplePart();
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
  
  compiler__.onLineRevealed = function(name, beginLine, endLine, tokenStyles) {
    var tokenRanges = [];
    if (this.compiler) {
       var file = this.compiler.project_.getFile(name)
       var tree = this.compiler.project_.getParseTree(file);
       var path = thePurple.ParseTreeLeafFinder.getParseTreePathByIndex(tree, beginLine);
       if (path && path.length) {
         var treeAtIndex = path.pop();
         var styler = new ParseTreeStyler(treeAtIndex);
         var tokenRanges = styler.getTokenRangesAround(beginLine, endLine);
         this.editor.convertTokenTypes(tokenRanges, tokenStyles);
       }
    }
  }
  
  //--------------------------------------------------------------------------------------
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
