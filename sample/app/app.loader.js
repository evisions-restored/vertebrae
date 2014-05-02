define([
  'app/sample.app.controller',
  'vertebrae/view',
  './templates',
  'handlebars'
], function(
  SampleAppController,
  BaseView,
  HandlebarsTemplates
) {

  var AppLoader = {
    initialize: function(el) {
      BaseView.setupTemplates(HandlebarsTemplates);
      this.SampleAppController = new SampleAppController();
      this.SampleAppController.setupViewProperties(el);
      this.SampleAppController.start();
    }
  }

  return AppLoader;

});