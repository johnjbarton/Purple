// PurplePart to manage the boxes in the UI
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com
  
  
(function() {

  var thePurple = window.purple;
  var Flexor = thePurple.Flexor; 

  //------------------------------------------------------------------------------------
  // Implement PurplePart
  
  var Manager__ =  new thePurple.PurplePart();  // the __ bit just makes the method names stand out.
  
  Manager__.initialize = function() {
    this.setBoxSizes();
  };

  Manager__.connect = function() {
    window.addEventListener('resize', Manager__.setBoxSizes, true);
  };

  Manager__.disconnect = function() {
    window.removeEventListener('resize', Manager__.setBoxSizes, true);
  };
  
  Manager__.setBoxSizes = function() {
    var purpleRoot = window.document.getElementById('purpleRoot');
    var hboxes = Flexor.getChildernByClassName(purpleRoot, 'purpleHBox');
    Flexor.sizeHBoxes(hboxes);
  };
  
  thePurple.registerPart(Manager__);
  
}());
