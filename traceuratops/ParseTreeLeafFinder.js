// Copyright 2011 Google Inc. 
// see license.txt for BSD license
// johnjbarton@google.com
//

/*
 * Visit the ParseTree to find a leaf by source character offset
 */
window.purple = window.purple || {}; 
var thePurple = window.purple;

thePurple.ParseTreeLeafFinder = (function() {
  'use strict';

  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var ParseTreeVisitor = traceur.syntax.ParseTreeVisitor;
  var ParseTreeWriter = traceur.codegeneration.ParseTreeWriter;
  var TokenType = traceur.syntax.TokenType;
  var NewExpression = traceur.syntax.trees.NewExpression;
  var getTreeNameForType = traceur.syntax.trees.getTreeNameForType;

  /*
  
  */

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
      this.nestingStack.push(tree);
      var name = getTreeNameForType(tree.type);
      var found = this['visit' + name](tree);
      this.nestingStack.pop();
      return found; 
    },

    /**
     * @param {traceur.syntax.trees.ArgumentList} tree
     */
    visitArgumentList: function(tree) {
      for (var i = 0; i < tree.args.length; i++) {
        var argument = tree.args[i];
        var found = this.visitAny(argument);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ArrayLiteralExpression} tree
     */
    visitArrayLiteralExpression: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        var found = this.visitAny(element);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ArrayPattern} tree
     */
    visitArrayPattern: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        var found = this.visitAny(element);
	    if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.AwaitStatement} tree
     */
    visitAwaitStatement: function(tree) {
      return this.checkMark(tree.identifier) || this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.BinaryOperator} tree
     */
    visitBinaryOperator: function(tree) {
      var found = this.visitAny(tree.operator);
      found = found || this.visitAny(tree.left);
      return found || this.visitAny(tree.right);
    },

    /**
     * @param {traceur.syntax.trees.Block} tree
     */
    visitBlock: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        var found = this.visitAny(statement);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.CallExpression} tree
     */
    visitCallExpression: function(tree) {
      var found = this.visitAny(tree.operand);
      return found || this.visitAny(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.CaseClause} tree
     */
    visitCaseClause: function(tree) {
      var found = this.visitAny(tree.expression);
      if (found) return found;
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        var found = this.visitAny(statement);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.Catch} tree
     */
    visitCatch: function(tree) {
      return this.checkMark(tree.exceptionName) || this.visitAny(tree.catchBody);
    },

    /**
     * @param {traceur.syntax.trees.ClassDeclaration} tree
     */
    visitClassDeclaration: function(tree) {
      var found = this.checkMark(tree.name) || this.visitAny(tree.superClass);
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        switch (element.type) {
          case ParseTreeType.FUNCTION_DECLARATION:
          case ParseTreeType.GET_ACCESSOR:
          case ParseTreeType.SET_ACCESSOR:
          case ParseTreeType.MIXIN:
          case ParseTreeType.REQUIRES_MEMBER:
          case ParseTreeType.FIELD_DECLARATION:
            break;
          default:
            this.fail_(element, 'class element expected');
        }
        var found = this.visitAny(element);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.CommaExpression} tree
     */
    visitCommaExpression: function(tree) {
      for (var i = 0; i < tree.expressions.length; i++) {
        var expression = tree.expressions[i];
        var found = this.visitAny(expression);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ConditionalExpression} tree
     */
    visitConditionalExpression: function(tree) {
      var found = this.visitAny(tree.condition);
      found = found || this.visitAny(tree.left);
      return found || this.visitAny(tree.right);
    },

    /**
     * @param {traceur.syntax.trees.DefaultClause} tree
     */
    visitDefaultClause: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        var found = this.visitAny(statement);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.DoWhileStatement} tree
     */
    visitDoWhileStatement: function(tree) {
      var found = this.visitAny(tree.body);
      return found || this.visitAny(tree.condition);
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
      for (var i = 0; i < tree.paths.length; i++) {
        var path = tree.paths[i];
        var found = this.visitAny(path);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ExportPathSpecifierSet} tree
     */
    visitExportPathSpecifierSet: function(tree) {
      return this.checkMark(tree.identifier) || this.visitList(tree.specifiers);
    },

    /**
     * @param {traceur.syntax.trees.ExportSpecifierSet} tree
     */
    visitExportSpecifierSet: function(tree) {
      for (var i = 0; i < tree.specifiers.length; i++) {
        var specifier = tree.specifiers[i];
        var found = this.visitAny(specifier);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ExpressionStatement} tree
     */
    visitExpressionStatement: function(tree) {
      return this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.FieldDeclaration} tree
     */
    visitFieldDeclaration: function(tree) {
      for (var i = 0; i < tree.declarations.length; i++) {
        var declaration = tree.declarations[i];
        var found = this.visitAny(declaration);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.Finally} tree
     */
    visitFinally: function(tree) {
      return this.visitAny(tree.block);
    },

    /**
     * @param {traceur.syntax.trees.ForEachStatement} tree
     */
    visitForEachStatement: function(tree) {
      var found = false;
      found = found || this.visitAny(tree.initializer);
      found = found || this.visitAny(tree.collection);
      return found || this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.ForInStatement} tree
     */
    visitForInStatement: function(tree) {
      var found = this.visitAny(tree.initializer);
      found = found || this.visitAny(tree.collection);
      return found || this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.FormalParameterList} tree
     */
    visitFormalParameterList: function(tree) {
      var found = false;
      for (var i = 0; i < tree.parameters.length; i++) {
        var parameter = tree.parameters[i];
        return found || this.visitAny(parameter);
      }
    },

    /**
     * @param {traceur.syntax.trees.ForStatement} tree
     */
    visitForStatement: function(tree) {
      var found = false;
      if (tree.initializer !== null && !tree.initializer.isNull()) {
        found = this.visitAny(tree.initializer);
      }
      if (tree.condition !== null) {
        found = found || this.visitAny(tree.condition);
      }
      if (tree.increment !== null) {
        found = found || this.visitAny(tree.increment);
      }
      return found || this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.GetAccessor} tree
     */
    visitGetAccessor: function(tree) {
      return this.checkMark(tree.propertyName) || this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.IfStatement} tree
     */
    visitIfStatement: function(tree) {
      var found = this.visitAny(tree.condition);
      found = found || this.visitAny(tree.ifClause);
      if (tree.elseClause !== null) {
        found = found || this.visitAny(tree.elseClause);
      }
      return found;
    },

    /**
     * @param {traceur.syntax.trees.LabelledStatement} tree
     */
    visitLabelledStatement: function(tree) {
      return this.checkMark(tree.name) || this.visitAny(tree.statement);
    },

    /**
     * @param {traceur.syntax.trees.MemberExpression} tree
     */
    visitMemberExpression: function(tree) {
      return this.checkMark(tree.memberName) || this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.MemberLookupExpression} tree
     */
    visitMemberLookupExpression: function(tree) {
      return  this.visitAny(tree.operand) || this.visitAny(tree.memberExpression);
    },

    /**
     * @param {traceur.syntax.trees.MissingPrimaryExpression} tree
     */
    visitMissingPrimaryExpression: function(tree) {
      return this.checkMark(tree.nextToken);
    },

    /**
     * @param {traceur.syntax.trees.MixinResolveList} tree
     */
    visitMixinResolveList: function(tree) {
      for (var i = 0; i < tree.resolves.length; i++) {
        var resolve = tree.resolves[i];
        var found = this.visitAny(resolve);
        return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinition} tree
     */
    visitModuleDeclaration: function(tree) {
      for (var i = 0; i < tree.specifiers.length; i++) {
        var specifier = tree.specifiers[i];
        var found = this.visitAny(specifier);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinition} tree
     */
    visitModuleDefinition: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        var found = this.visitAny(element);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ModuleRequire} tree
     */
    visitModuleRequire: function(tree) {
       return this.checkMark(tree.url);
    },

    /**
     * @param {traceur.syntax.trees.ModuleSpecifier} tree
     */
    visitModuleSpecifier: function(tree) {
      return this.checkMark(tree) || this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.NewExpression} tree
     */
    visitNewExpression: function(tree) {
      var found = this.visitAny(tree.operand);
      if (found) return found;
      found = this.visitAny(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.ObjectLiteralExpression} tree
     */
    visitObjectLiteralExpression: function(tree) {
      for (var i = 0; i < tree.propertyNameAndValues.length; i++) {
        var propertyNameAndValue = tree.propertyNameAndValues[i];
        var found = this.visitAny(propertyNameAndValue);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ObjectPattern} tree
     */
    visitObjectPattern: function(tree) {
      for (var i = 0; i < tree.fields.length; i++) {
        var field = tree.fields[i];
        var found = this.visitAny(field);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ObjectPatternField} tree
     */
    visitObjectPatternField: function(tree) {
      var found = this.checkMark(tree.identifier);
      if (tree.element !== null) {
        found = found || this.visitAny(tree.element);
      }
      return found;
    },

    /**
     * @param {traceur.syntax.trees.ParenExpression} tree
     */
    visitParenExpression: function(tree) {
        return this.visitAny(tree.expression);
    },

    /**
     * @param {traceur.syntax.trees.PostfixExpression} tree
     */
    visitPostfixExpression: function(tree) {
      return this.visitAny(tree.operand) || this.checkMark(tree.operator);
    },

    /**
     * @param {traceur.syntax.trees.Program} tree
     */
    visitProgram: function(tree) {
      for (var i = 0; i < tree.programElements.length; i++) {
        var programElement = tree.programElements[i];
        var found = this.visitAny(programElement);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.PropertyNameAssignment} tree
     */
    visitPropertyNameAssignment: function(tree) {
      return this.checkMark(tree.name) || this.visitAny(tree.value);
    },

    /**
     * @param {traceur.syntax.trees.PropertyNameShorthand} tree
     */
    visitPropertyNameShorthand: function(tree) {
      return this.checkMark(tree.name);
    },

    /**
     * @param {traceur.syntax.trees.QualifiedReference} tree
     */
    visitQualifiedReference: function(tree) {
      return this.visitAny(tree.moduleExpression) || this.checkMark(tree.identifier);
    },

    /**
     * @param {traceur.syntax.trees.ReturnStatement} tree
     */
    visitReturnStatement: function(tree) {
      if (tree.expression !== null) {
        return this.visitAny(tree.expression);
      }
    },

    /**
     * @param {traceur.syntax.trees.SetAccessor} tree
     */
    visitSetAccessor: function(tree) {
      return this.checkMark(tree.propertyName) || this.checkMark(tree.parameter) || this.visitAny(tree.body);
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
      var found = this.visitAny(tree.expression);
      if (found) return found;
      var defaultCount = 0;
      for (var i = 0; i < tree.caseClauses.length; i++) {
        var caseClause = tree.caseClauses[i];
        found = this.visitAny(caseClause);
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ThrowStatement} tree
     */
    visitThrowStatement: function(tree) {
      if (tree.value === null) {
        return;
      }
      return this.visitAny(tree.value);
    },

    /**
     * @param {traceur.syntax.trees.TraitDeclaration} tree
     */
    visitTraitDeclaration: function(tree) {
      if (this.checkMark(tree.name)) return true;
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        return this.visitAny(element);
      }
    },

    /**
     * @param {traceur.syntax.trees.TryStatement} tree
     */
    visitTryStatement: function(tree) {
      var found = false;
      found = this.visitAny(tree.body);
      if (found) return found;
      if (!found && tree.catchBlock !== null && !tree.catchBlock.isNull()) {
        found = this.visitAny(tree.catchBlock);
      }
      if (!found && tree.finallyBlock !== null && !tree.finallyBlock.isNull()) {
        found = this.visitAny(tree.finallyBlock);
      }
      return found;
    },

    /**
     * @param {traceur.syntax.trees.UnaryExpression} tree
     */
    visitUnaryExpression: function(tree) {
      return this.checkMark(tree.operator) || this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.VariableDeclaration} tree
     */
    visitVariableDeclaration: function(tree) {
      if (this.visitAny(tree.lvalue)) return true;
      if (tree.initializer !== null) {
        return this.visitAny(tree.initializer);
      }
    },

    /**
     * @param {traceur.syntax.trees.WhileStatement} tree
     */
    visitWhileStatement: function(tree) {
      return this.visitAny(tree.condition) ||
             this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.WithStatement} tree
     */
    visitWithStatement: function(tree) {
      var found = this.visitAny(tree.expression);
      return found || this.visitAny(tree.body);
    },

    /**
     * @param {traceur.syntax.trees.YieldStatement} tree
     */
    visitYieldStatement: function(tree) {
      if (tree.expression !== null) {
         return this.visitAny(tree.expression);
      }
    },
    
    //----------------------------------------------------------------------------
    // Leaves
    /**
     * @param {traceur.syntax.trees.IdentifierExpression} tree
     */
    visitIdentifierExpression: function(tree) {
      return this.checkMark(tree.identifierToken);
    }, 
    /**
     * @param {traceur.syntax.trees.BreakStatement} tree
     */
    visitBreakStatement: function(tree) {
      return this.checkMark(tree.name);
    },
    
    /**
     * @param {traceur.syntax.trees.ClassExpression} tree
     */
    visitClassExpression: function(tree) {
      return this.checkMark(tree);  
    },
    
    /**
     * @param {traceur.syntax.trees.ContinueStatement} tree
     */
    visitContinueStatement: function(tree) {
      return this.checkMark(tree.name);
    },
    
    /**
     * @param {traceur.syntax.trees.DebuggerStatement} tree
     */
    visitDebuggerStatement: function(tree) {
      return this.checkMark(tree);   
    },
    /**
     * @param {traceur.syntax.trees.EmptyStatement} tree
     */
    visitEmptyStatement: function(tree) {
      return this.checkMark(tree);  
    },
    /**
     * @param {traceur.syntax.trees.ExportSpecifier} tree
     */
    visitExportSpecifier:  function(tree) {
      return this.checkMark(tree.rhs) || this.checkMark(tree.lhs);  
    },
    /**
     * @param {traceur.syntax.trees.ImportSpecifier} tree
     */
    visitImportSpecifier:  function(tree) {
      return this.checkMark(tree.rhs) || this.checkMark(tree.lhs);  
    },
    /**
     * @param {traceur.syntax.trees.MixinResolve} tree
     */
    visitMixinResolve:  function(tree) {
      return this.checkMark(tree.from) || this.checkMark(tree.to);  
    },
    /**
     * @param {traceur.syntax.trees.RequiresMember} tree
     */
    visitRequiresMember: function(tree) {
      return this.checkMark(tree.name);
    },

    /**
     * @param {traceur.syntax.trees.RestParameter} tree
     */
    visitRestParameter: function(tree) {
      return this.checkMark(tree.identifier);
    },

    /**
     * @param {traceur.syntax.trees.SuperExpression} tree
     */
    visitSuperExpression:function(tree) {
      return this.checkMark(tree);  
    },
    
    /**
     * @param {traceur.syntax.trees.ThisExpression} tree
     */
    visitThisExpression: function(tree) {
      return this.checkMark(tree);  
    },

    checkMark: function(treeOrToken) {
      if (treeOrToken && this.isOverMark(treeOrToken)) {
        this.pathToIndex = this.nestingStack.slice(0); // clone one level deep
        console.log("ParseTreeLeafFinder found mark "+this.mark, this.pathToIndex);
        return true;
      }
    },
    
    isOverMark: function(treeOrToken) {
      var range = treeOrToken.location;
      return (this.mark >= range.start.offset && this.mark < range.end.offset);
    },
       
  });

  // Export
  return ParseTreeLeafFinder;
}());
