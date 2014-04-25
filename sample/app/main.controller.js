define([
        'vertebrae/controller',
        'app/main.view'
], function(BaseController, MainView) {

  var MainController = BaseController.extend({

    routes: {
      'page1' : 'app/page1/page1.controller',
      'page2' : 'app/page2/page2.controller'
    },

    defaultRoute: '',

    properties: [
      'ContentController',
      'CurrentRoute'
    ],

    observers: {
      'window-resize' : 'resize'
    },

    initialize: function() {
      this._super.apply(this, arguments);

      window.MainController = this;
    },

    setupView: function() {
      this.setView(new MainView());
    },

    viewIsReady: function() {
      this._super.apply(this, arguments);
    },

    showContentLoading: function() {
      this.getView().showLoading();
    },

    hideContentLoading: function() {
      this.getView().hideLoading();
    },

    resize: function() {
      console.log('Window resize occured.');
    },

    start: function() {
      this.setupRoutes();
    },

    setupRoutes: function() {
      var routes  = {},
          that    = this;

      this._router = new Backbone.Router({ routes: this.routes });
    },

    routeDidFail: function() { /* Do nothing. */ },

    routeDidChange: function(route) {
      this.getHeaderController().routeDidChange(route);
      this.setCurrentRoute(route);
    },

    clearCurrentRoute: function() {
      this.setCurrentRoute(null);
    },

    canLeaveContentController: function() {
      if (!this.getContentController()) {
        return true;
      }

      return this.getContentController().canLeaveContentController();
    }

  });

  return MainController;

});