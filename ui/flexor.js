// Box sizing in JavaScript
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com

(function (){

var thePurple = window.purple;

var Flexor = thePurple.Flexor = {};

Flexor.getChildernByClassName = function(parentBox, classname) {
  var hboxes = [];
  parentBox.childNodes.forEach(function (child) {
    if (child.classList && child.classList.contains(classname)) {
      hboxes.push(child);
    }
  });
  return hboxes;
};

Flexor.sizeHBoxes = function(boxes) {
  if (!boxes.length) {
    return;
  }
  var flexibles = this.flexibleBoxes(boxes);
  var remainingHeight = this.remainingHeight(boxes);
  if (remainingHeight <= 0) {
    thePurple.error("Purple.Flexor: no remaining height");
    return;
  }
  var remainder = 0;
  flexibles.forEach(function convertToHeight(box) {
    var flexible = parseInt(box.dataset.flexible);
    var floatingHeight = remainingHeight * (flexible / flexibles.totalFlexible) + remainder;
    var height = Math.floor(floatingHeight);
    remainder = floatingHeight - height;
    box.style.height = height+"px";
  });
};

// return an array of boxes all having valid, non-zero data-flexible attributes
Flexor.flexibleBoxes = function(boxes) {
  var flexibles = [];
  flexibles.totalFlexible = 0;
  boxes.forEach(function gatherFlexible(box) {
    var flexibleString = box.dataset.flexible;
    if (flexibleString) {
      var flexible = parseInt(flexibleString);
      if (!flexible) {
        thePurple.error("Purple.Flexor: invalid flexible value "+flexibleString, box);
        box.removeAttribute('data-flexible');
        return;
      }
      flexibles.push(box);
      flexibles.totalFlexible += flexible;
    }
  });
  
  if (flexibles.length) {
    if (!flexibles.totalFlexible) {
      thePurple.error("Purple.Flexor: no valid flexible values", flexibles);
      return [];
    }
  } 
  return flexibles;
};

// return the parent height minus all of the inflexible box heights
Flexor.remainingHeight = function(boxes) {
  var remainingHeight = boxes[0].parentNode.getBoundingClientRect().height;
  boxes.forEach(function decrement(box) {
    if (!box.dataset.flexible) {
      remainingHeight -= box.getBoundingClientRect().height;
    }
  });
  return remainingHeight;
};

return Flexor;
}());