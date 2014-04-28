define([
  './object',
  './controller',
  './view',
  './model',
  './event'
], function(
  BaseObject, 
  BaseController, 
  BaseView, 
  BaseModel, 
  BaseEvent) {

  var Vertebrae = {
    Object     : BaseObject,
    Controller : BaseController,
    View       : BaseView,
    Model      : BaseModel,
    Event      : BaseEvent
  };

  return Vertebrae;
  
});