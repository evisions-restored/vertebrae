/**
 * @namespace Vertebrae
 */
define([
  'jquery',
  'backbone',
  'underscore',
  './object'
], function(
  $,
  Backbone,
  _,
  BaseObject) {

  /**
   * Base app object to extend an applications main file.
   *
   * @name BaseApp
   *
   * @class BaseApp
   *
   * @memberOf Vertebrae
   *
   * @augments {Vertebrae.BaseController}
   */
  var BaseApp = BaseObject.extend({

    /**
     * Base properties container.
     * 
     * @type {Array}
     */
    properties: [
      'activeRoute',
      'controller',
      'options',
      'router'
    ],

    /**
     * The routes container used for mapping routes to controllers.
     * This should be overwritten in your main app file.
     * 
     * @type {Object}
     */
    routes: { },

    /**
     * The controller container us for mapping static controllers to elements
     * @type {Object}
     */
    controllers: { },

    /**
     * The default route for your application.
     * This should be overwritten in your main app file.
     * 
     * @type {String}
     */
    defaultRoute: '',

    /**
     * Constructor
     *
     * @function
     *
     * @instance
     *
     * @param  {Object} el      The element we are using to create our application.
     * @param  {Object} options The options object we are using within our application.
     */
    initialize: function(el, options) {
      this._super.apply(this,arguments);
      
      this.$el = $(el);
      this.el = this.$el.get(0);
      this.setOptions(options || {});

      this.initializeControllerMappings();
    },

    initializeControllerMappings: function() {
      var map = null,
          len = this.controllerMappings ? this.controllerMappings.length : 0,
          i   = 0;

      for (i = 0; i < len; ++i) {
        map = this.controllerMappings[i];
        this.setter(map.name, new map.controller(this));
      }
    },

    setupControllerMappings: function() {
      var map        = null,
          d          = $.when(),
          controller = null,
          len        = this.controllerMappings ? this.controllerMappings.length : 0,
          i          = 0;

      for (i = 0; i < len; ++i) {
        map = this.controllerMappings[i];
        controller = this.getter(map.name);

        controller.setupViewProperties(this.$(map.selector));
        if (controller.start) {
          d = $.when(d, controller.start());
        }
      }

      return d;
    },

    /**
     * Navigate the app to a different url.
     * 
     * @function
     *
     * @instance
     *
     * @param  {String} url     The url we want our application to route to.
     * @param  {Object} options The options we want to pass to the new route.
     * 
     * @return {String}
     */
    navigate: function(url, options) {
      this.getRouter().navigate.apply(this, arguments);

      return url;
    },

    /**
     * Getting the current url hash of our application.
     * 
     * @function
     *
     * @instance
     *
     * @return {Object}
     */
    getHash: function() {
      return Backbone.history.getHash();
    },

    /**
     * Hide the current content controller.
     * This should be overwritten in your main app file.
     * 
     * @function
     *
     * @instance
     */
    hideController: function() { },

    /**
     * Unload the current content controller.
     *
     * @function
     *
     * @instance
     * 
     * @return {Boolean}
     */
    unloadController: function() {
      var controller = this.getController();

      return controller && controller.unload();
    },

    /**
     * Destroy the current content controller.
     * 
     * @function
     *
     * @instance
     * 
     * @return {Boolean}
     */
    destroyController: function() {
      var controller = this.getController();

      return controller && controller.destroy();
    },

    /**
     * Show the user a loading message when content is being loaded into the app.
     * This is usually called when making API calls to change content on a view.
     * This should be overwritten in your main app file.
     *
     * @function
     *
     * @instance
     */
    showLoading: function() { },

    /**
     * Hide the loading message.
     * This should be overwritten in your main app file.
     *
     * @function
     *
     * @instance
     */
    hideLoading: function() { },

    /**
     * Getting the element the main app controller is attached to.
     *
     * @function
     *
     * @instance
     * 
     * @return {Object}
     */
    getContentElement: function() {
      if (this.content) {

        return this.$(this.content);
      } else if (this.controllerMappings.length == 0) {

        return this.$el;
      }

      throw new Error('You must specific the "content" property when using the "controllers" property.');
    },

    /**
     * Copy over the $ function from Backbone View to App
     */
    $: Backbone.View.prototype.$,

    /**
     * Getting the initial/default route for the app.
     *
     * @function
     *
     * @instance
     * 
     * @return {String}
     */
    getInitialRoute: function() {
      return this.defaultRoute;
    },

    /**
     * Getting the controller path.
     *
     * @function
     *
     * @instance
     * 
     * @param  {String} path
     * 
     * @return {String}
     */
    getControllerPath: function(path) {
      return path;
    },

    /**
     * Initializing the app controller.
     *
     * @function
     *
     * @instance
     * 
     * @param  {Object} Controller
     * 
     * @return {Object}
     */
    initializeController: function(Controller) {
      var controller      = new Controller(),
          name            = controller.name || controller.contentName,
          el              = this.getContentElement(),
          originalClasses = this._originalClasses || (this._originalClasses = (el.attr('class') || ' '));

      el.empty().removeClass().addClass(originalClasses);

      // Adding a class to the container element based on the controller name.
      if (_.isString(name)) {
        name = name.replace(/[\s_]+/g, '-');
        el.addClass(name);
      }
      // Adding an ID attribute to the container elements based on the controller ID.
      if (_.isString(controller.id)) {
        el.attr('id', controller.id);
      }

      controller.setupViewProperties(el);

      return controller;
    },

    /**
     * Setting up the app routes.
     * These are defined in the routes property.
     *
     * @function
     *
     * @instance
     * 
     * @return {Object}
     */
    setupRoutes: function() {
      var routes = {},
          route  = null,
          router = null;

      if (!this.routes) { 
        return this; 
      }

      for (route in this.routes) {
        routes[route] = this.generateRouteHandler(route, this.routes[route]);
      }

      router = new Backbone.Router({ routes: routes });

      this.setRouter(router);

      return this;
    },

    /**
     * Can the user leave the current controller?
     * This should be overwritten in your main app file.
     *
     * @function
     *
     * @instance
     * 
     * @return {Boolean}
     */
    canLeaveCurrentController: function() {
      return true;
    },

    /**
     * Generating the route handler for each of the defined routes.
     *
     * @function
     *
     * @instance
     * 
     * @param  {String}         route      
     * @param  {String|Object}  Controller
     * 
     * @return {Object}
     */
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

          // If the Controller is a string then it is a path to load the controller.
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
          // If the failed route is the same as the previous route then we have an inifite fail loop.
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
          
          if (controller.start) {

            return controller.start.apply(controller, args);
          }
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

    /**
     * Starting the application.
     * This could be overwritten in your main app file. If it is, make sure to call setupRoutes()
     * or call this function by using this._super();
     *
     * @function
     *
     * @instance
     */
    start: function() {
      // render the app skeleton
      this.render();

      // setup the controller mappings
      var d = this.setupControllerMappings();

      // setup the dynamic controller routes
      this.setupRoutes();

      if (!Backbone.history.start()) {
        this.navigate(this.getInitialRoute(), { trigger: true, replace: true });
      }

      return d;
    },

    render: function() {
      if (_.isString(this.template)) {
        this.$el.html(BaseView.template(this.template, this.getOptions()));
      } else if (_.isFunction(this.template)) {
        this.$el.html(this.template(this.getOptions()));
      }

      return this;
    }

  },
  {

    /**
     * Only used when routing fails and we need to cancel the routing process.
     * 
     * @type {Object}
     */
    RouteErrors: {
      CANCELLED: 'cancelled'
    },

    /**
     * Launching an application instance.
     *
     * @function
     *
     * @static
     * 
     * @param  {Object} el      The element we are using to create our application.
     * @param  {Object} options The options object we are using within our application.
     * 
     * @return {Object}
     */
    launch: function(el, options) {
      var inst = new this(el, options);

      inst.start();

      return inst;
    }

  });
  
  BaseApp.extend = function(proto) {
    proto.controllerMappings = _.isArray(proto.controllerMappings) ? proto.controllerMappings : [];
    proto.properties = _.isArray(proto.properties) ? proto.properties : [];

    // parse and copy over the information from proto.controllers to proto.controllerMappings
    _.each(proto.controllers, function(Controller, map) {
      var sections = map.split(/\s+/),
          name     = sections[0],
          selector = sections.slice(1).join('');

      if (name && selector) {
        proto.controllerMappings.push({
          selector   : selector,
          name       : name,
          controller : Controller
        });
      }

    });

    // Create gettes and setters for the controllers by putting them in the properties array
    _.each(proto.controllerMappings, function(item) {
      proto.properties.push(item.name);
    });

    // Copy over any existing controller mappings onto the proto controllerMappings
    if (_.isArray(this.prototype.controllerMappings)) {
      proto.controllerMappings = [].concat(this.prototype.controllerMappings, proto.controllerMappings);
    }

    return BaseObject.extend.apply(this, arguments);
  };

  return BaseApp;
});