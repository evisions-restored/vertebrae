define([
  'vertebrae/app',
  'vertebrae/view',
  './templates'
], function(BaseApp, BaseView, HandlebarTemplates) {
  
  BaseView.setupTemplates(HandlebarTemplates);

  var SampleApp = BaseApp.extend({

    content: '#content',

    defaultRoute: 'page1',

    template: 'app.init',

    routes: {
      'page1' : 'app/page1/page1.controller',
      'page2' : 'app/page2/page2.controller'
    },

    controllers: {
    },

    initialize: function() {
      this._super.apply(this, arguments);
      window.App = this;
    }

  });

  return SampleApp;

});