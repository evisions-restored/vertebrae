define([
  './src/object'
  './src/controller',
  './src/view',
  './src/model'
], function(BaseObject, Controller, View, Model) {

  return {
    BaseObject : BaseObject,
    Controller : Controller,
    View       : View,
    Model      : Model
  };
});