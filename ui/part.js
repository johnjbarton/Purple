// Part button and events
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

(function (){

  var tStart = 0;
  
  function getPartName(elt) {
   var partName = elt.id.split('.')[0];
   return partName;
  }
  
  function tipPartByName(name) {
    var parts = document.getElementsByClassName('purplePart');
    parts.forEach(function(part) {
      part.classList.remove('tippedPurple');
      if (part.id.indexOf(name) === 0) {
        part.classList.add('tippedPurple');
      }
    });
  }
  
  function onMouseOver(event) {
    var partName = getPartName(event.target);
    tipPartByName(partName);
    
    var delta = (tStart ? event.timeStamp - tStart : 0);
    tStart = tStart || event.timeStamp;
    console.log(event.type+'@'+delta, event);
  }

  function onMouseOut(event) {
    var delta = (tStart ? event.timeStamp - tStart : 0);
    tStart = tStart || event.timeStamp;
    console.log(event.type+'@'+delta, event);
  }

  function listenToButtons() {
    var buttons = document.getElementsByClassName('purpleButton');
    for (var i = 0; i < buttons.length; i++) {
      buttons.addEventListener('mouseover', onMouseOver, false);
      buttons.addEventListener('mouseout', onMouseOut, false);
      buttons.addEventListener('mousedown', onMouseOver, false);

      buttons.addEventListener('mouseup', onMouseOver, false);
      buttons.addEventListener('click', onMouseOver, false);
    }
  }

  
  
}());