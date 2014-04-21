/**
 * @namespace Evisions
 */
define([
  'evisions/object',
  'jquery',
  'underscore',
  'cookie'
], function(EVIObject, $, _) {

  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  /**
   * Base Model Class for All Project Models
   *
   * @name EVIModel
   *
   * @class EVIModel
   *
   * @memberOf Evisions
   *
   * @augments {Evisions.EVIObject}
   */
  var EVIModel = EVIObject.extend(/** @lends  Evisions.EVIModel */{

    /**
     * Setup the object
     *
     * @function
     *
     * @instance
     *
     * @param  {Object} props Properties to apply to the model.
     */
    initialize: function(props) {
      this.applyProperties(props);
      return this._super();
    },

    /**
     * Update this model with the properties from another model.
     *
     * @function
     *
     * @instance
     *
     * @param  {Evisions.EVIModel} model
     *
     * @return {Evisions.EVIModel}
     */
    updateWith: function(model) {
      this.applyProperties(model.getProperties());
      return this;
    },

    when: function() {
      
      return $.when.apply($, arguments);
    },

    toJSON: function() {
      var properties = {};
      if (this.serverProperties && this.serverProperties.length) {
        properties = _.pick(this, this.serverProperties);
      }
      return properties;
    }

  },
  /** @lends  Evisions.EVIModel */
  {

    /**
     * @description The specific parsers used for handling the model's API response.
     *
     * @type {Object}
     */
    parsers: {

    },

    /**
     * @description The root of all URI calls from this model.
     *
     * @type {String}
     */
    rootURI: '/',

    /**
     * If no parser is specified for a request, then we use this default handler
     *
     * @function
     *
     * @static
     *
     * @param  {Object} data
     *
     * @return {Object}
     */
    defaultHandler: function(data) {
      return data;
    },

    /**
     * Getting a new instance of the passed model.
     *
     * @function
     *
     * @instance
     *
     * @param  {Object} data The model you would like to instance.
     *
     * @return {Object}
     */
    model: function(data) {
      return new this(data);
    },

    /**
     * Getting an array of new model instances based of the array of model passed.
     *
     * @function
     *
     * @instance
     *
     * @param  {Array} arr An array of models to instance.
     *
     * @return {Array}
     */
    models: function(arr) {
      var modelArray  = [],
          len         = (arr || []).length,
          i           = 0;

      for (i = 0; i < len; ++i) {
        modelArray.push(this.model(arr[i]));
      }

      return modelArray;
    },

    getAjaxTimeout: function() {
      return $.cookie("timeoutOverride") || this.timeout;
    },


    /**
     * Make a request to an API.
     *
     * @example
     * Passing in 'Folder.List' when rootURI is '/mw/' will make a request to '/mw/Folder.List'
     *
     * @function
     *
     * @static
     *
     * @param  {String} uri     The specific URI to call.
     * @param  {Object} params  The data to send.
     * @param  {Object} options Options to go with the request.
     *
     * @return {Deferred}
     */
    request: function(uri, params, options) {
      options || (options = {});
      params || (params = {});

      var d    = $.Deferred(),
          that = this,
          url  = this.rootURI + uri;

      _.defaults(options, {
        data     : params,
        url      : url
      });

      options.timeout = this.getAjaxTimeout();

      if (options.jsonBody) {
        options.contentType = 'application/json';
        options.data = JSON.stringify(options.data);
        options.processData = false;
      }

      options.success = function(resp) {
        // If we have a NULL response,= or it is not valid then we reject.
        if (!resp || !resp.valid) {
          d.reject(resp || {
            valid: false
          });
        } else {
          // If it is valid, then we just return the response.
          var modelizer = that.getParser(uri, options.type) || that.defaultHandler;
          d.resolve(modelizer.call(that, resp.data || {}, params) || {}, params, resp);
        }
      };

      options.error = function(err) {
        err.url = url;
        err.methodType = options.type;
        d.reject(err);
      };

      $.ajax(options);

      return d.promise();
    },

    getParser: function(uri, type) {
      var parsers = this._parsers || (this._parsers = this.parseParsers()) || [],
          len     = parsers.length,
          i       = 0,
          parser  = null;

      type = String(type).toLowerCase();

      for (i = 0; i < len; ++i) {
        parser = parsers[i];
        if (parser.type && parser.type !== type) {
          // if we specify a type of call and it does not match the given type then continue
          continue;
        }
        if (parser.uri.test(uri)) {

          return parser.callback;
        }
      }
    },

    parseParsers: function() {
      var rootURI = this.rootURI;

      return _.map(this.parsers || {}, function(fn, route) {
        var type = null;

        // See if we have any type specific items
        if (route[0] == '#') {
          var lastHashIndex = route.slice(1).indexOf('#') + 1;

          type = route.slice(1, lastHashIndex).toLowerCase();
          route = route.slice(lastHashIndex + 1);
        }

        route = (route).replace(escapeRegExp, '\\$&')
                      .replace(optionalParam, '(?:$1)?')
                      .replace(namedParam, function(match, optional) {
                        return optional ? match : '([^\/]+)';
                      })
                      .replace(splatParam, '(.*?)');

         return { uri: new RegExp('^' + route + '$'), callback: fn, type: type };
      });
    },

    /**
     * Taking the model request and executing it as a POST.
     *
     * @function
     *
     * @instance
     *
     * @param  {Stirng} uri Destination of the API call.
     * @param  {Object} params Parameters to pass into the API call.
     * @param  {Object} options Options to use during the API call.
     *
     * @return {Object}
     */
    post: function(uri, params, options) {
      return this.request(uri, params, _.defaults(options || {}, { type: 'POST' }));
    },

    /**
     * Taking the model request and executing it as a GET.
     *
     * @function
     *
     * @instance
     *
     * @param  {Stirng} uri Destination of the API call.
     * @param  {Object} params Parameters to pass into the API call.
     * @param  {Object} options Options to use during the API call.
     *
     * @return {Object}
     */
    get: function(uri, params, options) {
      return this.request(uri, params, _.defaults(options || {}, { type: 'GET' }));
    },

    /**
     * Taking the model request and executing it as a PUT.
     *
     * @function
     *
     * @instance
     *
     * @param  {Stirng} uri Destination of the API call.
     * @param  {Object} params Parameters to pass into the API call.
     * @param  {Object} options Options to use during the API call.
     *
     * @return {Object}
     */
    put: function(uri, params, options) {
      return this.request(uri, params, _.defaults(options || {}, { type: 'PUT', jsonBody: true }));
    },

    /**
     * Taking the model request and executing it as a DELETE.
     *
     * @function
     *
     * @instance
     *
     * @param  {Stirng} uri Destination of the API call.
     * @param  {Object} params Parameters to pass into the API call.
     * @param  {Object} options Options to use during the API call.
     *
     * @return {Object}
     */
    del: function(uri, params, options) {
      return this.request(uri, params, _.defaults(options || {}, { type: 'DELETE' }));
    },

    generateLink: function(uri) {
      
      return window.location.origin + this.rootURI + uri;
    }

  });

  EVIModel.extend = function(proto, stat) {
    // See if the static properties has a parsers object.
    if (this.parsers && stat && stat.parsers) {
      stat.parsers = _.extend({}, this.parsers, stat.parsers);
    }

    // Extends properties with server properties
    var serverProperties = [],
        properties       = [];

    if (_.isArray(proto.serverProperties)) {
      serverProperties = proto.serverProperties;
      if (_.isArray(proto.properties)) {
        properties = proto.properties;
      }
      proto.properties = [].concat(serverProperties, properties);
    }

    return EVIObject.extend.apply(this, arguments);
  };

  return EVIModel;
});