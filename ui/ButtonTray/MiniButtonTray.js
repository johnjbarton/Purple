// A button containing buttons with one letter or symbol
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['lib/Base', 'lib/domplate/lib/domplate','lib/reps','lib/Rep', 'lib/string', 'ui/ButtonTray/MiniButton'], 
function(    Base,                    domplate,      reps,      Rep,          Str,                 MiniButton){

  with(domplate.tags) {
  
    // {object: {name: string, miniButtons: [{object: {toggleState: function, getSymbol: returns character}], toolTip: string} 
    var MiniButtonTray = domplate.domplate({
      tag: TABLE({'class':'pMiniButtonTray', 'id':'$object.name', 'title':'$object.toolTip'}, 
             TBODY(
               TR(
                 FOR('miniButton', '$object|getTopMiniButtons', 
                   TAG(MiniButton.tag, {object: '$miniButton'})
                 )
               ),
               TR(
                 FOR('miniButton', '$object|getBottomMiniButtons', 
                   TAG(MiniButton.tag, {object: '$miniButton'})
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
       },
       
       setSelected: function(button, selected) {
         var elt = document.getElementById(MiniButton.getId(button));
         if (selected) {
           elt.classList.add('pSelected');
         } else {
           elt.classList.remove('pSelected');
         }
       },
       
       setDisabled: function(button, disabled) {
         var elt = document.getElementById(MiniButton.getId(button));
         if (disabled) {
           elt.classList.add('pDisabled');
         } else {
           elt.classList.remove('pDisabled');
         }
       },
       replace: function(tray) {
         var elt = document.getElementById(tray.name);
         // create a fresh view between elt and elt.nextSibling
         this.tag.insertAfter({object: tray}, elt);
         // remove the old view
         elt.parentNode.removeChild(elt);
       },
       
       addButton: function(tray, button) {
         tray.miniButtons.push(button);
         this.replace(tray);
       },
       
       removeButton: function(tray, button) {
         var index = tray.miniButtons.indexOf(button);
         if (index !== -1 ) {
           tray.miniButtons.splice(index);
         }
         this.replace(tray);
       },

    });
    
    return MiniButtonTray;
  }

});