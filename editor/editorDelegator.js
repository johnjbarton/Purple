// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window console*/

define(['editor/OrionEditor', 'editor/annotationFactory', 'lib/Assembly', 'MetaObject/AJAX', 'q/q'], 
function(OrionEditor,          annotationFactory,              Assembly,              AJAX,     Q) {

  //--------------------------------------------------------------------------------------------------------
  // Orion Editor API Implementation
  
  var editorFeatureByOrion = {};
  
  //--------------------------------------------------------------------------------------------------------
  // Implement features.editor
  
  // index by compiler.api.TokenTypes, output Orion class
  var ecmaToOrionTokenTypes = {
    'IdentifierName':           {},        
    'Punctuator':               {styleClass: "token_bracket_outline"},
    'NumericLiteral':           {},
    'StringLiteral':            {styleClass: "token_string"},
    'RegularExpressionLiteral': {},
	'Comment':                  {styleClass: "token_comment"},
	'ReservedWord':             {styleClass: "token_keyword"},
	'Experimental':             {},
	'Error':                    {}   
	};
	
  // Errors reported but not used by the highlighter yet.
  editorFeatureByOrion._unclaimedIndicators = []; 
  
  editorFeatureByOrion.open = function(url, lineNumber, columnNumber, endNumber) {
    OrionEditor.sourceName = url;
    var promiseEvent = AJAX.promiseGET(url);
    return Q.when(promiseEvent,
      function(event) {
        var src = event.currentTarget.responseText;
        // don't give line numbers to avoid triggering onGotoLine
        this.setContent(OrionEditor.sourceName, undefined, undefined, undefined, src);
        return this;
      }.bind(this),
      function(msg) { 
        throw new Error(msg); 
      }
    );
  };
  
  editorFeatureByOrion.setContent = function(name, line, col, end, src) {
    OrionEditor.sourceName = name;  // TODO multiple editors
    if (typeof src !== 'string') {
      src = src.body; // TODO deal with base64
    }
    OrionEditor.setInput(name, null, src);
    if (line) {
      col = col || 1;
      OrionEditor.onGotoLine(line, col, end);
    }
//    syntaxHighlighter.highlight(name, OrionEditor.getTextView());
  };
    
    
  Assembly.addListenerContainer(editorFeatureByOrion);
  
  // name: a key given to setContent,
  // src: new buffer contents, 
  // startDamage: first pos of change (both old and new)
  // endDamage: last pos of change in *old* buffer 
  editorFeatureByOrion._sourceChange = function(name, src, startDamage, endDamage) {
    return this.toEachListener("onSourceChange", arguments);
  };
  // name: a key given to setContent,
  // index: offset to the first char of a line just revealed.
  editorFeatureByOrion._lineRevealed = function(name, index) {
    return this.toEachListener("onLineRevealed", arguments);
  };
    
  // indicator: {token: string, tooltip: string, line: number, column: number 
  editorFeatureByOrion.reportError = function(indicator) {
    indicator.line = indicator.line + 1;
    indicator.column = indicator.column + 1;
    annotationFactory.showIndicator(indicator); 
  };
  
  editorFeatureByOrion.showValue = function(value, line, col) {
    annotationFactory.showValue({value: value, line: line, column: col});
  };
  
  // tokenRanges: [{start: index-into-src, end: index-into-src, tokenType: index-into-compiler.api.TokenTypes}]
  editorFeatureByOrion.convertTokenTypes = function(tokenRanges, tokenStyles) {
    tokenRanges.forEach(function adapt(tokenRange) {
      var orionStyle = ecmaToOrionTokenTypes[tokenRange.tokenType];
      if (orionStyle) {
        tokenStyles.push({start: tokenRange.start, end: tokenRange.end, style: orionStyle});
      }
    });
  };

  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  editorFeatureByOrion.initialize = function() {
    var view = OrionEditor.getTextView();
    this._onModelChanged = this._onModelChanged.bind(this);
    view.addEventListener("ModelChanged", this._onModelChanged, "no data");
    this._onLineStyle = this._onLineStyle.bind(this);
    view.addEventListener("LineStyle", this._onLineStyle);
  };
    
  editorFeatureByOrion.destroy = function() {
    OrionEditor.getTextView().removeEventListener("ModelChanged", editorFeatureByOrion, editorFeatureByOrion._onModelChanged, "no data");
    OrionEditor.getTextView().removeEventListener("LineStyle", editorFeatureByOrion, editorFeatureByOrion._onLineStyle, "no data");
  };

  //----------------------------
  // Orion Event handlers
  editorFeatureByOrion._onModelChanged = function(event) {
    console.log("editor textView onModelChanged", arguments);
    var model = OrionEditor.getTextView().getModel();
    var startDamage = event.start; 
    var endDamage = event.start - event.removedCharCount + event.addedCharCount;
    editorFeatureByOrion._sourceChange(OrionEditor.sourceName, model.getText(), startDamage, endDamage); 
    //syntaxHighlighter.highlight(OrionEditor.sourceName, OrionEditor.getTextView());
  };
  
  editorFeatureByOrion._onLineStyle = function(event) {
      //e.ranges = this._getStyles(e.lineText, e.lineStart);
      // Pass source range to compiler, get back things that we need to build styles
      //console.log("_onLineStyle called", event);
      // The goofy API here is because I want the interaction to be async eventually and for the compiler to only
      // know about events and the editor API.
      this.tokenStyles = [];
      var lineEnd = OrionEditor.getTextView().getModel().getLineEnd(event.lineIndex);
      this._lineRevealed(OrionEditor.sourceName, event.lineStart, lineEnd, this.tokenStyles);
      event.ranges = this.tokenStyles;
  };
  
  
  window.onbeforeunload = function() {
    if (OrionEditor.isDirty()) {
       console.log("TODO: There are unsaved changes.");
    }
  };


  return editorFeatureByOrion;
  
  });