// See license.txt, BSD
// Copyright 2011 Google, Inc. author: johnjbarton@google.com


define(['../lib/domplate/lib/domplate'], function findAnythingFactory(DOMPLATE) {
  
  var anyThingBar = new thePurple.PurplePart('findAnything');

    anyThingBar.initialize = function() {
      this.buildDomplate();
      this.renderDomplate();
      this.addListeners();
    };
    
    anyThingBar.buildDomplate = function() {
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
    };
    
    anyThingBar.renderDomplate = function() {
      var html = this.template.tag.render({
        preButtons: [],
      });
  
      var body = document.getElementsByTagName('body')[0];
      body.innerHTML = html;
      this.resize();
    };
    
    anyThingBar.addListeners = function () {
      window.addEventListener('resize', this.resize, true);
      
    };
    // ------------------------------------------------------------------------
    // Output
    anyThingBar.resize = function () {
      var toolbar = document.getElementById('findAnythingToolbar');
      var availableWidth = toolbar.offsetWidth;
      // remove the width of childern TODO
      availableWidth -= 24*4;
      this.setWidth('findAnythingBackground', availableWidth);
      this.setWidth('findAnythingCompletion', availableWidth);
      this.setWidth('findAnythingInput', availableWidth);
      //this.setWidth('findAnythingNotify', availableWidth);
    };
    
    anyThingBar.setWidth = function(id, availableWidth) {
      var elt =  document.getElementById(id);
      elt.style.width = availableWidth +"px";
    };
    
    // -------------------------------------------------------------------------
    // Input
    anyThingBar.eventsToElements = {
      keypress: makeListener('#findAnythingInput', function(event) {
        console.log("findAnything.keypress ", event.charCode);
      }.bind(anyThingBar)),
    };
  
  anyThingBar.featureImplemented = function(feature) {
    if (feature.name === 'load') {
    } 
  }

  anyThingBar.featureUnimplemented = function(feature) {
    if (feature.name === 'load') {
      anyThingBar.removeListeners();
    } 
  }
  
  thePurple.registerPart(anyThingBar);
  
  anyThingBar.onUnload = (function() {
      window.removeEventListener('unload', anyThingBar.onUnload, false);
      anyThingBar.removeListeners();
  }).bind(anyThingBar);
  window.addEventListener('unload', anyThingBar.onLoad, false);

   anyThingBar.initialize();
   anyThingBar.removeListeners = addListeners(anyThingBar.eventsToElements);
  
  function makeListener(selector, handler) {
    handler.selector = selector;
    return handler;
  }
  
  function addListeners(eventHandlers) {
    Object.keys(eventHandlers).forEach(function on(prop) {
      var handler = eventHandlers[prop];
      var selector = handler.selector;
      var elt = document.querySelector(selector);
      elt.addEventListener(prop, handler, false);
      handler.element = elt;
    });
    return makeRemoveListeners(eventHandlers);
  }
  
  function makeRemoveListeners(eventHandlers) {
    return function removeListeners() {
       Object.keys(eventHandlers).forEach(function off(prop) {
         var handler = eventHandlers[prop];
         var elt = handler.element;
         elt.removeEventListener(prop, handler, false);
       });
    }
  }
  
  return anyThingBar;
});