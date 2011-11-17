// Set up default UI
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['browser/channelByPostMessage'], 
function(                      channel) {

var thePurple = window.purple;
channel.initialize(thePurple);
thePurple.registerPart(channel);

});