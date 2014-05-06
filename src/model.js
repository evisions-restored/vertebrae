/**
 * @namespace Vertebrae
 */
define([
  'jquery',
  'underscore',
  './object'
], function(
    $, 
    _, 
    BaseObject) {

  var optionalParam = /\((.*?)\)/g,
      namedParam    = /(\(\?)?:\w+/g,
      splatParam    = /\*\w+/g,
      escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  /**
   * Base Model Class for All Project Models
   *
   * @name BaseModel
   * 
   * @class BaseModel
   * 
   * @memberOf Vertebrae
   * 
   * @augments {Vertebrae.BaseObject}
   */
  var BaseModel = BaseObject.extend(/** @lends  Vertebrae.BaseModel */{

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
      if (_.isFunction(this.defaults)) {
        props = _.defaults(_.clone(props), this.defaults());
      }

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
     * @param  {Vertebrae.BaseModel} model
     *
     * @return {Vertebrae.BaseModel}
     */
    updateWith: function(model) {
      this.applyProperties(model.getProperties());

      return this;
    },

    /**
     * Extending the base jQuery 'when' functionality.
     *
     * @function
     *
     * @instance
     * 
     * @return {Object} Returning the jQuery 'when' with applied arguments.
     */
    when: function() {
      return $.when.apply($, arguments);
    },

    /**
     * Converting server propeties to an object that can be converted to JSON.
     *
     * @function
     *
     * @instance
     * 
     * @return {Object} Object that we are going to be converting to JSON.
     */
    toJSON: function() {
      var properties = {};

      if (this.serverProperties && this.serverProperties.length) {
        properties = _.pick(this, this.serverProperties);
      }

      return properties;
    }

  },/** @lends Vertebrae.BaseModel */{

    /**
     * @description Default timeout value for API calls.
     * 
     * @type {Number}
     */
    timeout: 30000,

    /**
     * @description The specific parsers used for handling the model's API response.
     *
     * @type {Object}
     */
    parsers: {},

    /**
     * @description The root of all URI calls from this model.
     *
     * @type {String}
     */
    rootURI: '/',

    /**
     * If no parser is specified for a request, then we use this default handler.
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
     * @static
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
     * @static
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

    /**
     * Getting the AJAX timeout value.
     *
     * @function
     *
     * @static
     *
     * @return {Number} The value to set the AJAX timeout.
     */
    getAjaxTimeout: function() {
      return Number(this.timeout) || 500;
    },


    /**
     * Make a request to an API.
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

      var d                = $.Deferred(),
          that             = this,
          responseDefaults = this.getResponseDefaults(),
          url              = (this.rootUrl || this.rootURI) + uri;

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

      options.success = function(resp, textStatus, xhr) {
        if (responseDefaults) {
          _.defaults(resp, responseDefaults);
        }
        // If we have a NULL response,= or it is not valid then we reject.
        if (!that.isValidResponse(resp, textStatus, xhr)) {
          d.reject(this.getResponseFailPayload(resp || {}));
        } else {
          // If it is valid, then we just return the response.
          var modelizer = that.getParser(uri, options.type) || that.defaultHandler;

          d.resolve(modelizer.call(that, that.getResponseSuccessPayload(resp || {}), params) || {}, params, resp);
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

    isValidResponse: function(resp) {
      return !!resp;
    },

    getResponseDefaults: function() {
      return null;
    },

    getResponseSuccessPayload: function(resp) {
      return resp;
    },

    getResponseFailPayload: function(resp) {
      return resp;
    },

    /**
     * Getting the parse for a URI request for a specific type.
     *
     * @function
     *
     * @static
     * 
     * @param  {String} uri  URI of the request we are trying to parse.
     * @param  {String} type The type of request we are trying to parse.
     * 
     * @return {Object}      The callback of the FOUND parser.
     */
    getParser: function(uri, type) {
      var parsers = this._parsers || [],
          len     = parsers.length,
          i       = 0,
          parser  = null;

      type = String(type).toLowerCase();

      for (i = 0; i < len; ++i) {
        parser = parsers[i];
        if (parser.type && parser.type !== type) {
          // If we specify a type of call and it does not match the given type, then continue.
          continue;
        }
        if (parser.uri.test(uri)) {
          return parser.callback;
        }
      }
    },

    /**
     * Parsing through the set of parsers to find the matching route.
     *
     * @function
     *
     * @static
     * 
     * @return {Object} Parser object with the matching route. Includes the callback function and type of parser.
     */
    parseParsers: function() {
      var rootURI = this.rootURI;

      return _.map(this.parsers || {}, function(fn, route) {
        var type = null;

        // See if we have any type specific items.
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

        if (_.isString(fn)) {
          var fnName = fn;
          fn = function() {
            return this[fnName].apply(this, arguments);
          };
        }

        return { 
          uri       : new RegExp('^' + route + '$'),
          callback  : fn, 
          type      : type 
        };
      });
    },

    /**
     * Taking the model request and executing it as a POST.
     *
     * @function
     *
     * @static
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
     * @static
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
     * @static
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
     * @static
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

    /**
     * Generating an API link based off the past URL. The rootURI will be appended to the API calls.
     *
     * @function
     *
     * @static
     * 
     * @param  {String} uri The destination of the API request we are trying to make.
     * 
     * @return {String}     Built string for the API request.
     */
    generateLink: function(uri) {
      return window.location.origin + this.rootURI + uri;
    }

  });

  function createModelRequestMethods(map) {
    var routes = {};

    _.each(map, function(name, route) {
      var sections     = route.split(/\s+/),
          method       = String(sections[0]).trim().toLowerCase(),
          uri          = sections.slice(1).join('');


      if (method == 'delete') {
        method = 'del';
      }

      routes[name] = function(params, options) {
        var args = arguments;

        var replacedUri = String(uri)
            .replace(/:[\$]?\w+/g, function(match) {
              var name = match.slice(1);

              if (name[0] == '$') {

                return args[name.slice(1)];
              } else if (params && params[name]) {

                return params[name];
              } else {

                throw new Error('The route ' + route + ' must include ' + name + ' in your params');
              }
            });

        return this[method](replacedUri, params, options);
      };
    });

    return routes;
  };

  BaseModel.extend = function(proto, stat) {
    // See if the static properties has a parsers object.
    if (this.parsers && stat && stat.parsers) {
      stat._parsers = this.parseParsers.call(stat).concat(this._parsers || []);
    }

    if (stat && stat.routes) {
      _.extend(stat, createModelRequestMethods(stat.routes));
    }

    // Extends properties with server properties.
    var serverProperties = [],
        properties       = [];

    if (_.isArray(proto.serverProperties)) {
      serverProperties = proto.serverProperties;
      if (_.isArray(proto.properties)) {
        properties = proto.properties;
      }
      proto.properties = [].concat(serverProperties, properties);
    }

    if (_.isArray(proto.attributes)) {



      if (_.isArray(this.prototype.attributes)) {
        proto.attributes = [].concat(this.prototype.attributes, proto.attributes);
      }
    }

    return BaseObject.extend.apply(this, arguments);
  };

  return BaseModel;

});