// Copyright 2011 Google Inc. 
// see license.txt for BSD license
// johnjbarton@google.com
//

/*
 * Visit the ParseTree to find a leaf by source character offset
 */

traceur.define('syntax', function() {
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
      return finder.nestingStack;
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
     * @param {boolean} condition
     * @param {traceur.syntax.trees.ParseTree} tree
     * @param {string} message
     */
    check_: function(condition, tree, message) {
      if (!condition) {
        this.fail_(tree, message);
      }
    },

    /**
     * @param {boolean} condition
     * @param {traceur.syntax.trees.ParseTree} tree
     * @param {string} message
     */
    checkVisit_: function(condition, tree, message) {
      var found = this.check_(condition, tree, message);
      return found || this.visitAny(tree);
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
        var found = this.checkVisit_(argument.isAssignmentOrSpread(), argument,
            'assignment or spread expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ArrayLiteralExpression} tree
     */
    visitArrayLiteralExpression: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        var found = this.checkVisit_(element.isNull() || element.isAssignmentOrSpread(),
            element, 'assignment or spread expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ArrayPattern} tree
     */
    visitArrayPattern: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        var found = this.checkVisit_(element.isNull() ||
            element.isLeftHandSideExpression() ||
            element.isPattern() ||
            element.isSpreadPatternElement(),
            element,
            'null, sub pattern, left hand side expression or spread expected');
        if (element.isSpreadPatternElement()) {
          found = found || this.check_(i === (tree.elements.length - 1), element,
              'spread in array patterns must be the last element');
        }
	    if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.AwaitStatement} tree
     */
    visitAwaitStatement: function(tree) {
      return this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'await must be expression');
    },

    /**
     * @param {traceur.syntax.trees.BinaryOperator} tree
     */
    visitBinaryOperator: function(tree) {
      var found = false;
      switch (tree.operator.type) {
        // assignment
        case TokenType.EQUAL:
        case TokenType.STAR_EQUAL:
        case TokenType.SLASH_EQUAL:
        case TokenType.PERCENT_EQUAL:
        case TokenType.PLUS_EQUAL:
        case TokenType.MINUS_EQUAL:
        case TokenType.LEFT_SHIFT_EQUAL:
        case TokenType.RIGHT_SHIFT_EQUAL:
        case TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL:
        case TokenType.AMPERSAND_EQUAL:
        case TokenType.CARET_EQUAL:
        case TokenType.BAR_EQUAL:
          found = found || this.check_(tree.left.isLeftHandSideExpression() ||
              tree.left.isPattern(),
              tree.left,
              'left hand side expression or pattern expected');
          found = found || this.check_(tree.right.isArrowFunctionExpression(),
              tree.right,
              'assignment expression expected');
          break;

        // logical
        case TokenType.AND:
        case TokenType.OR:
        case TokenType.BAR:
        case TokenType.CARET:
        case TokenType.AMPERSAND:

        // equality
        case TokenType.EQUAL_EQUAL:
        case TokenType.NOT_EQUAL:
        case TokenType.EQUAL_EQUAL_EQUAL:
        case TokenType.NOT_EQUAL_EQUAL:

        // relational
        case TokenType.OPEN_ANGLE:
        case TokenType.CLOSE_ANGLE:
        case TokenType.GREATER_EQUAL:
        case TokenType.LESS_EQUAL:
        case TokenType.INSTANCEOF:
        case TokenType.IN:

        // shift
        case TokenType.LEFT_SHIFT:
        case TokenType.RIGHT_SHIFT:
        case TokenType.UNSIGNED_RIGHT_SHIFT:

        // additive
        case TokenType.PLUS:
        case TokenType.MINUS:

        // multiplicative
        case TokenType.STAR:
        case TokenType.SLASH:
        case TokenType.PERCENT:
          found = found || this.check_(tree.left.isArrowFunctionExpression(), tree.left,
              'assignment expression expected');
          found = found || this.check_(tree.right.isArrowFunctionExpression(), tree.right,
              'assignment expression expected');
          break;

        default:
          this.fail_(tree, 'unexpected binary operator');
      }
      found = found || this.visitAny(tree.left);
      return found || this.visitAny(tree.right);
    },

    /**
     * @param {traceur.syntax.trees.Block} tree
     */
    visitBlock: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        var found = this.checkVisit_(statement.isSourceElement(), statement,
            'statement or function declaration expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.CallExpression} tree
     */
    visitCallExpression: function(tree) {
      var found = this.check_(tree.operand.isLeftHandSideExpression() ||
                  tree.operand.isMemberExpression(),
                  tree.operand,
                  'left hand side expression or member expression expected');
      if (tree.operand instanceof NewExpression) {
        found = found || this.check_(tree.operand.args !== null, tree.operand,
            'new args expected');
      }
      found = found || this.visitAny(tree.operand);
      return found || this.visitAny(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.CaseClause} tree
     */
    visitCaseClause: function(tree) {
      var found = this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
      if (found) return found;
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        var found = this.checkVisit_(statement.isStatement(), statement,
            'statement expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.Catch} tree
     */
    visitCatch: function(tree) {
      return this.checkVisit_(tree.catchBody.type === ParseTreeType.BLOCK,
          tree.catchBody, 'block expected');
    },

    /**
     * @param {traceur.syntax.trees.ClassDeclaration} tree
     */
    visitClassDeclaration: function(tree) {
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
        var found = this.checkVisit_(expression.isArrowFunctionExpression(), expression,
            'expression expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ConditionalExpression} tree
     */
    visitConditionalExpression: function(tree) {
      var found = this.checkVisit_(tree.condition.isArrowFunctionExpression(), tree.condition,
          'expression expected');
      found = found || this.checkVisit_(tree.left.isArrowFunctionExpression(), tree.left,
          'expression expected');
      return found || this.checkVisit_(tree.right.isArrowFunctionExpression(), tree.right,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.DefaultClause} tree
     */
    visitDefaultClause: function(tree) {
      for (var i = 0; i < tree.statements.length; i++) {
        var statement = tree.statements[i];
        var found = this.checkVisit_(statement.isStatement(), statement,
            'statement expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.DoWhileStatement} tree
     */
    visitDoWhileStatement: function(tree) {
      var found = this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
      return found || this.checkVisit_(tree.condition.isExpression(), tree.condition,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.ExportDeclaration} tree
     */
    visitExportDeclaration: function(tree) {
      var declType = tree.declaration.type;
      return this.checkVisit_(
          declType == ParseTreeType.VARIABLE_STATEMENT ||
          declType == ParseTreeType.FUNCTION_DECLARATION ||
          declType == ParseTreeType.MODULE_DEFINITION ||
          declType == ParseTreeType.MODULE_DECLARATION ||
          declType == ParseTreeType.CLASS_DECLARATION ||
          declType == ParseTreeType.TRAIT_DECLARATION ||
          declType == ParseTreeType.EXPORT_PATH_LIST,
          tree.declaration,
          'expected valid export tree');
    },

    /**
     * @param {traceur.syntax.trees.ExportPath} tree
     */
    visitExportPath: function(tree) {
      var found = this.checkVisit_(
          tree.moduleExpression.type == ParseTreeType.MODULE_EXPRESSION,
          tree.moduleExpression,
          'module expression expected');

      var specifierType = tree.specifier.type;
      return found || this.checkVisit_(specifierType == ParseTreeType.EXPORT_SPECIFIER_SET ||
                       specifierType == ParseTreeType.IDENTIFIER_EXPRESSION,
                       tree.specifier,
                       'specifier set or identifier expected');
    },

    /**
     * @param {traceur.syntax.trees.ExportPath} tree
     */
    visitExportPathList: function(tree) {
      this.check_(tree.paths.length > 0, tree,
                  'expected at least one path');
      for (var i = 0; i < tree.paths.length; i++) {
        var path = tree.paths[i];
        var type = path.type;
        var found = this.checkVisit_(
            type == ParseTreeType.EXPORT_PATH ||
            type == ParseTreeType.EXPORT_PATH_SPECIFIER_SET ||
            type == ParseTreeType.IDENTIFIER_EXPRESSION,
            path,
            'expected valid export path');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ExportPathSpecifierSet} tree
     */
    visitExportPathSpecifierSet: function(tree) {
      var found = this.check_(tree.specifiers.length > 0, tree,
                  'expected at least one specifier');
      return found || this.visitList(tree.specifiers);
    },

    /**
     * @param {traceur.syntax.trees.ExportSpecifierSet} tree
     */
    visitExportSpecifierSet: function(tree) {
      this.check_(tree.specifiers.length > 0, tree,
          'expected at least one identifier');
      for (var i = 0; i < tree.specifiers.length; i++) {
        var specifier = tree.specifiers[i];
        var found = this.checkVisit_(
            specifier.type == ParseTreeType.EXPORT_SPECIFIER,
            specifier,
            'expected valid export specifier');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ExpressionStatement} tree
     */
    visitExpressionStatement: function(tree) {
      return this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.FieldDeclaration} tree
     */
    visitFieldDeclaration: function(tree) {
      for (var i = 0; i < tree.declarations.length; i++) {
        var declaration = tree.declarations[i];
        var found = this.checkVisit_(
            declaration.type === ParseTreeType.VARIABLE_DECLARATION,
            declaration,
            'variable declaration expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.Finally} tree
     */
    visitFinally: function(tree) {
      return this.checkVisit_(tree.block.type === ParseTreeType.BLOCK, tree.block,
          'block expected');
    },

    /**
     * @param {traceur.syntax.trees.ForEachStatement} tree
     */
    visitForEachStatement: function(tree) {
      var found = false;
      found = found || this.checkVisit_(tree.initializer.declarations.length <= 1,
          tree.initializer,
          'for-each statement may not have more than one variable declaration');
      found = found || this.checkVisit_(tree.collection.isExpression(), tree.collection,
          'expression expected');
      return found || this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.ForInStatement} tree
     */
    visitForInStatement: function(tree) {
      var found = false;
      if (tree.initializer.type === ParseTreeType.VARIABLE_DECLARATION_LIST) {
        found = found ||  this.checkVisit_(
            tree.initializer.declarations.length <=
                1,
            tree.initializer,
            'for-in statement may not have more than one variable declaration');
      } else {
        found = found || this.checkVisit_(tree.initializer.isExpression(),
            tree.initializer, 'variable declaration or expression expected');
      }
      found = found || this.checkVisit_(tree.collection.isExpression(), tree.collection,
          'expression expected');
      return found || this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.FormalParameterList} tree
     */
    visitFormalParameterList: function(tree) {
      var found = false;
      for (var i = 0; i < tree.parameters.length; i++) {
        var parameter = tree.parameters[i];
        switch (parameter.type) {
          case ParseTreeType.REST_PARAMETER:
            found = found || this.checkVisit_(
                i === tree.parameters.length - 1, parameter,
                'rest parameters must be the last parameter in a parameter' +
                ' list');
            // Fall through

          case ParseTreeType.IDENTIFIER_EXPRESSION:
            // TODO(dominicc): Add array and object patterns here when
            // desugaring them is supported.
            break;

          case ParseTreeType.DEFAULT_PARAMETER:
            // TODO(arv): There must not be a parameter after this one that is
            // not a rest or another default parameter.
            break;

          case ParseTreeType.BIND_THIS_PARAMETER:
            // TODO: this must be the first parameter, and is only legal in an
            // arrow expression (->)
            break;

          default:
            this.fail_(parameter, 'parameters must be identifiers or rest' +
                ' parameters');
            break;
        }
        return found || this.visitAny(parameter);
      }
    },

    /**
     * @param {traceur.syntax.trees.ForStatement} tree
     */
    visitForStatement: function(tree) {
      var found = false;
      if (tree.initializer !== null && !tree.initializer.isNull()) {
        found = this.checkVisit_(
            tree.initializer.isExpression() ||
            tree.initializer.type === ParseTreeType.VARIABLE_DECLARATION_LIST,
            tree.initializer,
            'variable declaration list or expression expected');
      }
      if (tree.condition !== null) {
        found = found || this.checkVisit_(tree.condition.isExpression(), tree.condition,
            'expression expected');
      }
      if (tree.increment !== null) {
        found = found || this.checkVisit_(tree.condition.isExpression(), tree.increment,
            'expression expected');
      }
      return found || this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.GetAccessor} tree
     */
    visitGetAccessor: function(tree) {
      return this.checkVisit_(tree.body.type === ParseTreeType.BLOCK, tree.body,
          'block expected');
    },

    /**
     * @param {traceur.syntax.trees.IfStatement} tree
     */
    visitIfStatement: function(tree) {
      var found = this.checkVisit_(tree.condition.isExpression(), tree.condition,
          'expression expected');
      found = found || this.checkVisit_(tree.ifClause.isStatement(), tree.ifClause,
          'statement expected');
      if (tree.elseClause !== null) {
        found = found || this.checkVisit_(tree.elseClause.isStatement(), tree.elseClause,
            'statement expected');
      }
      return found;
    },

    /**
     * @param {traceur.syntax.trees.LabelledStatement} tree
     */
    visitLabelledStatement: function(tree) {
      return this.checkVisit_(tree.statement.isStatement(), tree.statement,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.MemberExpression} tree
     */
    visitMemberExpression: function(tree) {
      var found = this.check_(tree.operand.isMemberExpression(), tree.operand,
          'member expression expected');
      if (!found || tree.operand instanceof NewExpression) {
        found = this.check_(tree.operand.args !== null, tree.operand,
            'new args expected');
      }
      return found || this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.MemberLookupExpression} tree
     */
    visitMemberLookupExpression: function(tree) {
      var found = this.check_(tree.operand.isLeftHandSideExpression(), tree.operand,
          'left hand side expression expected');
      if (!found && tree.operand instanceof NewExpression) {
        found = this.check_(tree.operand.args !== null, tree.operand,
            'new args expected');
      }
      return found || this.visitAny(tree.operand);
    },

    /**
     * @param {traceur.syntax.trees.MissingPrimaryExpression} tree
     */
    visitMissingPrimaryExpression: function(tree) {
      this.fail_(tree, 'parse tree contains errors');
    },

    /**
     * @param {traceur.syntax.trees.MixinResolveList} tree
     */
    visitMixinResolveList: function(tree) {
      for (var i = 0; i < tree.resolves.length; i++) {
        var resolve = tree.resolves[i];
        var found = this.check_(resolve.type === ParseTreeType.MIXIN_RESOLVE, resolve,
            'mixin resolve expected');
        return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinition} tree
     */
    visitModuleDeclaration: function(tree) {
      for (var i = 0; i < tree.specifiers.length; i++) {
        var specifier = tree.specifiers[i];
        var found = this.checkVisit_(specifier.type == ParseTreeType.MODULE_SPECIFIER,
                         specifier,
                         'module specifier expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ModuleDefinition} tree
     */
    visitModuleDefinition: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        var found = this.checkVisit_(
            (element.isStatement() && element.type !== ParseTreeType.BLOCK) ||
            element.type === ParseTreeType.CLASS_DECLARATION ||
            element.type === ParseTreeType.EXPORT_DECLARATION ||
            element.type === ParseTreeType.IMPORT_DECLARATION ||
            element.type === ParseTreeType.MODULE_DEFINITION ||
            element.type === ParseTreeType.MODULE_DECLARATION ||
            element.type === ParseTreeType.TRAIT_DECLARATION,
            element,
            'module element expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ModuleRequire} tree
     */
    visitModuleRequire: function(tree) {
      this.check_(tree.url.type == TokenType.STRING, tree.url,
                  'string expected');
    },

    /**
     * @param {traceur.syntax.trees.ModuleSpecifier} tree
     */
    visitModuleSpecifier: function(tree) {
      return this.checkVisit_(tree.expression.type == ParseTreeType.MODULE_EXPRESSION,
                       tree.expression,
                       'module expression expected');
    },

    /**
     * @param {traceur.syntax.trees.NewExpression} tree
     */
    visitNewExpression: function(tree) {
      var found = this.checkVisit_(tree.operand.isLeftHandSideExpression(), tree.operand,
          'left hand side expression expected');
      if (found) return found;
      found = this.visitAny(tree.args);
    },

    /**
     * @param {traceur.syntax.trees.ObjectLiteralExpression} tree
     */
    visitObjectLiteralExpression: function(tree) {
      for (var i = 0; i < tree.propertyNameAndValues.length; i++) {
        var propertyNameAndValue = tree.propertyNameAndValues[i];
        switch (propertyNameAndValue.type) {
          case ParseTreeType.GET_ACCESSOR:
          case ParseTreeType.SET_ACCESSOR:
          case ParseTreeType.PROPERTY_NAME_ASSIGNMENT:
          case ParseTreeType.PROPERTY_NAME_SHORTHAND:
            break;
          default:
            this.fail_(propertyNameAndValue,
                'accessor or property name assignment expected');
        }
        return this.visitAny(propertyNameAndValue);
      }
    },

    /**
     * @param {traceur.syntax.trees.ObjectPattern} tree
     */
    visitObjectPattern: function(tree) {
      for (var i = 0; i < tree.fields.length; i++) {
        var field = tree.fields[i];
        var found = this.checkVisit_(field.type === ParseTreeType.OBJECT_PATTERN_FIELD,
            field,
            'object pattern field expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.ObjectPatternField} tree
     */
    visitObjectPatternField: function(tree) {
      if (tree.element !== null) {
        return this.checkVisit_(tree.element.isLeftHandSideExpression() ||
            tree.element.isPattern(),
            tree.element,
            'left hand side expression or pattern expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.ParenExpression} tree
     */
    visitParenExpression: function(tree) {
      if (tree.expression.isPattern()) {
        return this.visitAny(tree.expression);
      } else {
        return this.checkVisit_(tree.expression.isExpression(), tree.expression,
            'expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.PostfixExpression} tree
     */
    visitPostfixExpression: function(tree) {
      return this.checkVisit_(tree.operand.isArrowFunctionExpression(), tree.operand,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.Program} tree
     */
    visitProgram: function(tree) {
      for (var i = 0; i < tree.programElements.length; i++) {
        var programElement = tree.programElements[i];
        var found = this.checkVisit_(programElement.isProgramElement(),
            programElement,
            'global program element expected');
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.PropertyNameAssignment} tree
     */
    visitPropertyNameAssignment: function(tree) {
      return this.checkVisit_(tree.value.isArrowFunctionExpression(), tree.value,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.PropertyNameShorthand} tree
     */
    visitPropertyNameShorthand: function(tree) {
    },

    /**
     * @param {traceur.syntax.trees.QualifiedReference} tree
     */
    visitQualifiedReference: function(tree) {
      return this.checkVisit_(
          tree.moduleExpression.type == ParseTreeType.MODULE_EXPRESSION,
          tree.moduleExpression,
          'module expression expected');
    },

    /**
     * @param {traceur.syntax.trees.ReturnStatement} tree
     */
    visitReturnStatement: function(tree) {
      if (tree.expression !== null) {
        return this.checkVisit_(tree.expression.isExpression(), tree.expression,
            'expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.SetAccessor} tree
     */
    visitSetAccessor: function(tree) {
      return this.checkVisit_(tree.body.type === ParseTreeType.BLOCK, tree.body,
          'block expected');
    },

    /**
     * @param {traceur.syntax.trees.SpreadExpression} tree
     */
    visitSpreadExpression: function(tree) {
      return this.checkVisit_(tree.expression.isArrowFunctionExpression(),
          tree.expression,
          'assignment expression expected');
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
      var found = this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
      if (found) return found;
      var defaultCount = 0;
      for (var i = 0; i < tree.caseClauses.length; i++) {
        var caseClause = tree.caseClauses[i];
        if (caseClause.type === ParseTreeType.DEFAULT_CLAUSE) {
          ++defaultCount;
          found = this.checkVisit_(defaultCount <= 1, caseClause,
              'no more than one default clause allowed');
        } else {
          found = this.checkVisit_(caseClause.type === ParseTreeType.CASE_CLAUSE,
              caseClause, 'case or default clause expected');
        }
        if (found) return found;
      }
    },

    /**
     * @param {traceur.syntax.trees.TraitDeclaration} tree
     */
    visitTraitDeclaration: function(tree) {
      for (var i = 0; i < tree.elements.length; i++) {
        var element = tree.elements[i];
        switch (element.type) {
          case ParseTreeType.FUNCTION_DECLARATION:
          case ParseTreeType.GET_ACCESSOR:
          case ParseTreeType.SET_ACCESSOR:
          case ParseTreeType.MIXIN:
          case ParseTreeType.REQUIRES_MEMBER:
            break;
          default:
            this.fail_(element, 'trait element expected');
        }
        return this.visitAny(element);
      }
    },

    /**
     * @param {traceur.syntax.trees.ThrowStatement} tree
     */
    visitThrowStatement: function(tree) {
      if (tree.value === null) {
        return;
      }
      return this.checkVisit_(tree.value.isExpression(), tree.value,
          'expression expected');
    },

    /**
     * @param {traceur.syntax.trees.TryStatement} tree
     */
    visitTryStatement: function(tree) {
      var found = false;
      found = this.checkVisit_(tree.body.type === ParseTreeType.BLOCK, tree.body,
          'block expected');
      if (found) return found;
      if (!found && tree.catchBlock !== null && !tree.catchBlock.isNull()) {
        found = this.checkVisit_(tree.catchBlock.type === ParseTreeType.CATCH,
            tree.catchBlock, 'catch block expected');
      }
      if (!found && tree.finallyBlock !== null && !tree.finallyBlock.isNull()) {
        found = this.checkVisit_(tree.finallyBlock.type === ParseTreeType.FINALLY,
            tree.finallyBlock, 'finally block expected');
      }
      if (!found && (tree.catchBlock === null || tree.catchBlock.isNull()) &&
          (tree.finallyBlock === null || tree.finallyBlock.isNull())) {
        this.fail_(tree, 'either catch or finally must be present');
      }
      return found;
    },

    /**
     * @param {traceur.syntax.trees.UnaryExpression} tree
     */
    visitUnaryExpression: function(tree) {
      return this.checkVisit_(tree.operand.isArrowFunctionExpression(), tree.operand,
          'assignment expression expected');
    },

    /**
     * @param {traceur.syntax.trees.VariableDeclaration} tree
     */
    visitVariableDeclaration: function(tree) {
      if (tree.initializer !== null) {
        return this.checkVisit_(tree.initializer.isArrowFunctionExpression(),
            tree.initializer, 'assignment expression expected');
      }
    },

    /**
     * @param {traceur.syntax.trees.WhileStatement} tree
     */
    visitWhileStatement: function(tree) {
      return this.checkVisit_(tree.condition.isExpression(), tree.condition,
          'expression expected') ||
             this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.WithStatement} tree
     */
    visitWithStatement: function(tree) {
      var found = this.checkVisit_(tree.expression.isExpression(), tree.expression,
          'expression expected');
      return found || this.checkVisit_(tree.body.isStatement(), tree.body,
          'statement expected');
    },

    /**
     * @param {traceur.syntax.trees.YieldStatement} tree
     */
    visitYieldStatement: function(tree) {
      if (tree.expression !== null) {
         return this.checkVisit_(tree.expression.isExpression(), tree.expression,
            'expression expected');
      }
    },
    
    //----------------------------------------------------------------------------
    // Leaves
    
    checkMark: function(tree) {
      if (this.isOverMark(tree)) {
        this.pathToIndex = this.nestingStack.slice(0); // clone one level deep
        return true;
      }
    },
    /**
     * @param {traceur.syntax.trees.BreakStatement} tree
     */
    visitBreakStatement: ParseTreeLeafFinder.prototype.checkMark,
    
    /**
     * @param {traceur.syntax.trees.ClassExpression} tree
     */
    visitClassExpression: ParseTreeLeafFinder.prototype.checkMark,
    

    /**
     * @param {traceur.syntax.trees.ContinueStatement} tree
     */
    visitContinueStatement: ParseTreeLeafFinder.prototype.checkMark,
    

    /**
     * @param {traceur.syntax.trees.DebuggerStatement} tree
     */
    visitDebuggerStatement: ParseTreeLeafFinder.prototype.checkMark,
    
    /**
     * @param {traceur.syntax.trees.EmptyStatement} tree
     */
    visitEmptyStatement: ParseTreeLeafFinder.prototype.checkMark,

    /**
     * @param {traceur.syntax.trees.ExportSpecifier} tree
     */
    visitExportSpecifier:  ParseTreeLeafFinder.prototype.checkMark,
    /**
     * @param {traceur.syntax.trees.ImportSpecifier} tree
     */
    visitImportSpecifier:  ParseTreeLeafFinder.prototype.checkMark,
    
    /**
     * @param {traceur.syntax.trees.MixinResolve} tree
     */
    visitMixinResolve:  ParseTreeLeafFinder.prototype.checkMark,
    /**
     * @param {traceur.syntax.trees.RequiresMember} tree
     */
    visitRequiresMember:  ParseTreeLeafFinder.prototype.checkMark,

    /**
     * @param {traceur.syntax.trees.RestParameter} tree
     */
    visitRestParameter:  ParseTreeLeafFinder.prototype.checkMark,

    /**
     * @param {traceur.syntax.trees.SuperExpression} tree
     */
    visitSuperExpression:  ParseTreeLeafFinder.prototype.checkMark,
    
    /**
     * @param {traceur.syntax.trees.ThisExpression} tree
     */
    visitThisExpression: ParseTreeLeafFinder.prototype.checkMark,
    
  });

  // Export
  return {
    ParseTreeLeafFinder: ParseTreeLeafFinder
  };
});
