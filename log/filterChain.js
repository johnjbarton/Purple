// Purple side of the message channel for browser events
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


define(['../lib/q/q'], function(Q) {

  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;

  var filterChain = new thePurple.PurplePart('filterChain');
  
  Assembly.addPartContainer(filterChain);
  
  filterChain.connect = function(viewport) {
    this.viewport = viewport;
    this.onMatch = this.recv.bind(this);
  };
  
  // incoming match
  filterChain.recv = function(obj) {
    this.viewport.recv(obj);
  };
  
  // Push matches to viewport
  filterChain.update = function(constraints) {
    this.viewport.clear(); 
    this.toEachPart('filter', [constraints, this.onMatch]);
  };

});