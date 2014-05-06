define([
  '../abstract/abstract.controller',
  './repos.view',
  'models/repo'
], function(AbstractController, ReposView, Repo) {

  var ReposController = AbstractController.extend({

    name: 'repos',

    view: ReposView,

    properties: [
      'repos'
    ],

    events: {
      'view:ready': null,
      'data:ready': 'render'
    },

    start: function() {
      var that = this;

      return this.set('repos', Repo.requestAllByUser('Evisions'), { deferred: true });
    },

    getTemplateProperties: function() {

      return this.pick('repos');
    }

  });

  return ReposController;
});