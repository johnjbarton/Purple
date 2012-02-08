// Copyright 2011 Google Inc. 
// Google BSD license
// johnjbarton@google.com

/*globals define console require window*/
(function() {
   require({
      paths: {
        'q':'../../lib/MetaObject/q',
        'MetaObject': "../../lib/MetaObject",
        'features': '../../features',
        'editor':'../../editor',
        'q-comm':'../../lib/MetaObject/q-comm',
        'lib': "../../lib",
        'orion': '../../editor/orion.client/bundles/org.eclipse.orion.client.editor/web/orion',
        'compiler': "../../compiler",
        'ui':"../../ui",
      }
    }); 
    
    require(['editor/editorInserter', 'editor/editorCompilerAssembly'], function assemble(editorInserter, editorCompilerAssembly) {
      console.log("editorCompilerAssembly loaded");
      editorCompilerAssembly.initialize();
      var parentElt = window.document.body;
      var url = "./cts.js";
      editorInserter.commands.open(parentElt, '500px', url);
    });


}());