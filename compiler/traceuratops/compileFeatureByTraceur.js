// See license.txt for BSD license
// Some characters in this file from Apache 2.0 licensed code elsewhere in this project.
// Copyright Google 2011.  johnjbarton@johnjbarton.com

/*
 * Traceur Integration 
 */

/*globals define traceur console*/

define(['compiler/traceuratops/ParseTreeStyler', 'compiler/traceuratops/ParseTreeLeafFinder'], 
function(                      ParseTreeStyler,                         ParseTreeLeafFinder) {
  'use strict';
  
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
    }
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
  
  var compilerFeatureByTraceur = {};
  
  compilerFeatureByTraceur.getTokenRangesByLines = function(name, beginLine, endLine) {
    var tokenRanges = [];
    if (compilerFeatureByTraceur.compiler) {
      var file = compilerFeatureByTraceur.compiler.project_.getFile(name);
      var tree = compilerFeatureByTraceur.compiler.project_.getParseTree(file);
      var path = ParseTreeLeafFinder.getParseTreePathByIndex(tree, beginLine);
      if (path && path.length) {
        var treeAtIndex = path.pop();
        var styler = new ParseTreeStyler(treeAtIndex);
        tokenRanges = styler.getTokenRangesAround(beginLine, endLine);
      }
    } // else not compiled
    return tokenRanges;
  };
  
  //--------------------------------------------------------------------------------------
  compilerFeatureByTraceur.compile = function(name, src) {
    
    var project = new traceur.semantics.symbols.Project();
    var contents = src;
    var sourceFile = new traceur.syntax.SourceFile(name, contents);
    project.addFile(sourceFile);

    compilerFeatureByTraceur.reporter = new traceur.util.ErrorReporter();
    compilerFeatureByTraceur.reporter.reportMessageInternal = reportToPurple;
    compilerFeatureByTraceur.compiler = new traceur.codegeneration.Compiler(compilerFeatureByTraceur.reporter, project);
    compilerFeatureByTraceur.compiler.parseFile_(sourceFile);
    compilerFeatureByTraceur.compiler.analyzeFile_(sourceFile);
    compilerFeatureByTraceur.compiler.transformFile_(sourceFile);

    if (compilerFeatureByTraceur.compiler.hadError_()) {
      return null;
    }
    var res = compilerFeatureByTraceur.compiler.results_;
    var source = traceur.codegeneration.ProjectWriter.write(res);
    return source;
  };

  return compilerFeatureByTraceur;
});
