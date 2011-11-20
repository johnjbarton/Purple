// See license.txt, BSD
// Copyright 2011 Google, Inc. author: johnjbarton@google.com


define(['../lib/domplate/lib/domplate', '../lib/part', 'ui/ButtonTray/MiniButtonTray'], 
function findAnythingFactory(DOMPLATE,    PurplePart,                 MiniButtonTray) {
  
  var anyThingBar = new PurplePart('findAnything');

    anyThingBar.initialize = function(thePurple) {
      this.thePurple = thePurple;
      this.buildDomplate();
      this.renderDomplate();
      this.removeListeners = addListeners(anyThingBar.eventsToElements);
    };
    
    anyThingBar.buildDomplate = function() {
      with (DOMPLATE.tags) {
        
        this.preButtonPlate = DOMPLATE.domplate({
          tag: FOR('preButton', '$preButtons', 
                 TAG("$preButton.tag", {object: "$preButton"})
               ),
        });
        
        this.template = DOMPLATE.domplate({
          tag: DIV({'id': 'findAnythingToolbar','class':'purpleToolbar'},
                 TAG(anyThingBar.preButtonPlate.tag, {preButtons: '$preButtons'}),
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
    
    anyThingBar.toggleEnable = function(partName, fnOfSelected) {
      var part = this.thePurple.getPartByName(partName);
      return part.toggleEnable();
    };
    
    anyThingBar.logEnableButtonTray = {
      name: 'logEnableButtonTray',
      toolTip:"Enabled Sources", 
      miniButtons:[  // see partAdded
        // eg anyThingBar.miniButton('C', 'Enable', 'consoleLog'),
      ],
      tag: MiniButtonTray.tag,
    };
          
    anyThingBar.preButtons = [
      anyThingBar.logEnableButtonTray
    ];
    
    anyThingBar.miniButton = function(symbol, toggle, partName) {
      var button = {
          symbol: symbol,
          partName: partName,
          toggleState: function() {
            return anyThingBar['toggle'+toggle](partName);
          },
          listener: function(event) {
            if (event.type === 'logEnable') {
              MiniButtonTray.setSelected(button, event.enabled);
            }
          }
      };
      return button;
    };
    
    anyThingBar.partAdded = function(part) {
      if (part.hasFeature('Log')) {
        var symbol = part.name[0].toUpperCase(); // a little hacky...
        var partEnableButton = this.miniButton(symbol, 'Enable', part.name);
        MiniButtonTray.addButton(anyThingBar.logEnableButtonTray, partEnableButton);
        part.addListener(partEnableButton.listener);
      }
    };
    
    anyThingBar.partRemoved = function(part) {
      if (part.hasFeature('Log')) {
        var symbol = part.name[0].toUpperCase(); // a little hacky...
        var partEnableButton = anyThingBar.logEnableButtonTray.miniButtons.forEach(function(button){
          if (button.partName === part.name) {
            MiniButtonTray.removeButton(anyThingBar.logEnableButtonTray, button);
            part.removeListener(button.listener);
          }
        });
      }
    };

    anyThingBar.renderDomplate = function() {
      var body = document.getElementsByTagName('body')[0];
      this.template.tag.replace({
        preButtons: [ anyThingBar.logEnableButtonTray ]
      }, body);
      this.resize();
    };
    
    // ------------------------------------------------------------------------
    // Output
    anyThingBar.resize = function () {
      var toolbar = document.getElementById('findAnythingToolbar');
      var availableWidth = toolbar.offsetWidth - 24*6;  // TODO compute width of children
      this.setWidth('findAnything', availableWidth);
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
  
  
  window.addEventListener('unload', anyThingBar.onUnload, false);

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