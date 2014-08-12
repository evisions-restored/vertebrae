define([
  'vertebrae',
  'models/user',
  './header/header.controller',
  './repos/repos.controller',
  'handlebars',
  'underscore',
  './templates'
], function(
  Vertebrae,
  User,
  HeaderController,
  ReposController,
  Handlebars,
  _,
  HandlebarTemplates
) {
  
  Vertebrae.View.setupTemplates(HandlebarTemplates);

  _.each(HandlebarTemplates, function(fn, name) {
    Handlebars.registerPartial(name, fn);
  });

  var SampleApp = Vertebrae.App.extend({

    properties: [
      'user'
    ],

    content: '#content',

    defaultRoute: 'page1',

    template: 'app.init',

    routes: {
      'page1' : 'app/page1/page1.controller',
      'page2' : 'app/page2/page2.controller',
      'repos' : ReposController
    },

    controllers: {
      'header #header': HeaderController
    },

    initialize: function() {
      this.setUser(User.model({ email: 'vertebrae@evisions.com', name: 'Vertebrae Jones' }));
      this.listenTo(this, 'change:contentController', this.controllerDidChange);
      this._super.apply(this, arguments);
      window.App = this;
    },

    controllerDidChange: function() {
      var controller = this.getContentController();
      this.setActiveLinkByName(controller.name);
    },

    setActiveLinkByName: function(name) {
      var links = this.$('.side-bar a');

      links.removeClass('active');

      links.filter('[href="#' + name + '"]').addClass('active');
    }

  });

  return SampleApp;
});