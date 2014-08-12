/**
 * @namespace Vertebrae
 */
define([
  'jquery',
  'backbone',
  'underscore',
  'bluebird',
  './object',
  './view',
  './utils'
], function(
  $,
  Backbone,
  _,
  Promise,
  BaseObject,
  BaseView,
  Utils) {

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
      'currentRoute',
      'contentController',
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
     * The event listener function mapping
     * @type {Object}
     */
    events: {
      'start': 'routing'
    },

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
      Utils.setupInstanceEvents(this);
      Utils.setupInstanceObserves(this);

      this.$el = $(el);
      this.el = this.$el.get(0);
      this.setOptions(options || {});

      this.initializeControllerMappings();
      
      if (_.isFunction(this.handleAppErrors)) {
        Promise.onPossiblyUnhandledRejection(_.bind(this.handleAppErrors, this));
      }
      this._super.apply(this,arguments);
    },

    /**
     * Loops through the controller mappings and initialize all the controller instances
     */
    initializeControllerMappings: function() {
      var map        = null,
          len        = this.controllerMappings ? this.controllerMappings.length : 0,
          mappings   = [],
          i          = 0;

      for (i = 0; i < len; ++i) {
        map = _.clone(this.controllerMappings[i]);
        map.instance = new map.controller(this);
        if (map.name) {
          this[map.name] = map.instance;
        }
        mappings.push(map);
      }

      this.controllerMappings = mappings;

      return this;
    },

    /**
     * Loops through the controller mappings and sets them up with an element
     */
    setupControllerMappings: function() {
      var map        = null,
          promise    = Promise.resolve(),
          controller = null,
          len        = this.controllerMappings ? this.controllerMappings.length : 0,
          i          = 0;

      for (i = 0; i < len; ++i) {
        map = this.controllerMappings[i];
        controller = map.instance;

        controller.setup(this.$(map.selector));
        if (controller.start) {
          promise = Promise.join(promise, controller.start());
        }
      }

      return promise;
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
     * Destroy the current content controller.
     * 
     * @function
     *
     * @instance
     * 
     * @return {Boolean}
     */
    destroyContentController: function() {
      var controller = this.getContentController();

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
    initializeContentController: function(Controller) {
      var controller      = new Controller(this),
          el              = this.getContentElement(),
          originalClasses = this._originalClasses || (this._originalClasses = (el.attr('class') || ' '));

      el.empty().removeClass().addClass(originalClasses);

      // Adding a class to the container element based on the controller name.
      if (_.isString(controller.name)) {
        el.addClass(controller.name.replace(/[\s_]+/g, '-'));
      }
      if (_.isString(controller.contentName)) {
        el.addClass(controller.contentName)
      }
      if (_.isString(controller.className)) {
        el.addClass(controller.className);
      }
      // Adding an ID attribute to the container elements based on the controller ID.
      if (_.isString(controller.id)) {
        el.attr('id', controller.id);
      }

      this.setContentController(controller);

      controller.setup(el);

      return controller;
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
    canLeaveContentController: function() {
      return true;
    },

    canSetupController: function(Controller) {
      return true;
    },

    clearCurrentRoute: function() {
      this.setCurrentRoute(null);
    },

    /**
     * This function initializes route based off the 'routes' object that is stored on the
     * app controller.  The routes are loaded with support for layers, so the javascript that is
     * needed to display the content for a specific route will only be loaded when that route is
     * requested (build only)
     */
    setupRoutes: function() {
      var routes = {};

      // Figure out the mapping from routes to controllers
      _.each(this.routes, function(controllerPath, route) {
        // Set a route on the routes object to be passed into Backbone.Router
        routes[route] = function() {
          var controller            = null,
              // if there are route params, they will be stored in arguments
              routeArgs             = arguments,
              previousRoute         = this.getCurrentRoute() || this.defaultRoute,
              previousRouteDeferred = this.currentRouteDeferred,
              layerDeferred         = Promise.defer(),
              hideLoading           = function() {},
              controllerConstructor = null;
          
          return this.currentRouteDeferred = Promise
            .resolve(this.canLeaveContentController())
            .bind(this)
            .then(function() {
              //Yes, we can leave the page
              this.routeDidChange(this.getHash());
              // Show content loading!!
              hideLoading = this.showLoading();

              if (_.isString(controllerPath)) {
                require([this.getControllerPath(controllerPath)], function(ctor) {
                  controllerConstructor = ctor;
                  layerDeferred.resolve();
                });
              } else {
                controllerConstructor = controllerPath
                layerDeferred.resolve();
              }

            })
            .then(this.slideOutContentController)
            .caught(BaseApp.Errors.NavigationCancelled, function(err) {
              //No, dont leave the page, stay on the current one.
              this.navigate(previousRoute);
              throw err;
            })
            .tap(function() { 
              // if the previous route has failed then we just want know when but do not
              // affect this chain at all
              return new Promise(function(resolve) {
                Promise.resolve(previousRouteDeferred).lastly(resolve);
              });
            })
            .then(function() {

              return layerDeferred.promise;
            })
            .then(function() {

              // If unload returned a deferred then we need to wait for this to finish
              return this.destroyContentController();
            })
            .then(function() {

              if (!this.canSetupController(controllerConstructor)) {
                throw new BaseApp.Errors.CannotRoute();
              }

              controller = this.initializeContentController(controllerConstructor);
              this.trigger('content-controller-init', controller);
              return _.isFunction(controller.start) && controller.start.apply(controller, routeArgs);
            })
            .then(function() {
              if (controller.hasSetter('started')) {
                controller.setStarted(true);
              } else {
                controller.set('started', true);
              }
              controller.trigger('data:ready');
              this.trigger('start:contentController', controller);
              this.getContentElement().addClass('in');
            })
            .lastly(function() {
              _.isFunction(hideLoading) && hideLoading();
            })
            .caught(function(error) {
              if (!(error instanceof BaseApp.Errors.NavigationCancelled)) {
                var handled = this.routeDidFail(this.getHash(), routeArgs);

                this.clearCurrentRoute();

                if (handled !== true) {
                  this.navigate(previousRoute, { trigger: true });
                }

                throw error;
              }
            });


        };

        routes[route] = _.bind(routes[route], this);

      }, this);

      this.setRouter(new Backbone.Router({ routes: routes }));

      return this;
    },
    
    routeDidChange: function(route) {
      this.setCurrentRoute(route);
    },

    routeDidFail: function() {

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
      var promise = this.setupControllerMappings();

      this.trigger('start');

      return promise;
    },

    routing: function(hash) {
      // setup the dynamic controller routes
      this.setupRoutes();
      if (!Backbone.history.start()) {
        this.navigate(hash || this.getInitialRoute(), { trigger: true, replace: true });
      }
    },

    render: function() {
      if (_.isString(this.template)) {
        this.$el.html(BaseView.template(this.template, this.getOptions()));
      } else if (_.isFunction(this.template)) {
        this.$el.html(this.template(this.getOptions()));
      }

      return this;
    },

    // handleAppErrors: function(reason, promise) {
    // }

  },
  {

    /**
     * Only used when routing fails and we need to cancel the routing process.
     * 
     * @type {Object}
     */
    Errors: {
      NavigationCancelled: Backbone.View.extend.call(Error, {  }),
      CannotRoute: Backbone.View.extend.call(Error, {  })
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
    },

    start: function(el, options) {
      return this.launch.apply(this, arguments);
    }

  });
  
  BaseApp.extend = function(proto) {
    var mappings = _.isArray(proto.controllerMappings) ? proto.controllerMappings : [];

    // parse and copy over the information from proto.controllers to proto.controllerMappings
    _.each(proto.controllers, function(Controller, map) {
      var sections = String(map).trim().split(/\s+/),
          name     = sections.length > 1 ? sections[0] : null,
          selector = name ? sections.slice(1).join('') : sections.join('');

      if (name && selector) {
        mappings.push({
          selector   : selector,
          name       : name,
          controller : Controller
        });
      }

    });

    proto.controllerMappings = mappings;

    // copy/merge the events object
    Utils.mergeClassProperty(proto, this.prototype, 'events');
    Utils.mergeClassProperty(proto, this.prototype, 'observes');
    Utils.mergeClassProperty(proto, this.prototype, 'routes');

    // Copy over any existing controller mappings onto the proto controllerMappings
    Utils.mergeClassProperty(proto, this.prototype, 'controllerMappings');

    return BaseObject.extend.apply(this, arguments);
  };

  return BaseApp;
});