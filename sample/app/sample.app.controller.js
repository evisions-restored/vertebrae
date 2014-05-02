define([
  'vertebrae/app',
  'app/sample.app.view'
], function(BaseApp, MainView) {

  var SampleAppController = BaseApp.extend({

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

      window.AppController = this;
    },

    setupView: function() {
      this.setView(new MainView());
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

    // start: function() {
    //   this.setupRoutes();
    // },

    // setupRoutes: function() {
    //   var routes  = {},
    //       that    = this;

    //   _.each(this.routes, function(controllerPath, route) {
    //     routes[route] = function() {
    //       var controller            = null,
    //           controllerConstructor = null,
    //           routesArgs            = arguments,
    //           previousRoute         = that.getCurrentRoute(),
    //           previousRouteDeferred = that.currentRouteDeferred;

    //       return that.currentRouteDeferred = $.when(that.canLeaveContentController())
    //         .then(function() {
    //           that.routeDidChange(that.getHash());
    //         }, function() {
    //           that.navigate(previousRoute);

    //           return 'cancelled';
    //         }).always(function() {
    //           that.hideContentLoading();
    //         }).fail(function(cancelled) {
    //           if (cancelled == "cancelled") {
    //             return;
    //           }

    //           var handled = that.routeDidFail(that.getHash(), routeArgs);

    //           that.clearCurrentRoute();
    //           if (handled !== true) {
    //             that.navigate(previousRoute || that.defaultRoute, { trigger: true });
    //           }
    //         });
    //     }
    //   });

    //   this._router = new Backbone.Router({ routes: routes });
    // },

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
    },

    getControllerElement: function() {
      return this.getView().getContentElement()
    },

  });

  return SampleAppController;

});