/*******************************************************************************
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global eclipse:true orion:true dojo window*/
/*jslint devel:true*/

define(['annotationFactory'], function(annotationFactory){

window.purple = window.purple || {};
var thePurple = window.purple;
var Assembly = thePurple.Assembly; 

// Syntax highlighting is triggered by an editor callback 'lineStyle' event
thePurple.ErrorStyler = (function () {
  function ErrorStyler(view) {
	view.addEventListener("LineStyle", this, this._onLineStyle);
  }
  ErrorStyler.prototype = {
    _onLineStyle: function(e) {
      e.ranges = this._getStyles(e.lineText, e.lineStart);
      return;
    },
    _getStyles: function(text, start) {
      console.log("ErrorStyler called with start: "+start+' text:'+text);
      return [];
      //styles.push({start: tokenStart, end: scanner.getOffset() + offset, style: style});
    }
  };
  return ErrorStyler;
}());

var editor = (function(){
  
  var editorDomNode = dojo.byId("editor");
  
  // These stylesheets will be inserted into the iframe containing the editor.
  var stylesheets = [
    "/orion/textview/textview.css", 
    "/orion/textview/rulers.css", 
    "/examples/textview/textstyler.css", 
    "/examples/editor/htmlStyles.css",
    "../ui/purple.css"];
    
  var textViewFactory = function() {
    return new orion.textview.TextView({
      parent: editorDomNode,
      stylesheet: stylesheets,
      tabSize: 2
    });
  };

  var contentAssistFactory = function(editor) {
    var contentAssist = new orion.editor.ContentAssist(editor, "contentassist");
    contentAssist.addProvider(new orion.editor.CssContentAssistProvider(), "css", "\\.css$");
    contentAssist.addProvider(new orion.editor.JavaScriptContentAssistProvider(), "js", "\\.js$");
    return contentAssist;
  };
  
  // Canned highlighters for js, java, and css. Grammar-based highlighter for html
  var syntaxHighlighter = {
    stylers: {}, 
    
    highlight: function(fileName, textView) {
      if (fileName) {
        var splits = fileName.split(".");
        var extension = splits.pop().toLowerCase();
        if (splits.length > 0) {
          switch(extension) {
            case "js":
              this.stylers[extension] = new thePurple.ErrorStyler(textView);
              break;
            case "java":
              this.stylers[extension] = new examples.textview.TextStyler(textView, "java");
              break;
            case "css":
              this.stylers[extension] = new examples.textview.TextStyler(textView, "css");
              break;
            case "html":
              this.stylers[extension] = new orion.editor.TextMateStyler(textView, orion.editor.HtmlGrammar.grammar);
              break;
          }
        }
        return this.stylers[extension];
      }
    }
  };
  
  function save(editor) {
    editor.onInputChange(null, null, null, true);
    window.alert("Save hook.");
  }
  
  var keyBindingFactory = function(editor, keyModeStack, undoStack, contentAssist) {
    
    // Create keybindings for generic editing
    var genericBindings = new orion.editor.TextActions(editor, undoStack);
    keyModeStack.push(genericBindings);
    
    // create keybindings for source editing
    var codeBindings = new orion.editor.SourceCodeActions(editor, undoStack, contentAssist);
    keyModeStack.push(codeBindings);
    
    // save binding
    editor.getTextView().setKeyBinding(new orion.textview.KeyBinding("s", true), "save");
    editor.getTextView().setAction("save", function(){
        save(editor);
        return true;
    });
    
    // speaking of save...
    //dojo.byId("save").onclick = function() {save(editor);};

  };
    
  var dirtyIndicator = "";
  var status = "";
  
  var statusReporter = function(message, isError) {
    if (isError) {
      status =  "ERROR: " + message;
      console.error("Orion editor ERROR:"+message);
    } else {
      status = message;
    }
//    dojo.byId("status").innerHTML = dirtyIndicator + status;
  };
  
  var editor = new orion.editor.Editor({
    textViewFactory: textViewFactory,
    undoStackFactory: new orion.editor.UndoFactory(),
    annotationFactory: annotationFactory,
    lineNumberRulerFactory: new orion.editor.LineNumberRulerFactory(),
    contentAssistFactory: contentAssistFactory,
    keyBindingFactory: keyBindingFactory, 
    statusReporter: statusReporter,
    domNode: editorDomNode
  });
    
  dojo.connect(editor, "onDirtyChange", this, function(dirty) {
    if (dirty) {
      dirtyIndicator = "*";
    } else {
      dirtyIndicator = "";
    }
    //dojo.byId("status").innerHTML = dirtyIndicator + status;
  });
  
  editor.installTextView();
  return editor;
}());

  //--------------------------------------------------------------------------------------------------------
  // Orion Editor API Implementation
  
  var editorFeatureByOrion = new thePurple.PurplePart('editorByOrion');
  
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
  
  editorFeatureByOrion.setContent = function(name, src) {
    this.sourceName = name;  // TODO multiple editors
    // if there is a mechanism to change which file is being viewed, this code would be run each time it changed.
    editor.onInputChange(name, null, src);
//    syntaxHighlighter.highlight(name, editor.getTextView());
    // end of code to run when content changes.
  };
    
  // name: a key given to setContent,
  // src: new buffer contents, 
  // startDamage: first pos of change (both old and new)
  // endDamage: last pos of change in *old* buffer 
  editorFeatureByOrion._sourceChange = function(name, src, startDamage, endDamage) {
    return this.toSomeParts("onSourceChange", arguments);
  };
  // name: a key given to setContent,
  // index: offset to the first char of a line just revealed.
  editorFeatureByOrion._lineRevealed = function(name, index) {
    return this.toSomeParts("onLineRevealed", arguments);
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
    var view = editor.getTextView();
    view.addEventListener("ModelChanged", this, this._onModelChanged, "no data");
    view.addEventListener("LineStyle", this, this._onLineStyle);
  };
    
  editorFeatureByOrion.destroy = function() {
    editor.getTextView().removeEventListener("ModelChanged", editorFeatureByOrion, editorFeatureByOrion._onModelChanged, "no data");
    editor.getTextView().removeEventListener("LineStyle", editorFeatureByOrion, editorFeatureByOrion._onLineStyle, "no data");
  };

  //----------------------------
  // Orion Event handlers
  editorFeatureByOrion._onModelChanged = function(event) {
    console.log("editor textView onModelChanged", arguments);
    var model = editor.getTextView().getModel();
    var startDamage = event.start; 
    var endDamage = event.start - event.removedCharCount + event.addedCharCount;
    editorFeatureByOrion._sourceChange(this.sourceName, model.getText(), startDamage, endDamage); 
    //syntaxHighlighter.highlight(this.sourceName, editor.getTextView());
  };
  
  editorFeatureByOrion._onLineStyle = function(event) {
      //e.ranges = this._getStyles(e.lineText, e.lineStart);
      // Pass source range to compiler, get back things that we need to build styles
      console.log("_onLineStyle called", event);
      // The goofy API here is because I want the interaction to be async eventually and for the compiler to only
      // know about events and the editor API.
      this.tokenStyles = [];
      var lineEnd = editor.getTextView().getModel().getLineEnd(event.lineIndex);
      this._lineRevealed(this.sourceName, event.lineStart, lineEnd, this.tokenStyles);
      event.ranges = this.tokenStyles;
  };
  
  Assembly.addPartContainer(editorFeatureByOrion);
  editorFeatureByOrion.implementsFeature('editor');
  thePurple.registerPart(editorFeatureByOrion);
  
  window.onbeforeunload = function() {
    if (editor.isDirty()) {
       console.log("TODO: There are unsaved changes.");
    }
  };


return editorFeatureByOrion;

});