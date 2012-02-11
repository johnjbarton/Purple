// Copyright 2011 Google Inc. 
// Google BSD license
// johnjbarton@google.com

/*globals define console require window*/
(function() {
     require({
      paths: {
        'q':'../../../q',
        'MetaObject': "../../lib/MetaObject",
        'features': '../../features',
        'editor':'../../editor',
        'q-comm':'../../../q-comm',
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
      return editorInserter.commands.open(parentElt, url);
    }
    
    function openOutput(editorInserter, url) {
      var parentElt = window.document.getElementById('output');
      parentElt.setAttribute('height', '500px');
      console.log('inserting output');
      return editorInserter.commands.open(parentElt, url);
    }
    
    require(['editor/editorInserter'], function assemble(editorInserter) {
      var baseUrl = window.location.toString().split('/');
      baseUrl.pop(); // remove filename
      baseUrl = baseUrl.join('/');
      var editor = openEditor(editorInserter, baseUrl+'/cts.js');
      var output = openOutput(editorInserter, baseUrl+'/cts.js');
      var editorOnSourceChange = editor.onSourceChange;
      editor.onSourceChange = function() {
        var args = Array.prototype.slice.call(arguments);
        var compiled = editorOnSourceChange.apply(editor, args);
        output.show(compiled);
      };
      
    });

}());