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

      return Repo.requestAllByUser('Evisions').then(function(repos) {
        that.setRepos(repos);
      });
    },

    getTemplateProperties: function() {
      return {
        repos: this.getRepos()
      };
    }

  });

  return ReposController;
});