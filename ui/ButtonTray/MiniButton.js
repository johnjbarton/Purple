// A button with one letter or symbol
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['lib/MetaObject', 'lib/domplate/lib/domplate','lib/reps','lib/Rep', 'lib/string'], 
function(MetaObject, domplate, reps, Rep, Str){

  with(domplate.tags) {
  
    // {object: {
    //    partName: string
    //    toggleState: function returns boolean, 
    //    getSymbol: function returns character, 
    //    tooltip: string
    //    addListener:function takes function of event
    // }
  
    var MiniButton = domplate.domplate({
      tag: TD({'class':'pMiniButton', 'id':'$object|getId', 'onclick':'$object.toggleState', 'title':'$object.toolTip'}, '$object|getSymbol'),
     
      getId: function(object) {
        return object.name+"_MiniButton";
      }, 
      
      getSymbol: function(object) {
        return object.symbol;
      },
    });
     
    return MiniButton;
  };
  


});