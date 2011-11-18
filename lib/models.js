// Named things you can listen for changes on
// See licence.txt for Google BSD license
// Copyright 2011 Google, Inc. johnjbarton@johnjbarton.com

define(['lib/part'], function (PurplePart) {
  var Assembly = thePurple.Assembly;
  
  var models = new PurplePart('models');

  Assembly.addPartContainer(models, true); 
  
  var model = {
    name: "model",
    events: {
      changed: function(changeInfo) {}
    },
    types: {
      ChangeInfo: {
        mutation: ['add' | 'update' | 'delete' ],
        propertyName: 'string',
        value: 'any',
        oldValue: 'any'
      }
    }
  };

  thePurple.registerPart(models); 
  
  // When we created the parts container for root we did not make it a model 
  // because models did not exist.  Now we can fix that.
  thePurple._registerPartsAsModel();
  models._registerPartsAsModel();
 
}());