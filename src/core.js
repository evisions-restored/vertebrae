define([
  './object',
  './controller',
  './view',
  './model',
  './event',
  './app',
  './validator'
], function(
  BaseObject, 
  BaseController, 
  BaseView, 
  BaseModel, 
  BaseEvent,
  BaseApp,
  Validator) {

  var Vertebrae = {
    Object     : BaseObject,
    App        : BaseApp,
    Controller : BaseController,
    View       : BaseView,
    Model      : BaseModel,
    Event      : BaseEvent,
    Validator  : Validator
  };

  return Vertebrae;
  
});