// See Purple/license.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['../lib/domplate/lib/domplate','../resources/ResourceRep'], function (domplate, ResourceRep) {
  
  function NetworkResource(url) {
    this.url = url;
    this.rep = ResourceRep;
  }
  
  return NetworkResource;
});