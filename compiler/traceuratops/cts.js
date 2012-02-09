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
    
    function openEditor(editorInserter, url) {
      var parentElt = window.document.getElementById('editor');
      parentElt.setAttribute('height', '500px');
      console.log('inserting editor');
      editorInserter.commands.open(parentElt, url);
    }
    
    function openOutput(editorInserter, url) {
      var parentElt = window.document.getElementById('output');
      parentElt.setAttribute('height', '500px');
      console.log('inserting output');
      editorInserter.commands.open(parentElt, url);
    }
    
    require(['editor/editorInserter'], function assemble(editorInserter) {
      var baseUrl = window.location.toString().split('/');
      baseUrl.pop(); // remove filename
      baseUrl = baseUrl.join('/');
      openEditor(editorInserter, baseUrl+'/cts.js');
      openOutput(editorInserter, baseUrl+'/cts.js');
      
    });


}());