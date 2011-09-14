// Part button and events
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function (){

  var tLast = 0;
  
  function onMouseOver(event) {
    var delta = (tLast ? event.timeStamp - tLast : 0);
    tLast = event.timeStamp;
    console.log(event.type+'@'+delta, event);
  }

  function listenToButtons() {
    var buttons = document.getElementsByClassName('purpleButton');
    for (var i = 0; i < buttons.length; i++) {
      buttons.addEventListener('mouseover', onMouseOver, false);
      buttons.addEventListener('mouseout', onMouseOver, false);
      buttons.addEventListener('mousedown', onMouseOver, false);

      buttons.addEventListener('mouseup', onMouseOver, false);
      buttons.addEventListener('click', onMouseOver, false);
      buttons.addEventListener('mouseenter', onMouseOver, false);
      buttons.addEventListener('mouseleave', onMouseOver, false);
    }
  }

  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var partUI__ =  new thePurple.PurplePart();  // the __ bit just makes the method names stand out.
  
  partUI__.featureImplemented = function(feature) {
    if (feature.name === 'load') {
      listenToButtons();
    }
  };

  partUI__.featureUnimplemented = function(feature) {
    if (feature.name === 'load') {
    }  
  };
  
  thePurple.registerPart(partUI__);
  
}());