// PurplePart to manage the boxes in the UI
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com
  
  
define(['ui/flexor', 'lib/part'], function(Flexor, PurplePart) {

  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var viewManager =  new PurplePart('viewManager');  
  
  viewManager.onload = function() {
      this.setBoxSizes();
      window.addEventListener('resize', viewManager.setBoxSizes, true);
      window.removeEventListener('load', viewManager.onload , false);
  }.bind(viewManager);
  
  window.addEventListener('load', viewManager.onload , false);

  viewManager.setBoxSizes = function() {
    var purpleRoot = window.document.getElementById('purpleRoot');
    var hboxes = Flexor.getChildernByClassName(purpleRoot, 'purpleHBox');
    Flexor.sizeHBoxes(hboxes);
  };
  
  return viewManager;
  
});
