define([
  './object'
  './controller',
  './view',
  './model'
], function(BaseObject, Controller, View, Model) {

  return {
    BaseObject: BaseObject,
    Controller: Controller,
    View: View,
    Model: Model
  };
});