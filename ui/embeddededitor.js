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
	
	var annotationFactory = new orion.editor.AnnotationFactory();

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
		dojo.byId("save").onclick = function() {save(editor);};

	};
		
	var dirtyIndicator = "";
	var status = "";
	
	var statusReporter = function(message, isError) {
		if (isError) {
			status =  "ERROR: " + message;
		} else {
			status = message;
		}
		dojo.byId("status").innerHTML = dirtyIndicator + status;
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
		dojo.byId("status").innerHTML = dirtyIndicator + status;
	});
	
	editor.installTextView();
	window.purple.onEditorReady(editor, syntaxHighlighter);
	
	window.onbeforeunload = function() {
		if (editor.isDirty()) {
			 return "There are unsaved changes.";
		}
	};
});
