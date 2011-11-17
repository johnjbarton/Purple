// Assembly: infrastructure for dispatching events
//  part of the Purple project
// Copyright 2011 Google Inc. 
// see Purple/license.txt for BSD license
// johnjbarton@google.com


// This object is needed with and without requirejs
define('lib/Assembly', ['lib/AssemblyDefined'], function() {
  return makeAssembly();
});
