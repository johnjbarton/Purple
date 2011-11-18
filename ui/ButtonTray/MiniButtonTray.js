// A button containing buttons with one letter or symbol
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['lib/Base', 'lib/domplate/lib/domplate','lib/reps','lib/Rep', 'lib/string', 'ui/ButtonTray/MiniButton'], 
function(Base, domplate, reps, Rep, Str, MiniButton){

  with(domplate.tags) {
  
    // {object: {miniButtons: [{object: {toggleState: function, getSymbol: returns character}], toolTip: string} 
    var MiniButtonTray = domplate.domplate({
      tag: TABLE({'class':'pMiniButtonTray', 'title':'$object.toolTip'}, 
             TBODY(
               TR(
                 FOR('miniButton', '$object|getTopMiniButtons', 
                   TAG(MiniButton.tag, {object: '$miniButton.object'})
                 )
               ),
               TR(
                 FOR('miniButton', '$object|getBottomMiniButtons', 
                   TAG(MiniButton.tag, {object: '$miniButton.object'})
                 )
               )
             )
           ),
       getTopMiniButtons: function(object) {
         var buttons = object.miniButtons;
         return buttons.slice(0, Math.ceil(buttons.length/2));
       },
       getBottomMiniButtons: function(object) {
         var buttons = object.miniButtons;
         return buttons.slice(Math.ceil(buttons.length/2));
       }

    });
    
    return MiniButtonTray;
  }

});