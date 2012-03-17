// Google BSD license http://code.google.com/google_bsd_license.html
// Copyright 2011 Google Inc. johnjbarton@google.com

/*globals define traceur*/

define(['require'],
function(require) {
  // This is a lie, the script has to be included in the .html file
  
  var defines = [];
  
  window.importScript = function(file) {
    defines.push(file);
  }
  
  var traceurjs = require('../../../compiler/traceur/trunk/src/traceur.js');
  
  console.log("traceur defines", defines);
  
  return traceur;
});
