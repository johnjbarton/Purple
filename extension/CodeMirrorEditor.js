
(function() {
  function toCSSClassname(str) {
    return str.replace(/[^_a-zA-Z0-9-]/,'_');
  }  

  window.purple = {
    createEditor: function(url, withContent, ofMIMEType) {
      var inElement = document.createElement('div');
      inElement.classList.add(toCSSClassname(url));
      inElement.classList.add('purple-editor');
      document.body.appendChild(inElement);

      var editor = CodeMirror(inElement, {
        value: withContent,
        mode:  (ofMIMEType === 'script' ? 'javascript' : 'css'),
        lineNumbers: true,
        lineWrapping: true,
        onGutterClick: function(cm, line) {
          var info = cm.lineInfo(line);
          if (info.markerText) {
            cm.clearMarker(line);
          } else {
            cm.setMarker(line, "<span style=\"color: #0AF; font-weight: bold;\">%N%</span>");
          }
        }
      });
      return {
        goToLine: function(line, column) {
          editor.setCursor({line:line||0, ch:0});
        }    
      };
    }
    
    
  };

}());

