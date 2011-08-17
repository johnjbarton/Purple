window.purple = { // our namespace
  onEditorReady: function(editor, syntaxHighlighter) {
  	this.editor = editor;
  	this.syntaxHighligher = syntaxHighlighter;
  		// if there is a mechanism to change which file is being viewed, this code would be run each time it changed.
	var contentName = "purple.js";  // for example, a file name, something the user recognizes as the content.
	var initialContent = "window.alert('this is some purple code');  // try pasting in some real code";
	editor.onInputChange(contentName, null, initialContent);
	syntaxHighlighter.highlight(contentName, editor.getTextView());
	// end of code to run when content changes.
  }
};
