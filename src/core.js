define([
  './object',
  './controller',
  './view',
  './model',
  './event',
  './application/app'
], function(
  BaseObject, 
  BaseController, 
  BaseView, 
  BaseModel, 
  BaseEvent,
  BaseApp) {

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