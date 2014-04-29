define([
  './object',
  './app',
  './controller',
  './view',
  './model',
  './event'
], function(
  BaseObject, 
  BaseApp,
  BaseController, 
  BaseView, 
  BaseModel, 
  BaseEvent) {

  var Vertebrae = {
    Object     : BaseObject,
    App        : BaseApp,
    Controller : BaseController,
    View       : BaseView,
    Model      : BaseModel,
    Event      : BaseEvent
  };

  return Vertebrae;
  
});