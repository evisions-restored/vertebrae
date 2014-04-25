define([
        'jquery',
        'vertebrae/object',
        'app/main.controller'
], function(
        $,
        BaseObject,
        MainController) {

  var MainApp = BaseObject.extend({

    initialize: function(el) {
      this.el = el;
      this.$el = $(el);

      this.MainController = new MainController;
      this.MainController.setupViewProperties(this.$el);
      this.MainController.start();
    }

  });

  return MainApp;

});