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
			var rulerStyle = {style: { backgroundColor: "#ffffff" }};
			this.annotationRuler = new orion.textview.AnnotationRuler("left", rulerStyle, {html: "<img src='/images/problem.gif'></img>"});
			this.overviewRuler = new orion.textview.OverviewRuler("right", rulerStyle, this.annotationRuler);
			return {annotationRuler: this.annotationRuler, overviewRuler: this.overviewRuler};
		},
		
		showProblems : function(problems) {
			var errors, i, k, escapedReason, functions;
			errors = problems || [];
			i = 0;
			if (errors.length>0 && errors[errors.length - 1] === null) {
				errors.pop();
			}
			var ruler = this.annotationRuler;
			if (!ruler) {
				return;
			}
			ruler.clearAnnotations();
			var lastLine = -1;
			for (k in errors) {
				if (errors[k]) {
					// escaping voodoo... we need to construct HTML that contains valid JavaScript.
					escapedReason = errors[k].reason.replace(/'/g, "&#39;").replace(/"/g, '&#34;');
					// console.log(escapedReason);
					var annotation = {
						line: errors[k].line - 1,
						column: errors[k].character,
						html: "<img src='/images/problem.gif' title='" + escapedReason + "' alt='" + escapedReason + "'></img>",
						overviewStyle: {style: {"backgroundColor": "lightcoral", "border": "1px solid red"}}
					};
					
					// only one error reported per line, unless we want to merge them.  
					// For now, just show the first one, and the next one will show when the first is fixed...
					if (lastLine !== errors[k].line) {
						// console.log("adding annotation at line " + errors[k].line);
						ruler.setAnnotation(errors[k].line - 1, annotation);
						lastLine = errors[k].line;
					}
				}
			}
		}
	};
	return AnnotationFactory;
}());


dojo.addOnLoad(function(){
	
	var editorDomNode = dojo.byId("editor");
	
	var textViewFactory = function() {
		return new orion.textview.TextView({
			parent: editorDomNode,
			stylesheet: ["/orion/textview/textview.css", "/orion/textview/rulers.css", "/examples/textview/textstyler.css", "/examples/editor/htmlStyles.css"],
			tabSize: 4
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
//		dojo.byId("status").innerHTML = dirtyIndicator + status;
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
	  
	  // problems: array of {reason: a string, line: anumber, character: aColumnNumber}
	  reportError: function(message, location) {
	    var problem = {reason: message, line: location.line+1, character: location.column+1};
	    annotationFactory.showProblems([problem]); 
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
			 return "There are unsaved changes.";
		}
	};
});
