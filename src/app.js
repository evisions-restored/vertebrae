define([
  './object',
  'backbone',
  'underscore',
  'jquery'
], function(BaseObject, Backbone, _, $) {

  var BaseApp = BaseObject.extend({

    properties: [
      'activeRoute',
      'controller',
      'options',
      'router'
    ],

    routes: {

    },

    defaultRoute: '',

    initialize: function(el, options) {
      this.$el = $(el);
      this.el = this.$el.get(0);
      this.setOptions(options || {});
    },

    navigate: function(url, options) {
      this.getRouter().navigate.apply(this, arguments);

      return url;
    },

    getHash: function() {
      return Backbone.history.getHash();
    },

    /**
     * Hide the current content controller
     */
    hideController: function() {

    },

    unloadController: function() {
      var controller = this.getController();

      return controller && controller.unload();
    },

    destroyController: function() {
      var controller = this.getController();

      return controller && controller.destroy();
    },

    showLoading: function() {

    },

    hideLoading: function() {

    },

    getControllerElement: function() {
      return this.$el;
    },

    getInitialRoute: function() {
      return this.defaultRoute;
    },

    getControllerPath: function(path) {
      return path;
    },

    initializeController: function(Controller) {
      var controller      = new Controller(),
          name            = controller.name || controller.contentName,
          el              = this.getControllerElement(),
          originalClasses = this._originalClasses || (this._originalClasses = el.attr('class'));

      el.empty().removeClass().addClass(originalClasses);

      if (_.isString(name)) {
        //dasherize the name
        name = name.replace(/[\s_]+/, '-');
        el.addClass(name);
      }

      if (_.isString(controller.id)) {
        el.attr('id', controller.id);
      }

      controller.setupViewProperties(el);

      return controller;
    },

    setupRoutes: function() {
      var routes = {},
          route  = null,
          router = null;

      if (!this.routes) { return this; }

      for (route in this.routes) {
        routes[route] = this.generateRouteHandler(route, this.routes[route]);
      }

      router = new Backbone.Router({ routes: routes });

      this.setRouter(router);

      return this;
    },

    canLeaveCurrentController: function() {
      return true;
    },

    generateRouteHandler: function(route, Controller) {
      var fn   = null,
          that = this;

      fn = function() {
        var controller            = null,
            d                     = null,
            args                  = arguments,
            previousRoute         = this.getActiveRoute(),
            controllerD           = $.Deferred(),
            previousRouteDeferred = $.when(previousRouteDeferred).then(null, function() { return $.Deferred().resolve(); });


        return that.currentRouteDeferred = d = $.when(that.canLeaveCurrentController())
        .then(function() {


          that.showLoading();

          // if the Controller is a string then it is a path to load the controller
          if (_.isString(Controller)) {
            require([that.getControllerPath(Controller)], function(ctor) {
              Controller = ctor;
              controllerD.resolve();
            });
          } else {
            controllerD.resolve();
          }

          return previousRouteDeferred;
        }, 
        function() {
          // if the failed route is the same as the previous route then we have an inifite fail loop....BIG problem
          if (route != previousRoute) {
            that.navigate(previousRoute);
          }

          return BaseApp.RouteErrors.CANCELLED;
        }).then(function() {

          that.setActiveRoute(route);
          that.trigger('route', route);

          return that.hideController();
        }).then(function() {

          that.showLoading();

          return $.when(that.unloadController(), controllerD);
        }).then(function() {

          return that.destroyController();
        }).then(function() {
          controller = that.initializeController(Controller);

          that.setController(controller);

          that.trigger('init:controller', controller);

          return controller.start.apply(controller, args);
        }).then(function() {

          that.trigger('start:controller', controller);

        }).always(function() {

          that.hideLoading();

        }).fail(function(reason) {

          switch (reason) {
            case BaseApp.RouteErrors.CANCELLED:
              return;
          };

          var handled = that.routeDidFail(that.getHash(), args);

          that.setActiveRoute(null);

          if (handled !== true) {
            that.navigate(previousRoute || that.defaultRoute, { trigger: true });
          }
        });

      };

      return $.proxy(fn, this);
    },

    start: function() {
      this.setupRoutes();

      if (!Backbone.history.start()) {
        this.navigate(this.getInitialRoute(), { trigger: true, replace: true });
      }
    }

  },
  {

    RouteErrors: {
      CANCELLED: 'cancelled'
    },

    launch: function(el, options) {
      var inst = new this(el, options);

      inst.start();

      return inst;
    }

  });

  return BaseApp;
});