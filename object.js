/**
 * @namespace Evisions
 */
define(['backbone', 'underscore', 'evisions/helper'], function(Backbone, _, helper) {
  /**
   * Base Class
   * @class
   * @memberOf Evisions
   */
  var EVIObject = function() {
    var that = this,
        properties = this.properties,
        i = 0;

    for (i = 0; properties && i < properties.length; i++) {
      (function(prop){
        var setter = function(value, silent) {
             that.set(prop, value, silent);
             return that;
            },
            getter = function() {
              return that.get(prop);
            },
            cameld = EVI.Helper.camelCase(prop);

        if (cameld.indexOf('.') > -1) {
          //make the name cameld through the namespace and remove periods
          cameld = helper.camelCaseFromNamespace(cameld);
        }

        if (!that["set" + cameld]) {
          that["set" + cameld] = setter;
        }
        if (!that["get" + cameld]) {
          that["get" + cameld] = getter;
        }

        setter(getter());
      })(properties[i]);
    }

    if (this.initialize) {
      this.initialize.apply(this, arguments);
    }
  };

  // creates a _super function for the parent function when calling the childFunction
  function createSuper(parentFunction, childFunction) {
    return function() {
      var oldSuper = this._super;
      this._super = parentFunction;
      var ret = childFunction.apply(this, arguments);
      this._super = oldSuper;
      return ret;
    };
  };

  //creates super functions by comparing parentProto to childProto
  function createSuperForOverriddenFunctions(parentProto, childProto) {
    var childKeys = _.keys(childProto),
        name = null,
        i = 0;

    for (i = 0; i < childKeys.length; ++i) {
      name = childKeys[i];
      if (_.isFunction(parentProto[name]) && parentProto[name] !== childProto[name]) {
        if (name == 'constructor') {
          continue;
        }
        childProto[name] = createSuper(parentProto[name], childProto[name]);
      }
    }
  };

  /**
   * Create of sub-class of EVIObject
   * 
   * @function Evisions.EVIObject.extend
   * @static
   * 
   * @param  {Object} proto The prototype definition
   * 
   * @return {Function}       The subclass constructor
   */
  EVIObject.extend = function(proto) {
    var newProperties = [],
        oldProperties = [],
        child;

    if (_.isArray(proto.properties)) {
      newProperties = proto.properties;
      if (_.isArray(this.prototype.properties)) {
        oldProperties = this.prototype.properties;
      }
      proto.properties = [].concat(newProperties, oldProperties);
    }

    child = Backbone.View.extend.apply(this, arguments);
    createSuperForOverriddenFunctions(this.prototype, child.prototype);

    return child;
  };

  EVIObject.prototype = /** @lends Evisions.EVIObject */ {
  
    initialize: function() {
      //do nothing
    },

    //placeholder so nothing breaks
    _super: function() { return this; },

    /**
     * Applies an object of key/value pairs to the object using the associated setters
     *
     * @function
     * @instance
     * 
     * @param  {Object} properties
     * 
     * @return {None}  
     */
    applyProperties: function(jsonObject) {
      var key,
          setterFn;

      for (key in jsonObject) {
        if (key.indexOf('.') > -1) {
          setterFn = "set" + helper.camelCaseFromNamespace(key);
        } else {
          setterFn = "set" + helper.camelCase(key);
        }
        if (_.isFunction(this[setterFn])) {
          this[setterFn](jsonObject[key]);
        } else {
          this[key] = jsonObject[key];
        }
      }
    },

    /**
     * Destroy an object, set its properties to null, and any events it may be listening to
     * 
     * 
     * @function
     * @instance
     * 
     * @return {None}
     */
    destroy: function() {
      this.destroyed = true;
      this.stopListening();
      //clear out all the properties of an object
      if (_.isArray(this.properties)) {
        var i = 0,
            prop = null;
        for (i = 0; i < this.properties.length; i++) {
          prop = this.properties[i];
          this.set(prop, null, true);
        }
      }
    },

    /**
     * Sometimes you want to do more than just set an object's properties to null.  You want to destroy them as well.
     * 
     * @function
     * @instance
     * 
     * @return {None}
     */
    destroyProperties: function() {
      if (_.isArray(this.properties)) {
        var i = 0,
            obj = null,
            prop = null;
        for (i = 0; i < this.properties.length; i++) {
          prop = this.properties[i];
          obj = this.get(prop);
          if (obj && _.isFunction(obj.destroy)) {
            obj.destroy();
          }
        }
      }
    },


    /**
     * Get the vlue for an object's property

     * @function
     * @instance
     * 
     * @param  {String} key The property name you want to get
     * 
     * @return {Any}   The property value
     */
    get: function(k) {
      if (k.indexOf('.') > -1) {
        return helper.getPropertyByNamespace(this, k);
      } else {
        return this[k];
      }
    },

    /**
     * Gets all the properties as an object
     *
     * @function
     * @instance
     * 
     * @return {Object}
     */
    getProperties: function() {
      var obj = {},
          properties = this.properties || [],
          i = 0,
          getter = null,
          value = null,
          prop = null;
      for (i = 0; i < properties.length; ++i) {
        prop = properties[i];
        getter = this['get' + helper.camelCase(prop)];
        if (getter) {
          value = getter.call(this);
        } else {
          value = this.get(prop);
        }
        if (value !== undefined) {
          obj[prop] = value;
        }
      }
      return obj;
    },

    /**
     * Set the value for an object's property
     * 
     * @function
     * @instance
     * 
     * @param  {String} key      The key to store the valu ein
     * @param  {Any} value      The value you want to store
     * @param  {Boolean} silent If true the change event will not fire
     * 
     * @return {None}        
     */
    set: function(k, v, silent) {
      var isNamespacedKey = k.indexOf('.') > -1,
          oldValue = isNamespacedKey ? helper.getPropertyByNamespace(this,k) : this[k],
          trigger = oldValue != v && !silent,
          that = this;
      if (isNamespacedKey) {
        helper.setPropertyByNamespace(this,k,v);
      } else {
        this[k] = v;
      }
      if (trigger) {
        this.trigger('change:' + k, this);
        //clear the change timeout if we are setting something else
        clearTimeout(this._changeTimeout);
        //there may be multiple changes in a single event loop
        //defer the change trigger so that all changes are pushed as one
        this._changeTimeout = setTimeout(function() {
          that.trigger('change');
        }, 0);
      }
    }

  };

  _.extend(EVIObject.prototype, Backbone.Events);
  
  return EVIObject;
});