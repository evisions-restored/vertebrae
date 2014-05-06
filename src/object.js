/**
 * @namespace Vertebrae
 */
define([
  'backbone', 
  'underscore',
  './stringutils'
], function(
  Backbone, 
  _,
  StringUtils) {

  /**
   * Base Class for All Project Objects
   *
   * @name BaseObject
   * 
   * @class BaseObject
   * 
   * @memberOf Vertebrae
   */
  var BaseObject = function() {

    if (this.initialize) {
      this.initialize.apply(this, arguments);
    }
    this.trigger('init');
  };

  // Creates a _super function for the parent function when calling the childFunction.
  function createSuper(parentFunction, childFunction) {
    return function() {
      var oldSuper = this._super;
      this._super = parentFunction;

      var ret = childFunction.apply(this, arguments);
      this._super = oldSuper;

      return ret;
    };
  };

  // Creates super functions by comparing parentProto to childProto.
  function createSuperForOverriddenFunctions(parentProto, childProto) {
    var childKeys = _.keys(childProto),
        name      = null,
        i         = 0;

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
   * Create of sub-class of BaseObject
   * 
   * @function Vertebrae.BaseObject.extend
   * 
   * @static
   * 
   * @param  {Object} proto The prototype definition.
   * 
   * @return {Function} The subclass constructor.
   */
  BaseObject.extend = function(proto) {
    var newProperties = [],
        oldProperties = [],
        i             = 0,
        len           = 0,
        child         = null;

    if (_.isArray(proto.properties)) {
      newProperties = proto.properties;

      len = newProperties.length;

      for (i = 0; i < len; i++) {
        (function(prop){

          var setter = function(value, silent) {
               this.set(prop, value, silent);
               return this;
              },
              getter = function() {
                return this.get(prop);
              },
              cameld = String.camelCase(prop);

          if (cameld.indexOf('.') > -1) {
            // Make the name camel cased through the namespace and remove periods.
            cameld = String.camelCaseFromNamespace(cameld);
          }

          var setterName = 'set' + cameld,
              getterName = 'get' + cameld;

          if (_.isFunction(proto[setterName])) {
            proto[setterName] = createSuper(setter, proto[setterName]);
          } else {
            proto[setterName] = setter;
          }

          if (_.isFunction(proto[getterName])) {
            proto[getterName] = createSuper(getter, proto[getterName]);
          } else {
            proto[getterName] = getter;
          }

        })(newProperties[i]);
      }

      if (_.isArray(this.prototype.properties)) {
        oldProperties = this.prototype.properties;
      }
      proto.properties = [].concat(newProperties, oldProperties);
    }

    child = Backbone.View.extend.apply(this, arguments);
    createSuperForOverriddenFunctions(this.prototype, child.prototype);

    return child;
  };

  BaseObject.prototype = /** @lends Vertebrae.BaseObject */ {

    // Function placeholder for the base object initialization.
    initialize: function() {
      
    },

    // Function placeholder for the base object _super.
    _super: function() {
      return this; 
    },

    /**
     * Applies an object of key/value pairs to the object using the associated setters.
     *
     * @function
     * 
     * @instance
     * 
     * @param  {Object} properties
     */
    applyProperties: function(jsonObject) {
      var key,
          setterFn;

      for (key in jsonObject) {
        if (key.indexOf('.') > -1) {
          setterFn = "set" + String.camelCaseFromNamespace(key);
        } else {
          setterFn = "set" + String.camelCase(key);
        }
        if (_.isFunction(this[setterFn])) {
          this[setterFn](jsonObject[key]);
        } else {
          this[key] = jsonObject[key];
        }
      }

      return this;
    },

    /**
     * Destroy an object, set its properties to null, and any events it may be listening to.
     * 
     * @function
     * 
     * @instance
     */
    destroy: function() {
      this.destroyed = true;
      // clear all events
      this.stopListening();
      this.off();
      // Clear out all the properties of an object.
      if (_.isArray(this.properties)) {
        var i     = 0,
            prop  = null;

        for (i = 0; i < this.properties.length; i++) {
          prop = this.properties[i];
          this.set(prop, null, true);
        }
      }
    },

    /**
     * Sometimes you want to do more than just set an object's properties to null.
     * You want to destroy them as well.
     * 
     * @function
     * 
     * @instance
     */
    destroyProperties: function() {
      if (_.isArray(this.properties)) {
        var i     = 0,
            obj   = null,
            prop  = null;

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
     * Get the vlue for an object's property.
     * 
     * @function
     * 
     * @instance
     * 
     * @param  {String} key The property name you want to get
     * 
     * @return {Object} The property value
     */
    get: function(k) {
      if (k.indexOf('.') > -1) {
        return BaseObject.getPropertyByNamespace(this, k);
      } else {
        return this[k];
      }
    },

    /**
     * Call the appropriate getter for the given property
     * 
     * @param  {String} name 
     * 
     */
    getter: function(name) {
      var fn = 'get' + StringUtils.camelCase(name);

      return this[fn].apply(this, _.toArray(arguments).slice(1));
    },

    /**
     * Call the appropriate setter for the given property
     * 
     * @param  {String} name 
     * 
     */
    setter: function(name) {
      var fn = 'set' + StringUtils.camelCase(name);
      return this[fn].apply(this, _.toArray(arguments).slice(1));
    },

    /**
     * Gets all the properties as an object
     *
     * @function
     * 
     * @instance
     * 
     * @return {Object}
     */
    getProperties: function() {
      var obj         = {},
          properties  = this.properties || [],
          i           = 0,
          getter      = null,
          value       = null,
          prop        = null;

      for (i = 0; i < properties.length; ++i) {
        prop = properties[i];
        getter = this['get' + String.camelCase(prop)];
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
     * Set the value for an object's property.
     * 
     * @function
     * 
     * @instance
     * 
     * @param  {String} key The key to store the value in.
     * @param  {Any} value The value you want to store.
     * @param  {Boolean} silent If true the change event will not fire.
     */
    set: function(k, v, silent) {
      var isNamespacedKey = k.indexOf('.') > -1,
          oldValue        = isNamespacedKey ? BaseObject.getPropertyByNamespace(this,k) : this[k],
          trigger         = oldValue != v && !silent,
          that            = this;

      if (isNamespacedKey) {
        BaseObject.setPropertyByNamespace(this,k,v);
      } else {
        this[k] = v;
      }
      if (trigger) {
        this.trigger('change:' + k, this);
        // Clear the change timeout if we are setting something else.
        clearTimeout(this._changeTimeout);

        // There may be multiple changes in a single event loop.
        // Defer the change trigger so that all changes are pushed as one.
        this._changeTimeout = setTimeout(function() {
          that.trigger('change');
        }, 0);
      }
    }

  };

  _.extend(BaseObject, {

    /**
     * Take a namespace string and value and apply it to the given object
     *
     * @function
     *
     * @param  {Object} obj The object we want to apply the namespace to.
     * @param  {String} key The namespace string
     * @param  {Any} value The value to set on the namespace
     */
    setPropertyByNamespace: function(obj, key, value) {
      key = key || '';

      var namespaces  = key.split('.'),
          o           = obj,
          ns          = null,
          i           = 0;

      if (namespaces.length < 1) {
        return;
      }

      for (i = 0; i < namespaces.length-1; ++i) {
        ns = namespaces[i];
        // If the current namespace of the curent object is null or undefined, then define it.
        if (o[ns] == null) { o[ns] = {}; }
        o = o[ns];
      }

      ns = namespaces[namespaces.length-1];
      o[ns] = value;

      return value;
    },
    
    /**
     * Take a namespace string and get the value from the object.
     *
     * @function
     *
     * @param  {Object} obj The object we are getting the value from
     * @param  {String} key The namespace we want.
     *
     * @return {Any}     The value at the given namespace
     */
    getPropertyByNamespace: function(obj, key) {
      key = key || '';

      var namespaces  = key.split('.'),
          o           = obj,
          ns          = null,
          i           = 0;

      if (namespaces.length < 1) {
        return null;
      }

      for (i = 0; i < namespaces.length; ++i) {
        ns = namespaces[i];
        if (o == null) {
          return null;
        }
        // If we are looking at the last namespace, then just return the value.
        if (i === namespaces.length-1) {
          return o[ns];
        }
        o = o[ns];
      }

      return null;
    }

  });

  _.extend(BaseObject.prototype, Backbone.Events);
  
  return BaseObject;
});