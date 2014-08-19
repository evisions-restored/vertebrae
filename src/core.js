define([
  './object',
  './controller',
  './view',
  './model',
  './event',
  './app',
  './validator',
  './stringutils',
  './utils'
], function(
  BaseObject, 
  BaseController, 
  BaseView, 
  BaseModel, 
  BaseEvent,
  BaseApp,
  Validator,
  StringUtils,
  Utils) {

  var Vertebrae = {
    Object     : BaseObject,
    App        : BaseApp,
    Controller : BaseController,
    View       : BaseView,
    Model      : BaseModel,
    Event      : BaseEvent,
    String     : StringUtils,
    Utils      : Utils,
    Validator  : Validator,
    version    : '@VERSION'
  };

  return Vertebrae;
  
});