// A Purple Rep is a view/controller for an object; Reps lists all for lookup
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com


define([], function() {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;

  var Reps = new thePurple.PurplePart('Reps');
  Assembly.addPartContainer(Reps);

  // visit each rep and record the property names that objects must have to match the rep
  Reps.rehash = function() {
    var byName = this.repsByPropertyName = {};
    var noReqs = this.repsWithNoReqNames = [];
    this.forEachPart(function gather(rep) {
      var reqed = rep.getRequiredPropertyNames();
      if (reqed.length) {
        reqed.forEach(function register(name) {
          byName[name] = byName[name] || [];
          byName[name].push(rep);
        });
      } else { // no required names
        noReqs.push(rep);
      }
    });
  };

  // shape test the object against the reps to find the best match
  Reps.getRepByObject = function(object) {
    if (typeof object === 'object' || typeof object === 'function') {
      var reps = this.repsWithNoReqNames.slice(0);
      var names = Object.keys(this.repsByPropertyName);
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        if (object.hasOwnProperty(name)) {
          reps.push(this.repsByPropertyName[name]);
        }
      }
      var best = 0;
      var bestRep;
      for(var j = 0; j < reps.length; j++) {
        var candidate = reps[j];
        var noob = candidate.represents(object);
        if (best < noob) {
          best = noob;
          bestRep = candidate;
        } 
      }
      return bestRep;
    }
    return Reps.primitiveRep;
  };
    
  //thePurple.registerPart(Reps);
  
  return Reps;
});