// PurplePart to manage the boxes in the UI
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com
  
  
(function() {

  var thePurple = window.purple;
  var Flexor = thePurple.Flexor; 

  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var viewManager =  new thePurple.PurplePart('viewManager');  // the __ bit just makes the method names stand out.
  
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
  
  thePurple.registerPart(viewManager);
  
}());
