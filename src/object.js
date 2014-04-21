/**
 * @namespace Evisions
 */
define([
  'backbone', 
  'underscore'
], function(Backbone, _) {

  /**
   * Base Class for All Project Objects
   *
   * @name EVIObject
   * 
   * @class EVIObject
   * 
   * @memberOf Evisions
   */
  var EVIObject = function() {

    if (this.initialize) {
      this.initialize.apply(this, arguments);
    }
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
   * Create of sub-class of EVIObject
   * 
   * @function Evisions.EVIObject.extend
   * 
   * @static
   * 
   * @param  {Object} proto The prototype definition.
   * 
   * @return {Function} The subclass constructor.
   */
  EVIObject.extend = function(proto) {
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
              cameld = EVIObject.camelCase(prop);

          if (cameld.indexOf('.') > -1) {
            // Make the name camel cased through the namespace and remove periods.
            cameld = EVIObject.camelCaseFromNamespace(cameld);
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

  EVIObject.prototype = /** @lends Evisions.EVIObject */ {

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
          setterFn = "set" + EVIObject.camelCaseFromNamespace(key);
        } else {
          setterFn = "set" + EVIObject.camelCase(key);
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
      this.stopListening();
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
        return EVIObject.getPropertyByNamespace(this, k);
      } else {
        return this[k];
      }
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
        getter = this['get' + EVIObject.camelCase(prop)];
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
          oldValue        = isNamespacedKey ? EVIObject.getPropertyByNamespace(this,k) : this[k],
          trigger         = oldValue != v && !silent,
          that            = this;

      if (isNamespacedKey) {
        EVIObject.setPropertyByNamespace(this,k,v);
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

  _.extend(EVIObject, {
    /**
     * Returns a new instance of the constructor "func" with the given arguments.
     *
     * @function
     *
     * @param  {Function} func The constructor we want initialize.
     * @param  {Array} args Array of arguments we want to initialize with.
     *
     * @return {Object}      New instance
     */
    createWithArgs: function(func, args) {
      // Use javascript blackmagic taken from coffeescript.
      // This allows us to initialize a constructor with a dynamic amount of arguments.
      var ctor    = function() {},
          child   = null,
          result  = null;

      ctor.prototype = func.prototype;
      child = new ctor,
      result = func.apply(child, args);

      return Object(result) === result ? result : child;
    },
    
    /**
     * Inherit from the parent constructor to the child constructor.
     *
     * @function
     *
     * @param  {Function} child  The child constructor.
     * @param  {Function} parent The parent constructor.
     *
     * @return {Function}
     */
    inherit: function(child, parent) {
      var __hasProp = {}.hasOwnProperty;

      for (var key in parent) {
        if (__hasProp.call(parent, key)) {
          child[key] = parent[key];
        }
      }

      function ctor() {
        this.constructor = child;
      }

      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;

      return child;
    },

    /**
     * Return the input string with the first letter capitalized.
     *
     * @function
     *
     * @param  {String} str The string you would like to camel case.
     * 
     * @return {String} The camel cased string.
     */
    camelCase: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Return an array of camel cased strings.
     * The namespace will get exploded based off the "." within the namespace.
     *
     * @function
     *
     * @param  {String} str The namespace you would like to camel case.
     * 
     * @return {Array} Array of camel cased strings from the namespace.
     */
    camelCaseFromNamespace: function(str) {
      str = str.split('.');
      for (var i = 0; i < str.length; i++) {
        str[i] = EVIObject.camelCase(str[i]);
      }

      return str.join('');
    },

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

  _.extend(EVIObject.prototype, Backbone.Events);
  
  return EVIObject;
});