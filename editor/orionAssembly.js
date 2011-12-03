// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*globals define */

define([
  "orion/textview/eventTarget",
  "orion/textview/keyBinding",
  "orion/textview/annotations", 
  "orion/textview/textModel",
  "orion/textview/projectionTextModel", 
  "orion/textview/textView", 
  "orion/textview/tooltip", 
  "orion/textview/rulers",
  "orion/textview/undoStack",
  "orion/editor/htmlGrammar",
  "orion/editor/webContentAssist",
  "orion/editor/editor",
  "orion/editor/editorFeatures"
], function(
  orion_textview_eventTarget,
  orion_textview_keyBinding,
  orion_textview_annotations, 
  orion_textview_textModel,
  orion_textview_projectionTextModel, 
  orion_textview_textView, 
  orion_textview_tooltip, 
  orion_textview_rulers,
  orion_textview_undoStack,
  orion_editor_htmlGrammar,
  orion_editor_webContentAssist,
  orion_editor_editor,
  orion_editor_editorFeatures
) {

  var orion = {
     textview: {},
     editor: {}
   };
   
  orion.textview.eventTarget = orion_textview_eventTarget;
  orion.textview.keyBinding = orion_textview_keyBinding;
  orion.textview.annotations = orion_textview_annotations;
  orion.textview.textModel = orion_textview_textModel;
  orion.textview.projectionTextModel = orion_textview_projectionTextModel;
  orion.textview.textView = orion_textview_textView; 
  orion.textview.tooltip = orion_textview_tooltip;
  orion.textview.rulers = orion_textview_rulers;
  orion.textview.undoStack = orion_textview_undoStack;
  orion.editor = orion_editor_editorFeatures;
  orion.editor.htmlGrammar =  orion_editor_htmlGrammar;
  orion.editor.webContentAssist = orion_editor_webContentAssist;
  orion.editor.editor = orion_editor_editor;

  return orion;

});