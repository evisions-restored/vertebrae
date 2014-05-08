define([
  'vertebrae' 
], function(Vertebrae) {

  var AbstractController = Vertebrae.Controller.extend({

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