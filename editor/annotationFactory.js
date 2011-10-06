// See org.eclipse.orion.client.editor/web/orion/editor/editorFeatures.js  
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define([], function() {

  var AnnotationFactory = {
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
      if (typeof value === 'object') {
	      var tooltip = Object.keys(value).join(', ');
      } else {
          var tooltip = typeof value;
      }
	      
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
    }
  };
  return AnnotationFactory;
});
