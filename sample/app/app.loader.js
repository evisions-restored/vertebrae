define([
  'vertebrae/view',
  'app/sample.app.controller',
  './templates',
  'handlebars'
], function(
  BaseView,
  SampleAppController,
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