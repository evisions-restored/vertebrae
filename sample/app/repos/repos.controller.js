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
      return this.setRepos(Repo.requestAllByUser('Evisions'), { promise: true });
    },

    getTemplateProperties: function() {
      return this.pick('repos');
    }

  });

  return ReposController;
});