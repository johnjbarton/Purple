// A button with one letter or symbol
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

define(['lib/Base', 'lib/domplate/lib/domplate','lib/reps','lib/Rep', 'lib/string'], 
function(Base, domplate, reps, Rep, Str){

  with(domplate.tags) {
  
    // {object: {
    //    partName: string
    //    toggleState: function returns boolean, 
    //    getSymbol: function returns character, 
    //    tooltip: string
    //    addListener:function takes function of event
    // }
  
    var MiniButton = domplate.domplate({
      tag: TD({'class':'pMiniButton', 'id':'$object|getId', 'onclick':'$object|setOnClick', 'title':'$object.toolTip'}, '$object|getSymbol'),
      // called when the domplate is expanded
      setOnClick: function(object) {
        this.setState = this.setState.bind(this, object);
        object.addListener(this.setState);
        
        return function toggleState(event) {
          var elt = event.currentTarget;
          object.toggleState();
        }
      },
     
      getId: function(object) {
        return object.partName+"_MiniButton";
      }, 
      
      getSymbol: function(object) {
        return object.symbol;
      },
      
      setState: function(object, event) {
        if (event.type === 'enable') {
          var elt = document.getElementById(this.getId(object));
          if (event.enabled) {
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