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
        
        this.miniButtonTray = DOMPLATE.domplate({
          tag: DIV({'class':'traySpacer'},
                 FOR('trayButton', '$trayButtons', 
                   TAG("$trayButton.tag", {object: "$trayButton"})
                 )
               )
        });
        
        this.template = DOMPLATE.domplate({
          tag: DIV({'id': 'findAnythingToolbar','class':'purpleToolbar'},
            TAG(anyThingBar.miniButtonTray.tag, {trayButtons: '$preButtons'}),
            DIV({'id': 'findAnything', 'class':'omniboxLikeLeft omniboxLike omniboxLikeRight'}, 
              IMG({'id': 'findAnythingIcon', 'class':'findAnythingIcon omniboxLikeLeft', 'src':'../ui/icons/o2_http_query.png'} ),
                DIV({'id':'findAnythingBackground'},
                 INPUT({'id':'findAnythingCompletion', 'value':'.js'}),
                 DIV({'id':'findAnythingNotify'}, 'Resource and event counts here'),
                 INPUT({'id':'findAnythingInput', 'value':'.js'})
               )
             ),
             TAG(anyThingBar.miniButtonTray.tag, {trayButtons: '$postButtons'})
           ),
        });
        
      }    
    };
    
    anyThingBar.toggleEnable = function(partName) {
      var part = this.thePurple.getPartByName(partName);
      part.toggleEnable();  // promise ended in LogBase.toggleEnable
    };
    
    // returns true if we are showing, else false
    anyThingBar.toggleShow = function(partName, fnOfSelected) {
      var part = this.thePurple.getPartByName(partName);
      return part.toggleShow();
    };
    
    anyThingBar.logEnableButtonTray = {
      name: 'logEnableButtonTray',
      toolTip:"Enabled Sources", 
      miniButtons:[  // see partAdded
        // eg anyThingBar.miniButton('C', 'Enable', 'consoleLog'),
      ],
      tag: MiniButtonTray.tag,
    };
          
    anyThingBar.logFilterButtonTray = {
      name: 'logFilterButtonTray',
      toolTip:"Sources Shown", 
      miniButtons:[  // see partAdded
        // eg anyThingBar.miniButton('C', 'Enable', 'consoleLog'),
      ],
      tag: MiniButtonTray.tag,
    };
    
    anyThingBar.miniButton = function(symbol, toggle, part) {
      var button = {
          symbol: symbol,
          name: part.name+toggle,
          toggleState: function() {
            return anyThingBar['toggle'+toggle](part.name);
          },
        };
      return button;
    };
    
    // The mini buttons to the left of the search input enable/disable logging sources
    anyThingBar.enableMiniButton = function(symbol, part, filterButton) {
      var button = anyThingBar.miniButton(symbol, 'Enable', part);
      button.listener = function(event) {
        if (event.type === 'logEnable') {
          MiniButtonTray.setSelected(button, event.enabled);
          if (event.enabled) {
            MiniButtonTray.setDisabled(filterButton, false);
          } else {
            MiniButtonTray.setDisabled(filterButton, true);
          }
        }
      };
      // Listen for the async enable/disable confirmations and update the UI
      part.addListener(button.listener);
      return button;
    };
    
    // The minibuttons to the right of the search input hide or show logging source outputs
    anyThingBar.filterMiniButton = function(symbol, part) {
      var button = anyThingBar.miniButton(symbol, 'Show', part);
      button.listener = function(event) {
        if (event.type === 'logShow') {
          MiniButtonTray.setSelected(button, event.show);
        }
      };
      // Listen for the async enable/disable confirmations and update the UI
      part.addListener(button.listener);
      return button;
    };
    
    anyThingBar.partAdded = function(part) {
      if (part.hasFeature('Log')) {
        var symbol = part.name[0].toUpperCase(); // a little hacky...
        var logFilterButton = anyThingBar.filterMiniButton(symbol, part);
        MiniButtonTray.addButton(anyThingBar.logFilterButtonTray, logFilterButton);
        var partEnableButton = this.enableMiniButton(symbol, part, logFilterButton);
        MiniButtonTray.addButton(anyThingBar.logEnableButtonTray, partEnableButton);
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
        preButtons: [ anyThingBar.logEnableButtonTray ],
        postButtons: [ anyThingBar.logFilterButtonTray ],
      }, body);
      this.resize();
    };
    
    // ------------------------------------------------------------------------
    // Output
    anyThingBar.resize = function () {
      var toolbar = document.getElementById('findAnythingToolbar');
      var availableWidth = toolbar.offsetWidth;  
      var spacers = toolbar.getElementsByClassName('traySpacer');
      for (var i = 0; i < spacers.length; i++) {
        availableWidth -= spacers[i].offsetWidth;
      };
      availableWidth -= 20; // 5 padding, 4 margin, 1 padding x 2
      // leave space on either side for expanding buttons
      this.setWidth('findAnything', availableWidth);
      
      // Set the background width; it contains only position absolute elts set to width 100%
      this.setWidth('findAnythingBackground', availableWidth - 48);
    };
    
    anyThingBar.setWidth = function(id, availableWidth, left) {
      var elt =  document.getElementById(id);
      elt.style.width = availableWidth +"px";
      if (left) {
        elt.style.left = left+"px";
      }
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