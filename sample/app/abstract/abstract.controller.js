define([
  'vertebrae/controller' 
], function(BaseController) {

  var AbstractController = BaseController.extend({

    properties: [
      'app'
    ],

    initialize: function(app) {
      this.setApp(app);
      this._super();
    },

    getUser: function() {
      return this.getApp().getUser();
    }

  });

  return AbstractController;
});