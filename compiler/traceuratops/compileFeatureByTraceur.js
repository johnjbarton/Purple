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
    "'identifier' expected": function(format, args, message) {
      return {token: "identifier", tooltip: "expected", join: true};
    },
    "'(' expected": function(format, args, message) {
      return {token: "(", tooltip: "expected", join: true};
    },
    "')' expected": function(format, args, message) {
      return {token: ")", tooltip: "expected", join: true};
    },
    "'{' expected": function(format, args, message) {
      return {token: "{", tooltip: "expected", join: true};
    },
    "'}' expected": function(format, args, message) {
      return {token: "}", tooltip: "expected", join: true};
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
      indicator = {token: format, tooltip: message};
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
  
  var compiler__ =  new thePurple.PurplePart('compilerByTraceur');  // the __ bit just makes the method names stand out.
    
  compiler__.partAdded = function(partInfo){
    if (partInfo.value.hasFeature('editor')) {
      this.editorPart.setEditor(partInfo.value);
    }
  }
  
  compiler__.partRemoved = function(partInfo) {
    if (this.editor && partInfo.value === this.editor) {
        this.editor.unregisterPart(this.editorPart);
    }
  };
  
  // -----------------------------------------------------------------------------------
  // From editor
  compiler__.editorPart = new thePurple.PurplePart("compilerByTraceur");

  compiler__.editorPart.setEditor = function(editor) {
    this.editor = editor;
    this.editor.setContent("purpleDemo.js", "purple");
    this.editor.registerPart(this);
  };
  

  compiler__.editorPart.onSourceChange = function(name, src, startDamage, endDamage) {
    if (src) {
      var res = compiler__.compile(name, src);
      if (res) {
        var value = evaluate(res);
        this.editor.showValue(value, 1, 1);
      } else {
        var indicators = compiler__.reporter.errorIndicators;
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
  
  compiler__.editorPart.onLineRevealed = function(name, beginLine, endLine, tokenStyles) {
    var tokenRanges = [];
    if (compiler__.compiler) {
       var file = compiler__.compiler.project_.getFile(name)
       var tree = compiler__.compiler.project_.getParseTree(file);
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

    compiler__.reporter = new traceur.util.ErrorReporter();
    compiler__.reporter.reportMessageInternal = reportToPurple;
    compiler__.compiler = new traceur.codegeneration.Compiler(compiler__.reporter, project);
    compiler__.compiler.parseFile_(sourceFile);
    compiler__.compiler.analyzeFile_(sourceFile);
    compiler__.compiler.transformFile_(sourceFile);

    if (compiler__.compiler.hadError_()) {
      return null;
    }
    return compiler__.compiler.results_;
  };

  compiler__.implementsFeature('compiler');
  thePurple.registerPart(compiler__);

})();
