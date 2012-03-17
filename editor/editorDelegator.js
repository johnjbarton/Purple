// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define window console*/

define(['editor/OrionEditor', 'editor/annotationFactory', 'lib/Assembly', 'MetaObject/AJAX'], 
function(       OrionEditor,          annotationFactory,       Assembly,              AJAX) {

  //--------------------------------------------------------------------------------------------------------
  // Orion Editor API Implementation
  
  function EditorDelegator(element) {
    this.orionEditor = new OrionEditor(element);
    Assembly.addListenerContainer(this);
  }
    
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

  //--------------------------------------------------------------------------------------------------------
  // API
  
  EditorDelegator.prototype.open = function(url, lineNumber, columnNumber, endNumber) {
    this.orionEditor.sourceName = url;
    AJAX.GET(
      url,
      function(event) {
        var src = event.currentTarget.responseText;
        // don't give line numbers to avoid triggering onGotoLine
        this.setContent(this.orionEditor.sourceName, undefined, undefined, undefined, src);
        return this;
      }.bind(this),
      function(msg) { 
        throw new Error(msg); 
      }
    );
  };
  
  EditorDelegator.prototype.setContent = function(name, line, col, end, src) {
    this.orionEditor.sourceName = name;  // TODO multiple editors
    if (typeof src !== 'string') {
      src = src.body; // TODO deal with base64
    }
    this.orionEditor.setInput(name, null, src);
    if (line) {
      col = col || 1;
      this.orionEditor.onGotoLine(line, col, end);
    }
//    syntaxHighlighter.highlight(name, this.orionEditor.getTextView());
  };
    
  EditorDelegator.prototype.setFocus = function() {
     this.orionEditor.getTextView().focus();
  };

  EditorDelegator.prototype.addSourceChangeListener = function(onSourceChange) {
    this.addListener('onSourceChange', onSourceChange);
  };

  EditorDelegator.prototype.addLineRevealedListener = function(onLineRevealed) {
    this.addListener('onLineRevealed', onLineRevealed);
  };

  //-------------------------------------------------------------------------------
  
  // name: a key given to setContent,
  // src: new buffer contents, 
  // startDamage: first pos of change (both old and new)
  // endDamage: last pos of change in *old* buffer 
  EditorDelegator.prototype._sourceChange = function(name, src, startDamage, endDamage) {
    return this.toEachListener("onSourceChange", arguments);
  };
  // name: a key given to setContent,
  // index: offset to the first char of a line just revealed.
  EditorDelegator.prototype._lineRevealed = function(name, index) {
    return this.toEachListener("onLineRevealed", arguments);
  };
    
  // indicator: {token: string, tooltip: string, line: number, column: number 
  EditorDelegator.prototype.reportError = function(indicator) {
    indicator.line = indicator.line + 1;
    indicator.column = indicator.column + 1;
    annotationFactory.showIndicator(indicator); 
  };
  
  EditorDelegator.prototype.showValue = function(value, line, col) {
    annotationFactory.showValue({value: value, line: line, column: col});
  };
  
  // tokenRanges: [{start: index-into-src, end: index-into-src, tokenType: index-into-compiler.api.TokenTypes}]
  EditorDelegator.prototype.convertTokenTypes = function(tokenRanges, tokenStyles) {
    tokenRanges.forEach(function adapt(tokenRange) {
      var orionStyle = ecmaToOrionTokenTypes[tokenRange.tokenType];
      if (orionStyle) {
        tokenStyles.push({start: tokenRange.start, end: tokenRange.end, style: orionStyle});
      }
    });
  };

  //---------------------------------------------------------------------------------------------
  EditorDelegator.prototype.initialize = function() {
    var view = this.orionEditor.getTextView();
    this._onModelChanged = this._onModelChanged.bind(this);
    view.addEventListener("ModelChanged", this._onModelChanged, "no data");
    this._onLineStyle = this._onLineStyle.bind(this);
    view.addEventListener("LineStyle", this._onLineStyle);
  };
    
  EditorDelegator.prototype.destroy = function() {
    this.orionEditor.getTextView().removeEventListener("ModelChanged", this, this._onModelChanged, "no data");
    this.orionEditor.getTextView().removeEventListener("LineStyle", this, this._onLineStyle, "no data");
  };

  //----------------------------
  // Orion Event handlers
  EditorDelegator.prototype._onModelChanged = function(event) {
    console.log("editor textView onModelChanged", arguments);
    var model = this.orionEditor.getTextView().getModel();
    var startDamage = event.start; 
    var endDamage = event.start - event.removedCharCount + event.addedCharCount;
    this._sourceChange(this.orionEditor.sourceName, model.getText(), startDamage, endDamage); 
    //syntaxHighlighter.highlight(this.orionEditor.sourceName, this.orionEditor.getTextView());
  };
  
  EditorDelegator.prototype._onLineStyle = function(event) {
      //e.ranges = this._getStyles(e.lineText, e.lineStart);
      // Pass source range to compiler, get back things that we need to build styles
      //console.log("_onLineStyle called", event);
      // The goofy API here is because I want the interaction to be async eventually and for the compiler to only
      // know about events and the editor API.
      this.tokenStyles = [];
      var lineEnd = this.orionEditor.getTextView().getModel().getLineEnd(event.lineIndex);
      this._lineRevealed(this.orionEditor.sourceName, event.lineStart, lineEnd, this.tokenStyles);
      event.ranges = this.tokenStyles;
  };
  
  
  window.onbeforeunload = function() {
    if (this.orionEditor.isDirty()) {
       console.log("TODO: There are unsaved changes.");
    }
  };


  return EditorDelegator;
  
  });