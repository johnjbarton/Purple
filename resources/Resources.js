// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define([], function () {
  var thePurple = window.purple;
  var Assembly = thePurple.Assembly;

  var Resources = new thePurple.PurplePart('resources');
  
  Resources.resources = [];
  Resources.resourcesByURL = {}; // a Resource or an array of
  
  Resources.connect = function(eventSink) {
    this.eventSink = eventSink;
  };

  Resources.disconnect = function(eventSink) {
    if (this.eventSink === eventSink) {
      delete this.eventSink;
    }
  };

  Resources.append = function(url, resource) {
    this.resourcesByURL[url] = resource;
    this.resources.push(resource);
    this.eventSink.apply(null, [resource]);
    return resource;
  };

  Resources.replace = function(url, resource) {
    var index = this.resources.indexOf(resource);
    this.resources[index] = resource;
    this.resourcesByURL[url] = resource;
    this.eventSink.apply(null, [resource]);
    return resource;
  };

  Resources.get = function(url) {
    if ( this.resourcesByURL.hasOwnProperty(url) ) {
      return this.resourcesByURL[url];
    }
  };
  
  thePurple.registerPart(Resources);
  
  return Resources;
});