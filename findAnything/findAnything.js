// See license.txt, BSD
// Copyright 2011 Google, Inc. author: johnjbarton@google.com


define(['../lib/domplate/lib/domplate', '../lib/part', 'ui/ButtonTray/MiniButtonTray'], 
function findAnythingFactory(DOMPLATE,    PurplePart,                 MiniButtonTray) {
  
  var anyThingBar = new PurplePart('findAnything');

    anyThingBar.initialize = function() {
      this.buildDomplate();
      this.renderDomplate();
    };
    
    anyThingBar.buildDomplate = function() {
      with (DOMPLATE.tags) {
        this.template = DOMPLATE.domplate({
          tag: DIV({'id': 'findAnythingToolbar','class':'purpleToolbar'},
             FOR('preButton', '$preButtons', 
               TAG("$preButton.tag", {object: "$preButton"})
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
    
    anyThingBar.miniButton = function(symbol, toggle, feature) {
      return {
        object: {
          symbol: symbol,
          toggleState: function() {
            return anyThingBar['toggle'+toggle](feature);
          }
        }
      }
    };
    
    anyThingBar.renderDomplate = function() {
      var html = this.template.tag.render({
        preButtons: [ 
          {
            toolTip:"Enabled Sources", 
            miniButtons:[
              anyThingBar.miniButton('C', 'Enable', 'Console'),
              anyThingBar.miniButton('J', 'Enable', 'JavaScript'),
              anyThingBar.miniButton('N', 'Enable', 'Network'),
              anyThingBar.miniButton('B', 'Enable', 'Browser'),
            ],
            tag: MiniButtonTray.tag,
          },
        ],
      });
  
      var body = document.getElementsByTagName('body')[0];
      body.innerHTML = html;
      this.resize();
    };
    
    // ------------------------------------------------------------------------
    // Output
    anyThingBar.resize = function () {
      var toolbar = document.getElementById('findAnythingToolbar');
      var availableWidth = toolbar.offsetWidth - 24*6;  // TODO compute width of children
      this.setWidth('findAnything', availableWidth);
//      this.setWidth('findAnythingCompletion', availableWidth);
//      this.setWidth('findAnythingInput', availableWidth);
    };
    
    anyThingBar.setWidth = function(id, availableWidth) {
      var elt =  document.getElementById(id);
      elt.style.width = availableWidth +"px";
    };

    // -------------------------------------------------------------------------
    // Input

    anyThingBar.makeListener = function(selector, handler) {
      var boundHandler = handler.bind(this);
      boundHandler.selector = selector;
      return boundHandler;
    }

    anyThingBar.eventsToElements = {
      keypress: anyThingBar.makeListener('#findAnythingInput', function(event) {
        console.log("findAnything.keypress ", event.charCode);
      }),
      resize: anyThingBar.makeListener(window, anyThingBar.resize),
    };
  
  
  anyThingBar.onUnload = (function() {
      window.removeEventListener('unload', anyThingBar.onUnload, false);
      anyThingBar.removeListeners();
  }).bind(anyThingBar);
  window.addEventListener('unload', anyThingBar.onLoad, false);

  anyThingBar.initialize();
  anyThingBar.removeListeners = addListeners(anyThingBar.eventsToElements);
  
  function addListeners(eventHandlers) {
    Object.keys(eventHandlers).forEach(function on(prop) {
      var handler = eventHandlers[prop];
      var selector = handler.selector;
      if (typeof selector === 'string') {
        var elt = document.querySelector(selector);
        elt.addEventListener(prop, handler, false);
        handler.element = elt;
      } else {
        selector.addEventListener(prop, handler, false);
        handler.element = selector;
      }

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