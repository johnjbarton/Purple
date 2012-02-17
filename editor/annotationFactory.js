// See org.eclipse.orion.client.editor/web/orion/editor/editorFeatures.js  
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

/*global define */

define(['../lib/MetaObject', 'editor/orionAssembly'], function(MetaObject, orion) {

var AnnotationFactory = MetaObject.mergeMethods(
  orion.editor.AnnotationFactory.prototype,
  {
    createAnnotationRulers: function(annotationModel) {
      this.annotationModel = annotationModel;
      var rulerStyle = {'class': 'purple_annotation', style: { backgroundColor: "#ffffff", width: '240px', lineHeight: '17px' }};
      // "Every ruler div has one extra div at the top (firstChild before any lines). 
      // This div is used to determine the width of the ruler.' Silenio Quarti on orion-dev
      //var minusOneAnnotation = {html: "<a>undefined <img> src='/images/problem.gif'></img></a>", style: rulerStyle};
      this.annotationRuler = new orion.textview.AnnotationRuler(annotationModel, "left", rulerStyle);
      var overviewStyle = {style: {backgroundColor: '#FFFFFF'}};
      this.overviewRuler = new orion.textview.OverviewRuler(annotationModel, "right", overviewStyle);
      return {annotationRuler: this.annotationRuler, overviewRuler: this.overviewRuler};
    },

    _showAnnotation: function(data, createAnnotation) {
      this.annotationModel.removeAnnotations();
      var annotation = createAnnotation.apply(this, [data]);
      this.annotationModel.addAnnotation(annotation);
    },
    
    getOffsetsByLine: function(line, column) {
      var textModel = this.annotationModel.getTextModel();
      return {
        start: textModel.getLineStart(line) + ( column || 0 ),
        end: textModel.getLineEnd(line, true)
      };
    },
    
    createErrorAnnotation: function(indicator) {
      // escaping voodoo... we need to construct HTML that contains valid JavaScript.
      var escapedReason = indicator.tooltip.replace(/'/g, "&#39;").replace(/"/g, '&#34;');
      
      var annotation = this.getOffsetsByLine(indicator.line - 1, indicator.column);
      annotation.html = "<a style='line-height:17px;' class='purpleAnnotation' title='" + escapedReason + "' alt='" + escapedReason + "'>"+indicator.token+"</a>";
      annotation.overviewStyle = {style: {"backgroundColor": "lightcoral", "border": "1px solid red"}};
      annotation.type = 'orion.annotation.error';
      
	  return annotation;
    },
    
    // indicators = {}
    showIndicator: function(indicator) {
      this._showAnnotation(indicator, this.createErrorAnnotation);
    },
    
    createValueAnnotation: function(evaluation) {
      var value = evaluation.value;
      var tooltip; 
      if (typeof value === 'object') {
	      tooltip = Object.keys(value).join(', ');
      } else {
          tooltip = typeof value;
      }
	      
      var annotation = {
        type: "purple.evaluation",
        start: evaluation.line,
        column: evaluation.column,
        html: "<a style='line-height:17px;' class='purpleAnnotation' title='" + tooltip + "' alt='" + tooltip + "'>"+value+"</a>",
        overviewStyle: {style: {"backgroundColor": "lightcoral", "border": "1px solid red"}}
      };
	  return annotation;
    },
    
    showValue: function(evaluation) {
	  this._showAnnotation(evaluation, this.createValueAnnotation);
    },
    
    initialize: function() {
      // no-op
    }
  }
);
  
  // return an instance which creates Annotations
  return AnnotationFactory.new();
});
