define(['evisions/object', 'backbone', 'evisions/history'], function(EVIObject, Backbone, History) {
  var Router = Backbone.Router;

  /**
   * @class
   * @memberOf Evisions
   * @augments {Evisions.EVIObject}
   */
  var EVIRouter = EVIObject.extend(/** @lends  Evisions.EVIRouter */{

    /**
     * @function
     * @instance
     * 
     * @param  {Object} options Options to pass into the router
     * 
     * @return {None}         
     */
    initialize: function(options) {
      options || (options = {});
      if (options.routes) {
        this.routes = options.routes;
      }
      this._bindRoutes();
      this._super();
    },

    /**
     * Navigate to a specific uri
     *
     * @function
     * @instance
     * 
     * @return {Evisions.EVIRouter}
     */
    navigate: function() {
      History.navigate.apply(History, arguments);
      return this;
    },

    /**
     * Add a route to the router
     *
     * @function
     * @instance
     * 
     * @param  {String}   route    [description]
     * @param  {String}   name    
     * @param  {Function} callback Optional callback
     * 
     * @return {Evisions.EVIRouter}
     */
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) { route = this._routeToRegExp(route); }
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) { callback = this[name]; }
      var router = this;
      History.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        callback && callback.apply(router, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        History.trigger('route', router, name, args);
      });
      return this;
    },

    /**
     * @function
     * @instance
     * @private
     */
    _bindRoutes: Router.prototype._bindRoutes,

    /**
     * @function
     * @instance
     * @private
     */
    _routeToRegExp: Router.prototype._routeToRegExp,

    /**
     * @function
     * @instance
     * @private
     */
    _extractParameters: Router.prototype._extractParameters

  });

  return EVIRouter;
});