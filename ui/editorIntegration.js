window.purple = window.purple || {}; // our namespace
  

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
  
  
window.purple.editorIntegration = {
  // -----------------------------------------------------------------------------------
  // To Editor
  onEditorReady: function(editorAPI) {
    this.editorAPI = editorAPI;
    this.initializeEditor();
  },    
  
  initializeEditor: function() {    
    this.editorAPI.setContent("inBrowser", "");
  },
  
  reportError: function(message, location) {
    this.editorAPI.reportError(message, location);
  },
  // -----------------------------------------------------------------------------------
  // From editor
  onSourceChange: function(name, src, startDamage, endDamage) {
    console.warning("Source change to "+name+" not overridden");
  },
  
};
