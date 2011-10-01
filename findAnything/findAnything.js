// See license.txt, BSD
// Copyright 2011 Google, Inc. author: johnjbarton@google.com


define(['../lib/domplate/lib/domplate'], function findAnythingFactory(DOMPLATE) {
  
  var anyThingBar = {
    initialize: function() {
      this.buildDomplate();
      this.renderDomplate();
      this.addListeners();
    },
    buildDomplate: function() {
      with (DOMPLATE.tags) {
        this.template = DOMPLATE.domplate({
          tag: DIV({'id': 'findAnythingToolbar','class':'purpleToolbar'},
             FOR('preButton', '$preButtons', 
               TAG("$buttonTag", {button: "$button"})
             ),
             DIV({'id': 'findAnything', 'class':'omniboxLikeLeft omniboxLike omniboxLikeRight'}, 
               IMG({'id': 'findAnythingIcon', 'class':'findAnythingIcon omniboxLikeLeft', 'src':'../ui/icons/o2_http_query.png'} ),
               DIV({'id':'findAnythingBackground'},
                 INPUT({'id':'findAnythingCompletion', 'value':'.js'}),
                 DIV({'id':'findAnythingNotify'}, 'Resource and event counts here'),
                 INPUT({'id':'findAnythingInput', 'value':'.js'})
               )
             )
           ),
        });
      }    
    },
    renderDomplate: function() {
      var html = this.template.tag.render({
        preButtons: [],
      });
  
      var body = document.getElementsByTagName('body')[0];
      body.innerHTML = html;
      this.resize();
    },
    
    addListeners: function () {
      window.addEventListener('resize', this.resize, true);
      
    },
    
    resize: function () {
      var toolbar = document.getElementById('findAnythingToolbar');
      var availableWidth = toolbar.offsetWidth;
      // remove the width of childern TODO
      availableWidth -= 24*4;
      this.setWidth('findAnythingBackground', availableWidth);
      this.setWidth('findAnythingCompletion', availableWidth);
      this.setWidth('findAnythingInput', availableWidth);
      //this.setWidth('findAnythingNotify', availableWidth);
    },
    setWidth: function(id, availableWidth) {
      var elt =  document.getElementById(id);
      elt.style.width = availableWidth +"px";
    }
  };
  
  
  
  function listen(eventSelectorPairs, handlers) {
    Object.keys(eventSelectorPairs).forEach(function on(prop) {
      var selector = eventSelectorPairs[prop];
      var elt = document.querySelector(selector);
      var handler = handlers[prop];
      if (!handler.isBound) {
        handlers[prop] = handler.bind(handlers);
        handlers[prop].isBound = handler;
        handler = handlers[prop];
      }
      elt.addEventListener(prop, handler, false);
    });
  }
  
  listen({'resize': 'body'}, anyThingBar);
  
  
  return anyThingBar;
});