// Copyright 2011 Google Inc. 
// see license.txt for BSD license
// johnjbarton@google.com
//

/*
 * Create one or more Style ranges for a source range in a Parse Tree
 */
define(['compiler/compiler'], function(compiler) {
  'use strict';
  
  function ParseTreeStyler(tree) {
    this.tree = tree;
    this.tokenTypes = [];
  }
  
  ParseTreeStyler.prototype = {
    getTokenRangesAround: function(beginLine, endLine) {
      this.styleAny(this.tree, beginLine, endLine);
      return this.tokenTypes;
    },
    
    styleAny: function(tree, beginLine, endLine) {
      var getTreeNameForType = traceur.syntax.trees.getTreeNameForType;
      var name = getTreeNameForType(tree.type);
      var method = this['style' + name];
      if (method) {
        method.apply(this, arguments);
      } else {
        console.warn("No ParseTreeStyler for "+name);
      }
    },
    
    styleBlock: function(tree, beginLine, endLine) {
      this.appendPunctuator(tree.location.start.offset, beginLine, endLine);
      this.appendPunctuator(tree.location.end.offset - 1, beginLine, endLine);  // end exclusive
    },
    
    appendPunctuator: function(point, beginLine, endLine) {
      if (point >= beginLine && point < endLine) {
        this.tokenTypes.push({start: point, end: point+1, tokenType: 'Punctuator'});
      }
    }
  };
  
  return ParseTreeStyler;
});