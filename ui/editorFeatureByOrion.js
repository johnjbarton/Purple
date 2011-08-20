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

window.purple = window.purple || {};

// See org.eclipse.orion.client.editor/web/orion/editor/editorFeatures.js  
window.purple.AnnotationFactory = (function() {
  function AnnotationFactory() {
  }
  AnnotationFactory.prototype = {
    createAnnotationRulers: function() {
      var rulerStyle = {'class': 'purple_annotation', style: { backgroundColor: "#ffffff", width: '240px', lineHeight: '17px' }};
      // "Every ruler div has one extra div at the top (firstChild before any lines). 
      // This div is used to determine the width of the ruler.' Silenio Quarti on orion-dev
      var minusOneAnnotation = {html: "<a>undefined <img> src='/images/problem.gif'></img></a>", style: rulerStyle};
      this.annotationRuler = new orion.textview.AnnotationRuler("left", rulerStyle, minusOneAnnotation);
      var overviewStyle = {style: {backgroundColor: '#FFFFFF'}};
      this.overviewRuler = new orion.textview.OverviewRuler("right", overviewStyle, this.annotationRuler);
      return {annotationRuler: this.annotationRuler, overviewRuler: this.overviewRuler};
    },

    _showAnnotation: function(data, createAnnotation) {
      var ruler = this.annotationRuler;
      if (!ruler) {
        return;
      }
      ruler.clearAnnotations();
      var annotation = createAnnotation(data);
      ruler.setAnnotation(annotation.line - 1, annotation);
    },
    
    createErrorAnnotation: function(indicator) {
      // escaping voodoo... we need to construct HTML that contains valid JavaScript.
      var escapedReason = indicator.tooltip.replace(/'/g, "&#39;").replace(/"/g, '&#34;');
      var annotation = {
        line: indicator.line,
        column: indicator.column,
        html: "<a style='line-height:17px;' class='purpleAnnotation' title='" + escapedReason + "' alt='" + escapedReason + "'>"+indicator.token+"</a>",
        overviewStyle: {style: {"backgroundColor": "lightcoral", "border": "1px solid red"}}
      };
	  return annotation;
    },
    
    // indicators = {}
    showIndicator: function(indicator) {
      this._showAnnotation(indicator, this.createErrorAnnotation);
    },
    
    createValueAnnotation: function(evaluation) {
      var value = evaluation.value;
      var tooltip = Object.keys(value).join(', ');
      var annotation = {
        line: evaluation.line,
        column: evaluation.column,
        html: "<a style='line-height:17px;' class='purpleAnnotation' title='" + tooltip + "' alt='" + tooltip + "'>"+value+"</a>",
        overviewStyle: {style: {"backgroundColor": "lightcoral", "border": "1px solid red"}}
      };
	  return annotation;
    },
    
    showValue: function(evaluation) {
	  this._showAnnotation(evaluation, this.createValueAnnotation);
    },
  };
  return AnnotationFactory;
}());


// Syntax highlighting is triggered by an editor callback 'lineStyle' event
window.purple.ErrorStyler = (function () {
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
    },
  };
  return ErrorStyler;
}());

dojo.addOnLoad(function(){
  
  var editorDomNode = dojo.byId("editor");
  
  // These stylesheets will be inserted into the iframe containing the editor.
  var stylesheets = [
    "/orion/textview/textview.css", 
    "/orion/textview/rulers.css", 
    "/examples/textview/textstyler.css", 
    "/examples/editor/htmlStyles.css",
    "ui/purple.css"];
    
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
              this.stylers[extension] = new window.purple.ErrorStyler(textView);
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
  
  var annotationFactory = new window.purple.AnnotationFactory();

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
  
  //--------------------------------------------------------------------------------------------------------
  // Orion Editor API Implementation
  var thePurple = window.purple;
  
  var editorFeatureByOrion = {};
  editorFeatureByOrion = new thePurple.Feature();
  var editor__ = editorFeatureByOrion;
  
  //--------------------------------------------------------------------------------------------------------
  // Implement features.editor
  
  // Errors reported but not used by the highlighter yet.
  editor__._unclaimedIndicators = []; 
  
  editor__.setContent = function(name, src) {
    this.sourceName = name;  // TODO multiple editors
    // if there is a mechanism to change which file is being viewed, this code would be run each time it changed.
    editor.onInputChange(name, null, src);
    syntaxHighlighter.highlight(name, editor.getTextView());
    // end of code to run when content changes.
  };
    
  // name: a key given to setContent,
  // src: new buffer contents, 
  // startDamage: first pos of change (both old and new)
  // endDamage: last pos of change in *old* buffer 
  editor__._sourceChange = function(name, src, startDamage, endDamage) {
    return this.someListeners("onSourceChange", arguments);
  };
    
  // indicator: {token: string, tooltip: string, line: number, column: number 
  editor__.reportError = function(indicator) {
    indicator.line = indicator.line + 1;
    indicator.column = indicator.column + 1;
    annotationFactory.showIndicator(indicator); 
  };
  
  editor__.showValue = function(value, line, col) {
    annotationFactory.showValue({value: value, line: line, column: col});
  },

  //---------------------------------------------------------------------------------------------
  // Implement PurplePart
  editorFeatureByOrion.initialize = function(thePurple) {
    thePurple.implementFeature('editor', this);
  };

  editorFeatureByOrion.connect = function(thePurple) {
    editor.getTextView().addEventListener("ModelChanged", editorFeatureByOrion, editorFeatureByOrion.onModelChanged, "no data");
  };
    
  editorFeatureByOrion.disconnect = function(thePurple) {
    editor.getTextView().removeEventListener("ModelChanged", editorFeatureByOrion, editorFeatureByOrion.onModelChanged, "no data");
  };
    
  editorFeatureByOrion.destroy = function(thePurple) {
    thePurple.unimplementFeature('editor', this);
  };

  //----------------------------
  // Orion Event handlers
  editorFeatureByOrion.onModelChanged = function(event) {
    console.log("editor textView onModelChanged", arguments);
    var model = editor.getTextView().getModel();
    editorFeatureByOrion._sourceChange(this.sourceName, model.getText(), event.start, event.removedCharCount); 
    syntaxHighlighter.highlight(this.sourceName, editor.getTextView());
  };
  
  thePurple.registerPart(editorFeatureByOrion);
  
  window.onbeforeunload = function() {
    if (editor.isDirty()) {
       console.log("TODO: There are unsaved changes.");
    }
  };
});
