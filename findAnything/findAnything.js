// See license.txt, BSD
// Copyright 2011 Google, Inc. author: johnjbarton@google.com


define(['../lib/domplate/lib/domplate'], function findAnythingFactory(DOMPLATE) {
  
  var anyThingBar = {
    initialize: function() {
      with (DOMPLATE.tags) {
        this.template = DOMPLATE.domplate({
          tag: DIV({'id': 'findAnythingToolbar','class':'purpleToolbar', 'style': "color: purple;"},
             FOR('preButton', '$preButtons', 
               TAG("$buttonTag", {button: "$button"})
             ),
             INPUT({'id':'findAnythingInput'})          
           ),
          capitalize: function(str) {
            return str.toUpperCase();
          }
        });
      }    
    },
    update: function() {
      var html = this.template.tag.render({
        preButtons: [],
      });
  
      document.getElementsByTagName('body')[0].innerHTML = html;
      this.resize();
    },
    resize: function () {
      var toolbar = document.getElementById('findAnythingToolbar');
      var input =  document.getElementById('findAnythingInput');
      var availableWidth = toolbar.width;
      // remove the width of childern TODO
      availableWidth -= 24*4;
      input.style.width = availableWidth +"px";
      input.style.left = 24*2+"px";
    }
  };
  
  return anyThingBar;
});