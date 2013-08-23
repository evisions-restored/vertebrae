define(['evisions/object', 'evisions/helper', 'ajaxer'], function(EVIObject, helper) {
  /**
   * @class
   * @memberOf Evisions
   * @augments {Evisions.EVIObject}
   */
  var EVIModel = EVIObject.extend(/** @lends  Evisions.EVIModel */{
    /**
     * Setup the object
     *
     * @function
     * @instance
     * 
     * @param  {Object} props Properties to apply to the model
     */
    initialize: function(props) {
      this.applyProperties(props);
      return this._super();
    },

    /**
     * Update this model with the properties from another model
     *
     * @function
     * @instance
     * 
     * @param  {Evisions.EVIModel} model 
     * 
     * @return {Evisions.EVIModel}       
     */
    updateWith: function(model) {
      this.applyProperties(model.getProperties());
      return this;
    }
  },
  //static
  /** @lends  Evisions.EVIModel */
  {
    parsers: {

    },

    /**
     * @description The root of all URI calls from this model
     * @type {String}
     */
    rootURI: '/mw/',

    uri: '',


    /**
     * If no parser is specified for a request, then we use this default handler
     *
     * @function
     * @static
     * 
     * @param  {Object} data 
     * 
     * @return {Object}    
     */
    defaultHandler: function(data) {
      return data;
    },

    model: function(data) {
      return new this(data);
    },

    models: function(arr) {
      var modelArray = [],
          len = (arr || []).length,
          i = 0;

      for (i = 0; i < len; ++i) {
        modelArray.push(this.model(arr[i]));
      }

      return modelArray;
    },

    /**
     * Make a request to an API
     *
     * @example
     * Passing in 'Folder.List' when rootURI is '/mw/' will make a request to '/mw/Folder.List'
     *
     * @function
     * @static
     * 
     * @param  {String} uri     The specific URI to call
     * @param  {Object} params  The data to send
     * @param  {Object} options Options to go with the request
     * 
     * @return {Deferred}         
     */
    request: function(uri, params, options) {
      options || (options = {});
      params || (params = {});
      var d = helper.deferred(),
          that = this,
          url = this.rootURI + uri;

      AJAXER.PostJSON(
        this.uri.replace('/', '_'),
        url,
        params,
        function(resp) {
          //if we have a null resp or it is not valid then we reject
          if (!resp || !resp.valid) {
            d.reject(resp || {
              valid: false
            });
          } else {
            //if it is valid, then we just return the response
            var modelizer = that.parsers[uri] || that.defaultHandler;
            d.resolve(modelizer.call(that, resp.data || {}, params) || {}, params);
          }
        }
      );

      return d;
    }

  });

  EVIModel.extend = function(proto, stat) {
    // See if the static properties has a parsers object
    if (this.parsers && stat && stat.parsers) {
      stat.parsers = _.extend({}, this.parsers, stat.parsers);
    }
    return EVIObject.extend.apply(this, arguments);
  };
  
  return EVIModel;
});