// A button with one letter or symbol
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['lib/Base', 'lib/domplate/lib/domplate','lib/reps','lib/Rep', 'lib/string'], 
function(Base, domplate, reps, Rep, Str){

  with(domplate.tags) {
  
    // {object: {toggleState: function returns boolean, getSymbol: function returns character, tooltip: string}
  
    var MiniButton = domplate.domplate({
      tag: TD({'class':'pMiniButton', 'onclick': '$object|setOnClick', 'title':'$object.toolTip'}, '$object.symbol'),
      // called with the domplate is expanded
      setOnClick:function(object) {
      console.log("setOnClick called with object ", object);
        return function toggleState(event) {
          var elt = event.currentTarget;
          var selected = object.toggleState();
          if (selected) {
            elt.classList.add('pSelected');
          } else {
            elt.classlist.remove('pSelected');
          }
        }
      },
    });
    
    return MiniButton;
  };
  


});