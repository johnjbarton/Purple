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
    // indicators = {}
    showIndicator : function(indicator) {
      var ruler = this.annotationRuler;
      if (!ruler) {
        return;
      }
      ruler.clearAnnotations();
      var lastLine = -1;
      // escaping voodoo... we need to construct HTML that contains valid JavaScript.
      var escapedReason = indicator.tooltip.replace(/'/g, "&#39;").replace(/"/g, '&#34;');
      var annotation = {
        line: indicator.line,
        column: indicator.column,
        html: "<a style='line-height:17px;' class='purpleAnnotation' title='" + escapedReason + "' alt='" + escapedReason + "'>"+indicator.token+"</a>",
        overviewStyle: {style: {"backgroundColor": "lightcoral", "border": "1px solid red"}}
      };
      ruler.setAnnotation(indicator.line - 1, annotation);
    }
  };
  return AnnotationFactory;
}());


dojo.addOnLoad(function(){
  
  var editorDomNode = dojo.byId("editor");
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
    styler: null, 
    
    highlight: function(fileName, textView) {
      if (this.styler) {
        this.styler.destroy();
        this.styler = null;
      }
      if (fileName) {
        var splits = fileName.split(".");
        var extension = splits.pop().toLowerCase();
        if (splits.length > 0) {
          switch(extension) {
            case "js":
              this.styler = new examples.textview.TextStyler(textView, "js");
              break;
            case "java":
              this.styler = new examples.textview.TextStyler(textView, "java");
              break;
            case "css":
              this.styler = new examples.textview.TextStyler(textView, "css");
              break;
            case "html":
              this.styler = new orion.editor.TextMateStyler(textView, orion.editor.HtmlGrammar.grammar);
              break;
          }
        }
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
  var editorAPI = {
    initialize: function(editor, syntaxHighlighter) {
      editor.getTextView();
      editor.getTextView().addEventListener("ModelChanged", editorAPI, editorAPI.onModelChanged, "no data");
    window.purple.editorIntegration.onEditorReady(this);
    },
    
    setContent: function(name, src) {
      this.sourceName = name;  // TODO multiple editors
      // if there is a mechanism to change which file is being viewed, this code would be run each time it changed.
    editor.onInputChange(name, null, src);
    syntaxHighlighter.highlight(name, editor.getTextView());
    // end of code to run when content changes.
    },
    
    // name: a key given to setContent,
    // src: new buffer contents, 
    // startDamage: first pos of change (both old and new)
    // endDamage: last pos of change in *old* buffer 
    sourceChange: function(name, src, startDamage, endDamage) {
      window.purple.editorIntegration.onSourceChange(name, src, startDamage, endDamage);
    },
    
    // indicator: {token: string, tooltip: string, line: number, column: number 
    reportError: function(indicator) {
      indicator.line = indicator.line + 1;
      indicator.column = indicator.column + 1;
      annotationFactory.showIndicator(indicator); 
    },
    
    //----------------------------
    // Event handlers
    onModelChanged: function(event) {
      console.log("editor textView onModelChanged", arguments);
      var model = editor.getTextView().getModel();
      editorAPI.sourceChange(this.sourceName, model.getText(), event.start, event.removedCharCount); 
    }
  };
  
  editorAPI.initialize(editor, syntaxHighlighter);
  
  
  window.onbeforeunload = function() {
    if (editor.isDirty()) {
       console.log("TODO: There are unsaved changes.");
    }
  };
});
