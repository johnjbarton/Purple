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
/*global eclipse:true orion:true define document window require*/
/*jslint devel:true*/

// almost the embeddededitor code

define(['require', 'editor/orionAssembly', 'editor/annotationFactory', 'editor/revisionByOrion',       'q/q'], 
function(require,                  orion,         annotationFactory,          RevisionControl,            Q){

  // Syntax highlighting is triggered by an editor callback 'lineStyle' event
  function ErrorStyler(view) {
    this._onLineStyle = this._onLineStyle.bind(this);
	view.addEventListener("LineStyle", this._onLineStyle);
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

  var editorDomNode = document.getElementById("editor");
  
  // These stylesheets will be inserted into the iframe containing the editor.
  var stylesheets = [
    "orion/textview/textview.css", 
    "orion/textview/rulers.css", 
    "examples/textview/textstyler.css", 
    "examples/editor/htmlStyles.css"];
  // orion.client/bundles/org.eclipse.orion.client.editor/web/
  stylesheets = stylesheets.map(function(sheet) {
    return require.toUrl("orion/"+"../"+sheet);
  }).concat([require.toUrl("editor/../ui/purple.css")]);
    
  var textViewFactory = function() {
    return new orion.textview.TextView({
      parent: editorDomNode,
      stylesheet: stylesheets,
      tabSize: 2
    });
  };

  var contentAssistFactory = function(editor) {
    var contentAssist = new orion.editor.ContentAssist(editor, "contentassist");
    var cssContentAssistProvider = new orion.editor.CssContentAssistProvider();
    var jsContentAssistProvider = new orion.editor.JavaScriptContentAssistProvider();
    contentAssist.addEventListener("show", function() {
		if (/\.css$/.test(contentName)) {
			contentAssist.setProviders([cssContentAssistProvider]);
		} else if (/\.js$/.test(contentName)) {
			contentAssist.setProviders([jsContentAssistProvider]);
		}
	});
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
              this.stylers[extension] = new ErrorStyler(textView);
              break;
            case "java":
              //this.stylers[extension] = new examples.textview.TextStyler(textView, "java");
              break;
            case "css":
              //this.stylers[extension] = new examples.textview.TextStyler(textView, "css");
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
    var url = editor.sourceName;
    var src = editor.getContents();
    var saveFinished = RevisionControl.save(url, src);
    editor.setInput(null, null, null, true);
    Q.when(saveFinished, function(saveFinished) {
      console.log(url + ' save results ', saveFinished);
    }, function(error) {
      console.error(error);
    });
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
    
  };
    
  var statusReporter = function(message, isError) {
    if (isError) {
      console.error("Orion editor ERROR:"+message);
    } else {
      console.log("Orion editor: "+message);
    }
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
    
  editor.installTextView();

  return editor;

});