// Copyright 2011 Google Inc. 
// Google BSD license
// johnjbarton@google.com

/*globals define console require window*/
(function() {
     require({
      paths: {
        'MetaObject': "../../lib/MetaObject",
        'features': '../../features',
        'editor':'../../editor',
        'lib': "../../lib",
        'orion': '../../editor/orion.client/bundles/org.eclipse.orion.client.editor/web/orion',
        'compiler': "../../compiler",
        'ui':"../../ui",
      }
    }); 
    
    require(['editor/editorInserter', 'editor/editorInterface'], 
    function assemble(editorInserter,         editorInterface) {
    
      function insert(parentID, fncOfIframe) {
        var parentElt = window.document.getElementById(parentID);
        parentElt.setAttribute('height', '500px');
        console.log('inserting '+parentID);
        return editorInserter.commands.open(parentElt, fncOfIframe);
      }

      var baseUrl = window.location.toString().split('/');
      baseUrl.pop(); // remove filename
      baseUrl = baseUrl.join('/');
      
      function Sync(joins, thenCall) {
        this.joins = joins;
        this.thenCall = thenCall;
        this.props = {};
      }
      Sync.prototype.join = function(prop, value) {
        var propIndex = this.joins.indexOf(prop);
        if (propIndex === -1) {
          throw new Error(prop+" is not in ",this.joins);
        } else {
          this.props[prop] = value;
          this.joins.splice(propIndex, 1);
          if (!this.joins.length) {
            this.thenCall.apply(this, [this.props]);
          }
        }
      };
      
      function connect(props) {
        var editor = props.editor;
        var output = props.output;
        
        var editorOnSourceChange = editor.onSourceChange;
        editor.onSourceChange = function() {
          var args = Array.prototype.slice.call(arguments);
          var compiled = editorOnSourceChange.apply(editor, args);
          if (compiled) {
            editor.saveFocus();
            output.events.show("Traceur.out", compiled);
            editor.restoreFocus();
          }
        };
        console.log("Opening editor url");
        editor.events.open(baseUrl+'/test.js', 1, 1, function(openedEditor) {
          window.document.querySelector('#editor iframe').classList.remove('hidden');
          window.document.querySelector('#output iframe').classList.remove('hidden');
        });
      }
      
      var sync = new Sync(['editor', 'output'], connect);
      var editor = insert('editor');
      editor.contentWindow.addEventListener('purpleEditorReady', function(event) {
        var editor = event.detail;
        sync.join('editor', editor);
      }, false);
      
      var output = insert('output');
      output.contentWindow.addEventListener('purpleEditorReady', function(event) {
        var output = event.detail;
        sync.join('output', output);
      }, false);
      

      
    });

}());