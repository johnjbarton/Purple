// Copyright 2011 Google Inc. 
// see license.txt for BSD license
// johnjbarton@google.com
//

/*
 * Visit the ParseTree to find a leaf by source character offset.
 * the visitAny and checkMark functions return the distance between
 * the 'mark' (requested source offset) and the closest edge of a
 * tree range. The visit* functions return true if this distance > 0, 
 * meaning that the mark is in front of the tree and we need to keep 
 * looking.  As a side effect of the visit we create a stack of the 
 * trees that enclose the mark, nesting to the right.
 */

/*globals define*/ 
 
define([], 
function() {
  'use strict';

  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  var ParseTreeWriter = traceur.codegeneration.ParseTreeWriter;
  var getTreeNameForType = traceur.syntax.trees.getTreeNameForType;

  /**
   *  a parse tree
   *
   * @constructor
   * @extends {ParseTreeVisitor}
   */
  function ParseTreeLeafFinder(characterIndex) {
    this.mark = characterIndex;
    this.nestingStack = []; // all trees that enclose mark
    ParseTreeVisitor.call(this);
  }

  /**
   * An error thrown when an invalid parse tree is encountered. 
   *
   * @param {traceur.syntax.trees.ParseTree} tree
   * @param {string} message
   * @constructor
   */
  function LeafFinderError(tree, message) {
    this.tree = tree;
    this.message = message;
  }
  LeafFinderError.prototype = Object.create(Error.prototype);

  /**
   * Find a leaf by zero-based source character index.
   *
   * @param {traceur.syntax.trees.ParseTree} tree
   * @return {array traceur.syntax.trees.ParseTree} stack of enclosing trees
   */
  ParseTreeLeafFinder.getParseTreePathByIndex = function(tree, index) {
    var finder = new ParseTreeLeafFinder(index);
    try {
      finder.visitAny(tree);
      return finder.pathToIndex;
    } catch (e) {
      if (!(e instanceof LeafFinderError)) {
        throw e;
      }

      var location = null;
      if (e.tree !== null) {
        location = e.tree.location;
      }
      if (location === null) {
        location = tree.location;
      }
      var locationString = location !== null ?
          location.start.toString() :
          '(unknown)';
      throw Error('Parse tree validation failure \'' + e.message + '\' at ' +
          locationString +
          ':\n\n' +
          ParseTreeWriter.write(tree, e.tree, true) +
          '\n');
    }
  };

  ParseTreeLeafFinder.prototype = traceur.createObject(
      ParseTreeVisitor.prototype, {

    /**
     * @param {traceur.syntax.trees.ParseTree} tree
     * @param {string} message
     */
    fail_: function(tree, message) {
      throw new LeafFinderError(tree, message);
    },

    /**
     * @param {traceur.syntax.trees.ParseTree} tree
     */
    visitAny: function(tree) {
      if (tree === null) {
        return;
      }
      if (!tree.location) {  // eg parameters for function()
        return 1; // keep looking
      }
      this.nestingStack.push(tree);
      var distanceToMark = this.compareMark(tree);
      if (!distanceToMark) {  // then this tree surrounds the mark
        var name = getTreeNameForType(tree.type);
        this['visit' + name](tree);
      }
      this.nestingStack.pop();
      return distanceToMark; 
    },

    searchArrayForMark: function(array) {
      if (array.length) {
        return this.binarySearchForMark(array, 0, array.length - 1);
      } else {
        return 1; // keep looking
      }
    },
    
    binarySearchForMark: function(array, low, high) {
      if (high < low) {
        throw new Error("ParseTreeLeafFinder bug, array bounds out of order");
      }
      var mid = low + Math.floor( (high - low) / 2);
      var midDistance = this.visitAny(array[mid]);
      if (midDistance < 0) {  // the mark is behind mid' range
        if (mid === low) { // there is nothing behind mid
          return midDistance;
        } else {
          return this.binarySearchForMark(array, low, mid - 1);
        }
      } else if (midDistance > 0) {  // the mark is ahead of mid's range
        if (mid === high) { // there is nothing ahead of mid
          return midDistance;
        } else {
          return this.binarySearchForMark(array, mid + 1, high);
        }
      } else {  // the mark is in mid's range
        return midDistance;
      }
    },
    
    /**
     * @param {traceur.syntax.trees.ArgumentList} tree
     */
    visitArgumentList: function(tree) {
      this.searchArrayForMark(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.ArrayLiteralExpression} tree
     */
    visitArrayLiteralExpression: function(tree) {
      this.searchArrayForMark(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.ArrayPattern} tree
     */
    visitArrayPattern: function(tree) {
     this.searchArrayForMark(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.AwaitStatement} tree
     */
    visitAwaitStatement: function(tree) {
      return (this.compareMark(tree.identifier) > 0) && (this.visitAny(tree.expression) > 0);
    },

    /**
     * @param {traceur.syntax.trees.BinaryOperator} tree
     */
    visitBinaryOperator: function(tree) {
      return  (this.visitAny(tree.left) > 0) && (this.visitAny(tree.operator) > 0) && (this.visitAny(tree.right) > 0);
    },

    /**
     * @param {traceur.syntax.trees.Block} tree
     */
    visitBlock: function(tree) {
      this.searchArrayForMark(tree.statements);
    },

    /**
     * @param {traceur.syntax.trees.CallExpression} tree
     */
    visitCallExpression: function(tree) {
      return (this.visitAny(tree.operand) > 0) && (this.visitAny(tree.args) > 0);
    },

    /**
     * @param {traceur.syntax.trees.CaseClause} tree
     */
    visitCaseClause: function(tree) {
      if (this.visitAny(tree.expression) > 0) {
        this.searchArrayForMark(tree.statements);
      }
    },

    /**
     * @param {traceur.syntax.trees.Catch} tree
     */
    visitCatch: function(tree) {
      return (this.compareMark(tree.exceptionName) > 0) && (this.visitAny(tree.catchBody) > 0);
    },

    /**
     * @param {traceur.syntax.trees.ClassDeclaration} tree
     */
    visitClassDeclaration: function(tree) {
      if ( (this.compareMark(tree.name) > 0) &&  (this.visitAny(tree.superClass) > 0) ) {
        this.searchArrayForMark(tree.elements);
      }
    },

    /**
     * @param {traceur.syntax.trees.CommaExpression} tree
     */
    visitCommaExpression: function(tree) {
      this.searchArrayForMark(tree.expressions);
    },

    /**
     * @param {traceur.syntax.trees.ConditionalExpression} tree
     */
    visitConditionalExpression: function(tree) {
      return (this.visitAny(tree.condition) > 0) && (this.visitAny(tree.left) > 0) && (this.visitAny(tree.right) > 0);
    },

    /**
     * @param {traceur.syntax.trees.DefaultClause} tree
     */
    visitDefaultClause: function(tree) {
      this.searchArrayForMark(tree.statements);
    },

    /**
     * @param {traceur.syntax.trees.DoWhileStatement} tree
     */
    visitDoWhileStatement: function(tree) {
      return (this.visitAny(tree.body) > 0) && (this.visitAny(tree.condition) > 0);
    },

    /**
     * @param {traceur.syntax.trees.ExportDeclaration} tree
     */
    visitExportDeclaration: function(tree) {
      return this.visitAny(tree.declaration);
    },

    /**
     * @param {traceur.syntax.trees.ExportPath} tree
     */
    visitExportPath: function(tree) {
      var found = this.visitAny(tree.moduleExpression);
      return found || this.visitAny(tree.specifier);
    },

    /**
     * @param {traceur.syntax.trees.ExportPath} tree
     */
    visitExportPathList: function(tree) {
      this.searchArrayForMark(tree.paths);
    },

    /**
     * @param {traceur.syntax.trees.ExportPathSpecifierSet} tree
     */
    visitExportPathSpecifierSet: function(tree) {
      return (this.compareMark(tree.identifier) > 0) && (this.visitList(tree.specifiers) > 0);
    },

    /**
     * @param {traceur.syntax.trees.ExportSpecifierSet} tree
     */
    visitExportSpecifierSet: function(tree) {
      this.searchArrayForMark(tree.specifiers);
    },

    /**
     * @param {traceur.syntax.trees.ExpressionStatement} tree
     */
    visitExpressionStatement: function(tree) {
      return (this.visitAny(tree.expression) > 0);
    },

    /**
     * @param {traceur.syntax.trees.FieldDeclaration} tree
     */
    visitFieldDeclaration: function(tree) {
      this.searchArrayForMark(tree.declarations);
    },

    /**
     * @param {traceur.syntax.trees.Finally} tree
     */
    visitFinally: function(tree) {
      return (this.visitAny(tree.block) > 0);
    },

    /**
     * @param {traceur.syntax.trees.ForEachStatement} tree
     */
    visitForEachStatement: function(tree) {
      return (this.visitAny(tree.initializer) > 0) && (this.visitAny(tree.collection) > 0) && (this.visitAny(tree.body) > 0);
    },

    /**
     * @param {traceur.syntax.trees.ForInStatement} tree
     */
    visitForInStatement: function(tree) {
      return (this.visitAny(tree.initializer) > 0) && (this.visitAny(tree.collection) > 0) && (this.visitAny(tree.body) > 0);
    },

    /**
     * @param {traceur.syntax.trees.FormalParameterList} tree
     */
    visitFormalParameterList: function(tree) {
      this.searchArrayForMark(tree.parameters);
    },

    /**
     * @param {traceur.syntax.trees.ForStatement} tree
     */
    visitForStatement: function(tree) {
      if (tree.initializer !== null && !tree.initializer.isNull()) {
        if (this.visitAny(tree.initializer) > 0) {
          if (tree.condition !== null) {
            if (this.visitAny(tree.condition) > 0) {
              if (tree.increment !== null) {
                if (this.visitAny(tree.increment) > 0) {
                  this.visitAny(tree.body);
                }
              }
            }
          }
        }
      }
    },
    
    /**
     * @param {traceur.syntax.trees.FunctionDeclaration} tree
     */
    visitFunctionDeclaration: function(tree) {
      return (this.visitAny(tree.formalParameterList) > 0) && (this.visitAny(tree.functionBody) > 0);
    }, 

    /**
     * @param {traceur.syntax.trees.GetAccessor} tree
     */
    visitGetAccessor: function(tree) {
      return (this.compareMark(tree.propertyName) > 0) && (this.visitAny(tree.body) > 0);
    },

    /**
     * @param {traceur.syntax.trees.IfStatement} tree
     */
    visitIfStatement: function(tree) {
      if ( (this.visitAny(tree.condition) > 0) && (this.visitAny(tree.ifClause) > 0) ) {
        if (tree.elseClause !== null) {
          return (this.visitAny(tree.elseClause) > 0);
        }
      }
    },

    /**
     * @param {traceur.syntax.trees.LabelledStatement} tree
     */
    visitLabelledStatement: function(tree) {
      return (this.compareMark(tree.name) > 0) && (this.visitAny(tree.statement) > 0);
    },

    /**
     * @param {traceur.syntax.trees.MemberExpression} tree
     */
    visitMemberExpression: function(tree) {
      return (this.compareMark(tree.memberName) > 0) && (this.visitAny(tree.operand) > 0);
    },

    /**
     * @param {traceur.syntax.trees.MemberLookupExpression} tree
     */
    visitMemberLookupExpression: function(tree) {
      return  (this.visitAny(tree.operand) > 0) && (this.visitAny(tree.memberExpression) > 0);
    },

    /**
     * @param {traceur.syntax.trees.MissingPrimaryExpression} tree
     */
    visitMissingPrimaryExpression: function(tree) {
      return (this.compareMark(tree.nextToken) > 0);
    },

    /**
     * @param {traceur.syntax.trees.MixinResolveList} tree
     */
    visitMixinResolveList: function(tree) {
      this.searchArrayForMark(tree.resolves);
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinition} tree
     */
    visitModuleDeclaration: function(tree) {
      this.searchArrayForMark(tree.specifiers);
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinition} tree
     */
    visitModuleDefinition: function(tree) {
      this.searchArrayForMark(tree.elements);
    },

    /**
     * @param {traceur.syntax.trees.ModuleRequire} tree
     */
    visitModuleRequire: function(tree) {
       return (this.compareMark(tree.url) > 0);
    },

    /**
     * @param {traceur.syntax.trees.ModuleSpecifier} tree
     */
    visitModuleSpecifier: function(tree) {
      return (this.compareMark(tree) > 0) || (this.visitAny(tree.expression) > 0);
    },

    /**
     * @param {traceur.syntax.trees.NewExpression} tree
     */
    visitNewExpression: function(tree) {
      return (this.visitAny(tree.operand) > 0) && (this.visitAny(tree.args) > 0);
    },

    /**
     * @param {traceur.syntax.trees.ObjectLiteralExpression} tree
     */
    visitObjectLiteralExpression: function(tree) {
      this.searchArrayForMark(tree.propertyNameAndValues);
    },

    /**
     * @param {traceur.syntax.trees.ObjectPattern} tree
     */
    visitObjectPattern: function(tree) {
      this.searchArrayForMark(tree.fields);
    },

    /**
     * @param {traceur.syntax.trees.ObjectPatternField} tree
     */
    visitObjectPatternField: function(tree) {
      return (this.compareMark(tree.identifier) > 0) && (this.visitAny(tree.element) > 0);
    },

    /**
     * @param {traceur.syntax.trees.ParenExpression} tree
     */
    visitParenExpression: function(tree) {
        return (this.visitAny(tree.expression) > 0);
    },

    /**
     * @param {traceur.syntax.trees.PostfixExpression} tree
     */
    visitPostfixExpression: function(tree) {
      return (this.visitAny(tree.operand) > 0) && (this.compareMark(tree.operator) > 0);
    },

    /**
     * @param {traceur.syntax.trees.Program} tree
     */
    visitProgram: function(tree) {
      this.searchArrayForMark(tree.programElements);
    },

    /**
     * @param {traceur.syntax.trees.PropertyNameAssignment} tree
     */
    visitPropertyNameAssignment: function(tree) {
      return (this.compareMark(tree.name) > 0) && (this.visitAny(tree.value) > 0);
    },

    /**
     * @param {traceur.syntax.trees.PropertyNameShorthand} tree
     */
    visitPropertyNameShorthand: function(tree) {
      return (this.compareMark(tree.name) > 0);
    },

    /**
     * @param {traceur.syntax.trees.QualifiedReference} tree
     */
    visitQualifiedReference: function(tree) {
      return (this.visitAny(tree.moduleExpression) > 0) && (this.compareMark(tree.identifier) > 0);
    },

    /**
     * @param {traceur.syntax.trees.ReturnStatement} tree
     */
    visitReturnStatement: function(tree) {
      if (tree.expression !== null) {
        return (this.visitAny(tree.expression) > 0);
      }
    },

    /**
     * @param {traceur.syntax.trees.SetAccessor} tree
     */
    visitSetAccessor: function(tree) {
      return (this.compareMark(tree.propertyName) > 0) && (this.compareMark(tree.parameter) > 0) && (this.visitAny(tree.body) > 0);
    },

    /**
     * @param {traceur.syntax.trees.SpreadExpression} tree
     */
    visitSpreadExpression: function(tree) {
      return this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.StateMachine} tree
     */
    visitStateMachine: function(tree) {
      this.fail_(tree, 'State machines are never valid outside of the ' +
          'GeneratorTransformer pass.');
    },

    /**
     * @param {traceur.syntax.trees.SwitchStatement} tree
     */
    visitSwitchStatement: function(tree) {
      if (this.visitAny(tree.expression) > 0) {
        this.searchArrayForMark(tree.caseClauses);
      }
    },

    /**
     * @param {traceur.syntax.trees.ThrowStatement} tree
     */
    visitThrowStatement: function(tree) {
      if (tree.value !== null) {
	    return (this.visitAny(tree.value) > 0);
	  }
    },

    /**
     * @param {traceur.syntax.trees.TraitDeclaration} tree
     */
    visitTraitDeclaration: function(tree) {
      if (this.compareMark(tree.name)> 0) {
        return this.searchArrayForMark(tree.elements);
      }
    },

    /**
     * @param {traceur.syntax.trees.TryStatement} tree
     */
    visitTryStatement: function(tree) {
      if (this.visitAny(tree.body) > 0) {
        if (tree.catchBlock !== null && !tree.catchBlock.isNull()) {
          if (this.visitAny(tree.catchBlock) > 0) {
            if (tree.finallyBlock !== null && !tree.finallyBlock.isNull()) {
             return (this.visitAny(tree.finallyBlock) > 0);
            }
          }
        }
      }
    },

    /**
     * @param {traceur.syntax.trees.UnaryExpression} tree
     */
    visitUnaryExpression: function(tree) {
      return (this.compareMark(tree.operator) > 0) && (this.visitAny(tree.operand) > 0);
    },

    /**
     * @param {traceur.syntax.trees.VariableDeclaration} tree
     */
    visitVariableDeclaration: function(tree) {
      if  (this.visitAny(tree.lvalue) > 0) {
        if (tree.initializer !== null) {
          return (this.visitAny(tree.initializer) > 0);
        }
      }
    },

    /**
     * @param {traceur.syntax.trees.WhileStatement} tree
     */
    visitWhileStatement: function(tree) {
      return (this.visitAny(tree.condition) > 0) && (this.visitAny(tree.body) > 0);
    },

    /**
     * @param {traceur.syntax.trees.WithStatement} tree
     */
    visitWithStatement: function(tree) {
      return (this.visitAny(tree.expression) > 0) && (this.visitAny(tree.body) > 0);
    },

    /**
     * @param {traceur.syntax.trees.YieldStatement} tree
     */
    visitYieldStatement: function(tree) {
      if (tree.expression !== null) {
         return (this.visitAny(tree.expression) > 0);
      }
    },
    
    //----------------------------------------------------------------------------
    // Leaves
    /**
     * @param {traceur.syntax.trees.IdentifierExpression} tree
     */
    visitIdentifierExpression: function(tree) {
      return (this.compareMark(tree.identifierToken) > 0);
    },
     /*
     * @param {traceur.syntax.trees.LiteralExpression} tree
     */
     visitLiteralExpression: function(tree) {
       return (this.checkMark(tree.literalToken) > 0);
     }, 

    /**
     * @param {traceur.syntax.trees.BreakStatement} tree
     */
    visitBreakStatement: function(tree) {
      return (this.compareMark(tree.name) > 0);
    },
    
    /**
     * @param {traceur.syntax.trees.ClassExpression} tree
     */
    visitClassExpression: function(tree) {
      return (this.compareMark(tree) > 0);  
    },
    
    /**
     * @param {traceur.syntax.trees.ContinueStatement} tree
     */
    visitContinueStatement: function(tree) {
      return (this.compareMark(tree.name) > 0);
    },
    
    /**
     * @param {traceur.syntax.trees.DebuggerStatement} tree
     */
    visitDebuggerStatement: function(tree) {
      return (this.compareMark(tree) > 0);
    },
    /**
     * @param {traceur.syntax.trees.EmptyStatement} tree
     */
    visitEmptyStatement: function(tree) {
      return (this.compareMark(tree) > 0);
    },
    /**
     * @param {traceur.syntax.trees.ExportSpecifier} tree
     */
    visitExportSpecifier:  function(tree) {
      return (this.compareMark(tree.rhs) > 0) && (this.compareMark(tree.lhs) > 0);
    },
    /**
     * @param {traceur.syntax.trees.ImportSpecifier} tree
     */
    visitImportSpecifier:  function(tree) {
      return (this.compareMark(tree.rhs) > 0) &&  (this.compareMark(tree.lhs) > 0);
    },
    /**
     * @param {traceur.syntax.trees.MixinResolve} tree
     */
    visitMixinResolve:  function(tree) {
      return (this.compareMark(tree.from) > 0) && (this.compareMark(tree.to) > 0);
    },
    /**
     * @param {traceur.syntax.trees.RequiresMember} tree
     */
    visitRequiresMember: function(tree) {
      return (this.compareMark(tree.name) > 0);
    },

    /**
     * @param {traceur.syntax.trees.RestParameter} tree
     */
    visitRestParameter: function(tree) {
      return (this.compareMark(tree.identifier) > 0);
    },

    /**
     * @param {traceur.syntax.trees.SuperExpression} tree
     */
    visitSuperExpression:function(tree) {
      return (this.compareMark(tree) > 0);  
    },
    
    /**
     * @param {traceur.syntax.trees.ThisExpression} tree
     */
    visitThisExpression: function(tree) {
      return (this.compareMark(tree) > 0);  
    },

    compareMark: function(treeOrToken) {
      var cmp = this.getDistanceToMark(treeOrToken);
      if (cmp === 0) {
        this.pathToIndex = this.nestingStack.slice(0); // clone one level deep
        //console.log("ParseTreeLeafFinder found mark "+this.mark+" at depth "+this.pathToIndex.length, this.pathToIndex);
      }
      return cmp;
    },
    //    mark       range           another mark
    //    |<------[xxxxxxxx]-------->|
    //      behind     0      ahead
    getDistanceToMark: function(treeOrToken) {
      var range = treeOrToken.location;
      var distanceBehind = range.start.offset - this.mark; // start is inclusive
      if (distanceBehind > 0) {
        return -distanceBehind;
      }
      var distanceAhead = this.mark - (range.end.offset - 1);  // end is exclusive
      if (distanceAhead > 0) {
        return distanceAhead;
      } 
	  return 0;
    },
       
  });

  // Export
  return ParseTreeLeafFinder;
});
