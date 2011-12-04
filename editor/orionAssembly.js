// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

/*globals define*/

define([
  "../../lib/Base.js",
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
  "orion/editor/contentAssist",
  "orion/editor/webContentAssist",
  "orion/editor/editor",
  "orion/editor/editorFeatures"
], function(
  Base,
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
  orion_editor_contentAssist,
  orion_editor_webContentAssist,
  orion_editor_editor,
  orion_editor_editorFeatures
) {

  var orion = Base.extend({
  });
   
  orion.textview = orion.merge(
    orion_textview_eventTarget,
    orion_textview_keyBinding,
    orion_textview_annotations,
    orion_textview_textModel,
    orion_textview_projectionTextModel,
    orion_textview_textView, 
    orion_textview_tooltip,
    orion_textview_rulers,
    orion_textview_undoStack
  );
  
  orion.editor = orion.merge(
    orion_editor_editorFeatures,
    orion_editor_htmlGrammar,
    orion_editor_contentAssist,
    orion_editor_webContentAssist,
    orion_editor_editor
  );

  return orion;

});