/*!
 * Vertebrae JavaScript Library v0.1.23
 *
 * Released under the MIT license
 *
 * Date: 2014-08-12T00:05Z
 */

(function(global, factory) {

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.document ?
      factory(global, true) :
      function(w) {
        if (!w.document) {
          throw new Error("vertebrae requires a window with a document");
        }
        return factory(w);
      };
  } else {
    if (typeof define === 'function' && define.amd) {
      define('vertebrae', ['jquery', 'backbone', 'underscore'], factory);
    } else {
      factory(global);
    }
  }

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function(win, noGlobal) {


  
  /**
   * @class StringUtils
   *
   * @classdesc Common helper functions that haven't been categorized yet.
   */
  var StringUtils = _.extend(/** @lends Vertebrae.StringUtils */{

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
        str[i] = StringUtils.camelCase(str[i]);
      }

      return str.join('');
    },

    /**
     * Formatting a number with commas and a decimal point.
     *
     * @function
     *
     * @param  {int|float} num The number you wish to format.
     * 
     * @return {string} The formatted number string.
     */
    formatNumber: function(num) {
      var sections = String(num).split('.'),
          number   = sections[0] || '0',
          decimal  = sections[1] || '',
          strArr   = number.split('').reverse(),
          arr      = [],
          finalStr = '';
          
      if (number.length <= 3) {
        return String(num);
      }

      while (strArr.length) {
        arr.push(strArr.splice(0, 3).reverse().join(''));
      }

      finalStr = arr.reverse().join(',');
      
      if (decimal) {
        finalStr += '.' + decimal;
      }

      return finalStr;

    },

    /**
     * Converting the passed string to all lower case.
     * 
     * @function
     *
     * @param {String} str The string we want to lower case.
     * 
     * @return {String} The lower cased string.
     */
    toLowerCase: function(str) {
      return String(str).toLowerCase();
    },
  
    /**
     * Take an escaped html string and unescape it.
     *
     * @function
     *
     * @param {String} string 
     * 
     * @return {String}        
     */
    unescapeHTML: function(string) {
      return $('<div/>').html(string).text();
    }

  });

  String.camelCase = function() {
    return StringUtils.camelCase.apply(String, arguments);
  };

  String.camelCaseFromNamespace = function() {
    return StringUtils.camelCaseFromNamespace.apply(String, arguments);
  };

  String.formatNumber = function() {
    return StringUtils.formatNumber.apply(String, arguments);
  };

  String.unescapeHTML = function() {
    return StringUtils.unescapeHTML.apply(String, [this]);
  };
/**
 * @namespace Vertebrae
 */


  var event = _.extend({}, Backbone.Events);

  var BaseEvent = {
    /**
     * Bind all the function on an object to the obj itself.
     * This will cause all functions to ALWAYS have the correct 'this'.
     *
     * @function
     *
     * @param  {Object} obj 
     * 
     * @return {Object}     
     */
    bindAll: function(obj) {
      var i     = 0,
          keys  = [],
          fn    = null,
          k;

      for(k in obj) { 
        keys.push(k); 
      }
      if (!obj || !obj.constructor) { 
        return obj; 
      }
      
      for (i = 0; i < keys.length; ++i) {
        fn = obj[keys[i]];
        if (_.isFunction(fn) && keys[i] !== 'constructor' && _.contains(obj.constructor.prototype, fn)) {
          obj[keys[i]] = _.bind(fn, obj);
        }
      }
      
      return obj;
    },
    
    /**
     * Fire an event. This relates to the observe helper function.
     *
     * @function
     *
     * @param  {String} event The name of the event that you want to fire.
     * @param  {Object} data 	The date you want to pass into the function listening to the passed event.
     *
     * @return {Object}
     */
    fire: function() {
      event.trigger.apply(event, arguments);

      return BaseEvent;
    },

    /**
     * Trigger an event. This will basically call the fire function.
     *
     * @function
     * 
     * @return {Object}
     */
    trigger: function() {
      return BaseEvent.fire.apply(BaseEvent, arguments);
    },

    /**
     * Set an event observer. Relates to the fire function. 
     *
     * @function
     *
     * @param  {String} 	event 		The name of the event that you want to observe.
     * @param  {Function} callback 	The function you want to call if the observed event is fired.
     *
     * @return {Object}
     */
    observe: function(name, callback) {
      event.on.apply(event, arguments);

      return {
        remove: function() {
          event.off(name, callback);
        }
      };
    },

    /**
     * Observing events for a particular element.
     *
     * @function
     * 
     * @return {Object}
     */
    on: function() {
      return BaseEvent.observe.apply(BaseEvent, arguments);
    }

  };


  var Utils = {

    // Creates a _super function for the parent function when calling the childFunction.
    createSuper: function(parentFunction, childFunction) {
      return function() {
        var oldSuper = this._super;
        this._super = parentFunction;

        var ret = childFunction.apply(this, arguments);
        this._super = oldSuper;

        return ret;
      };
    },

    // Creates super functions by comparing parentProto to childProto.
    createSuperForOverriddenFunctions: function(parentProto, childProto) {
      var childKeys = _.keys(childProto),
          name      = null,
          i         = 0;

      for (i = 0; i < childKeys.length; ++i) {
        name = childKeys[i];
        if (_.isFunction(parentProto[name]) && parentProto[name] !== childProto[name]) {
          if (name == 'constructor' || name == 'view') {
            continue;
          }
          childProto[name] = Utils.createSuper(parentProto[name], childProto[name]);
        }
      }
    },

    // creates getters and setters on the given object with the given property
    createGettersAndSetters: function(proto, prop) {

      var setter = function(value, silent) {
           return this.set(prop, value, silent);
          },
          getter = function() {
            return this.get(prop);
          },
          cameld = StringUtils.camelCase(prop);

      if (cameld.indexOf('.') > -1) {
        // Make the name camel cased through the namespace and remove periods.
        cameld = StringUtils.camelCaseFromNamespace(cameld);
      }

      var setterName = 'set' + cameld,
          getterName = 'get' + cameld;

      if (_.isFunction(proto[setterName])) {
        proto[setterName] = Utils.createSuper(setter, proto[setterName]);
      } else {
        proto[setterName] = setter;
      }

      if (_.isFunction(proto[getterName])) {
        proto[getterName] = Utils.createSuper(getter, proto[getterName]);
      } else {
        proto[getterName] = getter;
      }

    },

    mergeClassProperty: function(newProto, oldProto, prop, fn) {
      var merged = null;

      if (_.isFunction(fn)) {
        _.each(newProto[prop], fn);
      }

      if (_.isArray(newProto[prop])) {
        merged = [];

        if (_.isArray(oldProto[prop])) {
          merged = merged.concat(oldProto[prop], newProto[prop]);
        } else {
          merged = merged.concat(newProto[prop]);
        }

      } else if (_.isObject(newProto[prop])) {
        merged = {};

        if (_.isObject(oldProto[prop])) {
          _.extend(merged, oldProto[prop], newProto[prop]);
        } else {
          _.extend(merged, newProto[prop]);
        }

      }

      if (merged) {
        newProto[prop] = merged;
      }

      return newProto;
    },

    setupInstanceEvents: function(inst) {
      if (!_.isObject(inst.events)) {
        return;
      }

      var events = _.keys(inst.events),
          event  = null,
          fn     = null,
          len    = events.length,
          i      = 0;

      for (i = 0; i < len; ++i) {
        event = events[i];
        fn = inst.events[event];
        if (fn) {

          if (!inst[fn]) {
            throw new Error(fn + ' does not exist on this controller');
          }

          inst.listenTo(inst, event, inst[fn]);
        }
      }
    },

    setupInstanceObserves: function(inst) {
      if (!_.isObject(inst.observes)) { 
        return; 
      }

      var observes  = inst.observes,
          events    = _.keys(observes),
          event     = null,
          i         = 0,
          fnName    = null;

      for (i = 0; i < events.length; ++i) {
        event = events[i];
        fnName = observes[event];
        if (!_.isFunction(inst[fnName])) {
          throw new Error(fnName + ' does not exist for the global event ' + event);
        }

        inst.once('unload', BaseEvent.observe(event, _.bind(inst[fnName], inst)).remove);
      }
    },

    makeFunction: function(cb) {
      return _.isFunction(cb) ? cb : function() {};
    }

  };
/**
 * @namespace Vertebrae
 */


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
    var child = null;


    Utils.mergeClassProperty(proto, this.prototype, 'properties', function(prop) {
      Utils.createGettersAndSetters(proto, prop);
    });

    // Use the extend function of Backbone.View to create a new class
    child = Backbone.View.extend.apply(this, arguments);

    Utils.createSuperForOverriddenFunctions(this.prototype, child.prototype);

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
    applyProperties: function(jsonObject, options) {
      var key      = null,
          setterFn = null;

      options = _.defaults(options || {}, {
        replaceFunctions: false
      });

      for (key in jsonObject) {
        if (key.indexOf('.') > -1) {
          setterFn = "set" + StringUtils.camelCaseFromNamespace(key);
        } else {
          setterFn = "set" + StringUtils.camelCase(key);
        }
        if (_.isFunction(this[setterFn])) {
          this[setterFn](jsonObject[key]);
        } else {
          // don't override instance functions unless we REALLY want to....
          if (!_.isFunction(this[key]) || options.replaceFunctions) {
            this[key] = jsonObject[key];
          }
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
          this.set(prop, null, { silent: true });
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
     * Pick out properties from this object's properties
     * 
     * @return {Object}
     */
    pick: function() {
      var args  = _.toArray(arguments),
          obj   = {},
          len   = 0,
          i     = 0,
          prop  = null,
          props = [];

      if (_.isArray(args[0])) {
        props = args[0];
      } else {
        props = args;
      }

      for (i = 0, len = props.length; i < len; ++i) {
        prop = props[i];
        obj[prop] = this.getter(prop);
      }

      return obj;
    },

    hasGetter: function(name) {

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
    set: function(k, v, options) {
      var isNamespacedKey = k.indexOf('.') > -1,
          oldValue        = isNamespacedKey ? BaseObject.getPropertyByNamespace(this,k) : this[k],
          trigger         = false,
          that            = this;

      options = options || {};

      _.defaults(options, {
        trigger: oldValue != v,
        silent: false
      });

      trigger = options.trigger && !options.silent;

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
      
      return this;
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


  /**
   * Validator is a global field validator for use with controllers
   *
   * @function
   *
   * @param {Controller} controller Any instance that has a validators object on it
   * @param {None|Evisions.EVIView} view Tells if the fields defined by the validators object on the controller are valid or not
   * @param {None|Array} filters
   *
   * @return {Boolean}
   */
  var Validator = function(controller, view, filters) {
    var validators    = null,
        invalidItems  = null;

    if (!controller) { 
      return; 
    }

    if (!view) {
      view = controller.getView();
    }

    validators = controller.validators || {};

    invalidItems = _.chain(validators).map(function(middleware, validationField) {
      if (filters && !_.contains(filters, validationField)) {
        return true;
      }

      var getter  = Utils.makeFunction(view[getValidationGetterName(validationField)]),
          error   = Utils.makeFunction(view[getValidationErrorName(validationField)]),
          success = Utils.makeFunction(view[getValidationSuccessName(validationField)]),
          value   = '',
          ret     = false;

      value = getter.call(view);
      ret = Validator.validateValueWithMiddleware(value, validationField, middleware, controller);
      if (ret === true) {
        success.call(view);

        return true;
      } else {
        error.call(view, ret + '');

        return false;
      }
    }).reject(function(v) { return v; }).value();

    if (invalidItems.length) {
      return false;
    }

    return true;
  };

  function getValidationErrorName(validationField) {
    return 'show' + StringUtils.camelCase(validationField) + 'Error';
  };

  function getValidationSuccessName(validationField) {
    return 'show' + StringUtils.camelCase(validationField) + 'Success';
  };

  function getValidationGetterName(validationField) {
    return 'get' + StringUtils.camelCase(validationField);
  };


  Validator.validateValueWithMiddleware = function(value, field, middleware, controller) {
    if (_.isFunction(middleware)) {
      middleware = [middleware].concat($.makeArray(arguments).slice(2));
    } else if (!_.isArray(middleware)) {
      middleware = [];
    }

    var i   = 0,
        fn  = null,
        ret = false;

    for (i = 0; i < middleware.length; ++i) {
      fn = middleware[i];
      if (_.isString(fn)) {
        fn = controller[fn];
      }
      ret = fn.call(controller, value, field);
      if (ret !== true) {
        return ret;
      }
    }

    return true;
  };

  Validator.validators = {};

  /**
   * Checking the length of a field.
   * 
   * @function
   * 
   * @param  {Integer} min
   * @param  {Integer} max
   * @param  {String} minMessage
   * @param  {String} maxMessage
   * 
   * @return {String|Boolean}
   */
  Validator.validators.checkLength = function(min, max, minMessage, maxMessage) {
    return function(value, field) {
      // DO NOT MODIFY -- if string is not required, this will invalidate validation
      if (String(value) === value) {
        if (value.length < min) {
          return minMessage || 'This field must be a minimum length of ' + min + '.';
        }
        if (value.length > max) {
          return maxMessage || 'This field cannot have a length greater than ' + max + '.';
        }
      }
      return true;
    };
  };

  /**
   * Checking to make sure an email address is valid.
   * 
   * @function
   *
   * @param  {String} message
   * 
   * @return {String|Boolean}
   */
  Validator.validators.email = function(message) {
    return function(value, field) {
      var regex = /[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum|edu)\b/i;

      if (!value) {
        return true;
      }
      if (!regex.test(value)) {
        return message || 'An invalid email address was entered.';
      }

      return true; 
    }
  };

  /**
   * Checking to make sure a phone number is valid.
   * 
   * @function
   *
   * @param  {String} message
   * 
   * @return {String|Boolean}
   */
  Validator.validators.phone = function(message) {
    return function(value, field) {
      var regex = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;

      if (!value) {
        return true;
      }
      if (!regex.test(value)) {
        return message || 'An invalid phone number was entered.';
      }

      return true;
    };
  };
  
  /** 
   * Checking to make sure a postal code is valid.
   * US ONLY postal codes.
   * 
   * @param  {String} message
   * @param  {string} field
   * @return {boolean}
   */
  Validator.validators.postalCode = function(message){
    return function(value, field) {
      var regex = /^\d{5}(-\d{4})?$/g;

      if (!value) {
        return true;
      }
      if (!regex.test(value)) {
        return message || 'An invalid postal code was entered.';
      }

      return true;
    };
  };

  /**
   * An empty field validator.
   *
   * @function
   *
   * @param  {String} message
   *
   * @return {String|Boolean}
   */
  Validator.validators.empty = function(message) {
    return function(value, field) {
      if (!String(value == null ? '' : value).trim()) {
        return message || 'This field cannot be empty.';
      }

      return true;
    };
  };

  /**
   * A date field validator
   *
   * @param {String} message 
   *
   * @return {Function} 
   */
  Validator.validators.date = function(message) {
    message = message || 'This is an invalid date.';
    return function(date, field) {
      if (_.isDate(date)) {
        try {
          var time = date.getTime();

          if (_.isNaN(time)) {
            return message;
          }
        } catch(e) {
          return message;
        }
      }

      return true;
    };
  };

  Validator.validators.number = function(message) {
    message = message || 'This is an invalid number.';
    return function(value, field) {
      if (String(value).length > 0 && _.isNaN(Number(value))) {
        return message;
      } else if (value % 1 != 0) { // Check for integers
        return "Decimal points are not allowed.";
      }
      
      return true;
    };
  };

  Validator.validators.numberBetween = function(min, max, message) {
    message = message || 'This is an invalid number.';
    return function(value, field) {
      if (String(value).length > 0 && _.isNaN(Number(value))) {
        return message;
      } else if (value % 1 != 0) { // Check for integers
        return "Decimal points are not allowed.";
      } else if (value < min || value > max) {
        return message;
      }
      
      return true;
    };
  };
/**
 * @namespace Vertebrae
 */


  /**
   * Base Controller Object for all Controller
   *
   * @name BaseController
   * 
   * @class BaseController
   * 
   * @memberOf Vertebrae
   * 
   * @augments {Vertebrae.BaseObject}
   */
  var BaseController = BaseObject.extend(/** @lends  Vertebrae.BaseController */{

    /**
     * @description Base properties container for the controller.
     * 
     * @type {Array}
     */
    properties: ['view'],

    events: {
      'view:ready': 'render',
      'view:available': null
    },

    /**
     * Constructor
     *
     * @function
     *
     * @instance
     * 
     * @param  {Object} options
     */
    initialize: function(options) {
      this._unbind = [];

      Utils.setupInstanceObserves(this);
      Utils.setupInstanceEvents(this);

      this.setupView();

      if (!this.getView()) {
        throw new Error('A view was not properly assigned.');
      }

      this.listenToOnce(this.getView(), 'change:available', function() {
        this.trigger('view:available');
        this.viewIsAvailable();
      });
    },

    /**
     * Keep properties on an object in sync with other properties and the view.
     *
     * @function
     *
     * @instance
     * 
     * @param  {String} property The property we want to look at.
     * @param  {Object} options  The object whose properties we want to sync with. 
     * 
     * @return {Object}          
     */
    sync: function(property, options) {
      var fnController    = null,
          that            = this,
          view            = null,
          hasListened     = false,
          camelProperty   = StringUtils.camelCase(property),
          previousValue   = void(0),
          getter          = null,
          updateOnAvaible = null,
          updateView      = null,
          getterFn        = null,
          obj             = null,
          fnView          = null,
          filterFn        = function() { return true; };

      options = _.defaults(options || {}, {
        trigger       : false,
        triggerView   : true,
        accessor      : 'get' + camelProperty,
        target        : this,
        targetHandler : property + 'DidChange',
        viewHandler   : 'refresh' + camelProperty + 'PropertyOnView',
        // you can specific a filter to determine if you should trigger events or not
        filter        : null,
        view          : this.getView()
      });

      view         = options.view;
      getterFn     = options.accessor;
      fnController = options.targetHandler;
      fnView       = options.viewHandler;
      obj          = options.target;

      if (options.filter) {
        if (_.isString(options.filter) && _.isFunction(this[options.filter])) {
          filterFn = this[options.filter];
        } else if (_.isFunction(options.filter)) {
          filterFn = options.filter;
        }
      }

      // Gets the value for the property on the object we are watching
      getter = function() {
        if (obj[getterFn]) {

          return obj[getterFn]();
        } else {

          return obj.get(property);
        }
      };

      // Update the view but only when the avaiable property has changed
      updateOnAvaible = function(prev) {
        if (hasListened) {

          return;
        }
        hasListened = true;
        that.listenToOnce(view, 'change:available', function() {
          
          hasListened = false;

          updateView(prev);
        });
      };

      // Update the view but only if it is available else queue to update when avaiable changes
      updateView = function(prev) {
        if (that[fnView]) {
          if (view.getAvailable()) {
            that[fnView](getter(), prev);
          } else {
            updateOnAvaible(prev);
          }
        }
      };

      // listen to changes on the given object for the given property
      this.listenTo(obj, 'change:' + property, function() {
        var currentValue = getter();
        if (filterFn.call(this, property)) {
          if (this[fnController]) {
            this[fnController](currentValue, previousValue);
          }
          previousValue = currentValue;
          updateView(previousValue);
        }
      });

      // We want to immediately update the view to get it in sync with the state of the property we are watching
      if (options.triggerView === true && filterFn.call(this, property)) {
        updateView();
      }

      if (options.trigger === true) {
        this.trigger('change:' + property);
      }

      return this;
    },

    bind: function(eventName, fn, options) {
      options = _.defaults(options || {}, {
        filter: function() {}
      });

      if (options.filter) {
        if (_.isString(options.filter)) {
          options.filter = this[options.filter];
        } else if (!_.isFunction(options.filter)) {
          options.filter = function(){};
        }
      }

      this.listenTo(this, eventName, function() {
        if (options.filter.call(this, eventName)) {
          fn.apply(this, arguments);
        }
      });
      return this;
    },

    isViewAvailable: function() {
      if (this.getView()) {
        return this.getView().isAvailable();
      }
      return false;
    },

    /**
     * Destroying the controller and the view of the controller.
     *
     * @function
     * 
     * @instance
     */
    destroy: function() {
      if (this._unloaded !== true) {
        this.unload();
      }

      this.trigger('destroy');
      this.destroyView();
      this._super.apply(this, arguments);
    },

    /**
     * Destroying the view of the controller.
     *
     * @function
     * 
     * @instance
     */
    destroyView: function() {
      var view = this.getView();
      
      if (view) {
        view.destroy();
      }
      this.setView(null);
    },

    /**
     * Setup the view object(s). This should be something we override when creating child controllers.
     *  
     * @function
     * 
     * @instance
     *
     * @override
     */
    setupView: function() {
      if (this.view) {
        this.setView(new this.view());
      } else {
        throw "'setupView' needs to be overridden";
      }
    },

    /**
     * Sets the element that a view delegates over and tells the view to render.
     *
     * @function
     * 
     * @instance
     * 
     * @param  {Element}  el
     * @param  {Object}   delegate
     *
     * @return {Object} 
     */
    setup: function(el, options) {
      options = _.defaults(options || {}, { delegate: this });
      this.getView().setElement(el);
      this.getView().setDelegate(options.delegate);
      this.getView().watchDelegateProperties();
      this.trigger('setup');
      this.trigger('view:ready');
      this.viewIsReady();
      
      return this;
    },

    /**
     * Called when the view is ready for manipulation.
     *
     * @function
     * 
     * @instance
     * 
     * @override
     */
    viewIsReady: function() {

    },

    render: function() {
      this.getView().render();
      this.getView().setRendered();
      this.trigger('view:render');
    },

    /**
     * Called once the view is avaiable for manipulation.
     *
     * @function
     *
     * @instance
     *
     * @override
     */
    viewIsAvailable: function() { /* Do nothing. */ },
    
    /**
     * Unload the view.
     *
     * @function
     * 
     * @instance
     * 
     * @param {Function} cb Callback when the view has unloaded
     */
    unload: function(cb) {
      if (this._unloaded !== true) {

        var unbind = this._unbind || [],
            fn     = null;

        while (unbind.length > 0) {
          unbind.pop().call(this);
        }

        this._unloaded = true;
        this.trigger('unload');
        this.getView().unload(cb);
      }
    },

    /**
     * Base validate function that should be overwritten in the extended controllers.
     *
     * @function
     *
     * @instance
     *
     * @override
     * 
     * @return {Bool}
     */
    validate: function() {
      return true;
    }

  });
  
  /**
   * @function Vertebrae.BaseController.extend
   *
   * @function
   * 
   * @static
   * 
   * @param  {Object} proto Prototype definition
   * 
   * @return {Constructor}   
   */
  BaseController.extend = function(proto) {

    Utils.mergeClassProperty(proto, this.prototype, 'observes');
    Utils.mergeClassProperty(proto, this.prototype, 'events');

    if (_.isObject(proto.validators) && !_.isFunction(proto.validate)) {
      proto.validate = function(filters, view) {
        return Validator(this, view, filters); 
      };
    }

    return BaseObject.extend.apply(this, arguments);
  };
/**
 * @namespace Vertebrae
 */


  var templates = {};
  var templateNamespaces = {};

  /**
   * Helper class for the project views.
   * 
   * @name BaseView
   * 
   * @class BaseView
   * 
   * @memberOf Vertebrae
   */
  var BaseViewTemp = Backbone.View.extend(/** @lends  Vertebrae.BaseView */{

    /**
     * Is the view rendered?
     * 
     * @type {Boolean}
     */
    rendered: false,

    /**
     * Is the view hidden?
     * 
     * @type {Boolean}
     */
    hidden: false,

    /**
     * Is the view available?
     * 
     * @type {Boolean}
     */
    available: false,

    /**
     * @function
     *
     * @instance
     *
     * @constructor
     */
    initialize: function() {
      // Binding the view object(this) to the functions defined inside the view.
      // This is getting after the prototype functionality.
      BaseEvent.bindAll(this);

      // Creating a temporary variable to hold the original initialization function.
      var oldInit = this.initialize;

      // Temporarily setting the initialize function to null.
      this.initialize = null;

      // Calling the constructor of the BaseObject to handle proper inheritence.
      BaseObject.call(this);

      // Setting the object's initialize function back to the original initialize function.
      this.initialize = oldInit;

      this.listenTo(this, 'change:hidden', this.refreshAvailable);
      this.listenTo(this, 'change:rendered', this.refreshAvailable);
    },

    /**
     * Destroying the view object.
     * 
     * @function
     * 
     * @instance 
     */
    destroy: function() {
      this._super.apply(this, arguments);
      
      // Removing the events from the element/view.
      this.undelegateEvents();
      
      // Destroying the element of the view.
      this.$el.empty();
      this.$el = null;
      this.el = null;
    },

    /**
     * Returns the delegate of the view.
     * 
     * @function
     * 
     * @instance
     * 
     * @return {Object}
     */
    getDelegate: function() {
      return this.delegate;
    },

    /**
     * Returns the data of an element.
     * 
     * @function
     * 
     * @instance
     * 
     * @param  {Object} el DOM object of the data we would like to return.
     * 
     * @return {String} 
     */
    getElementDatum: function(el) {
      return this.constructor.datum($(el).closest('.__data__').get(0));
    },

    /**
     * Setting the available property based off its current value.
     *
     * @function
     *
     * @instance
     */
    refreshAvailable: function() {
      if (!!this.isAvailable()) {
        this.setAvailable(true);
      } else {
        this.setAvailable(false);
      }
    },

    /**
     * Setting a deferred for when the view is available.
     *
     * @function
     *
     * @instance
     * 
     * @return {Deferred}
     */
    whenAvailable: function() {
      var d = $.Deferred();

      if (this.getAvailable()) {
        d.resolve(this);
      } else {
        this.listenToOnce(this, 'change:available', function() {
          d.resolve(this);
        });
      }

      return d.promise();
    },

    /**
     * Checking to make sure the view is available.
     *
     * @function
     *
     * @instance
     * 
     * @return {Boolean}
     */
    isAvailable: function() {
      if (this.isRendered() && !this.isHidden()) {
        return true;
      }

      return false;
    },

    /**
     * Getting the value for the available property.
     *
     * @function
     *
     * @instance
     * 
     * @return {Object}
     */
    getAvailable: function() {
      return this.get('available');
    },

    /**
     * Setting the value for the available property.
     *
     * @function
     *
     * @instance
     * 
     * @param  {Object} value
     * @param  {Object} noTrigger
     *
     * @return {Object}
     */
    setAvailable: function(value, noTrigger) {
      this.set('available', value, noTrigger);

      return this;
    },

    /**
     * Call this function to let the controller know that you are rendered.
     *
     * @function
     *
     * @instance
     *
     * @return {Object}
     */
    setRendered: function() {
      this.set('rendered', true);

      return this;
    },

    /**
     * Return a boolean that you rendered
     *
     * @function
     *
     * @instance
     * 
     * @return {Boolean}
     */
    isRendered: function() {
      return !!this.getRendered();
    },

    /**
     * Setting the hidden property.
     *
     * @function
     *
     * @instance
     * 
     * @param  {Boolean}  value
     * @param  {Object}   noTrigger
     *
     * @return {Object}
     */
    setHidden: function(value, noTrigger) {
      this.set('hidden', value, noTrigger);

      return this;
    },

    /**
     * Checking to see if the view is hidden.
     *
     * @function
     *
     * @instance
     * 
     * @return {Boolean}
     */
    isHidden: function() {

      return !!this.getHidden();
    },

    /**
     * Getting the current hidden property state.
     *
     * @function
     *
     * @instance
     * 
     * @return {Boolean}
     */
    getHidden: function() {
      return this.get('hidden');
    },

    /**
     * Get the current rendered property state.
     *
     * @function
     *
     * @instance
     * 
     * @return {Boolean} 
     */
    getRendered: function() {
      return this.get('rendered');
    },

    /**
     * Stub function to be overridden that should render html into the view's element.
     *
     * @function
     *
     * @instance
     */
    render: function() {

    },

    /**
     * Takes the handlebars output and converts it to a document fragment.
     * 
     * @function
     * 
     * @instance
     * 
     * @param  {String} template  String name of the handlebars template.
     * @param  {Object} datum     Data that we are binding to the handlebars template.
     * @param  {Bool}   attach    Do we want to attach this fragment to the newly created DOM?
     * 
     * @return {Object} 
     */
    renderFragment: function(template, datum, attach) {
      var frag  = $(document.createDocumentFragment()),
          div   = document.createElement('div');
          
      frag.append(this.constructor.template(template, datum, {}, this.templateNamespace));
      
      if (attach) {
        this.constructor.datum(frag.children().get(0), datum);
      }
      
      return frag;
    },

    /**
     * Takes the handles bars output and converts it to multiple document fragments.
     * 
     * @function
     * 
     * @instance
     * 
     * @param  {String} template  String name of the handlebars template.
     * @param  {Array}  data      Array of data that we are binding to the handlebars template.
     * @param  {Bool}   attach    Do we want to attach these fragments to the newly created DOM?
     * 
     * @return {Array}
     */
    renderFragments: function(template, data, attach) {
      var frag      = $(document.createDocumentFragment()),
          fragItem  = null,
          contenxt  = null,
          i         = 0;
          
      for (i = 0; i < data.length; ++i) {
        
        context = {
          index : i,
          first : i === 0,
          last  : i === data.length-1,
          even  : i%2 === 0,
          odd   : null
        };

        context.odd = !context.even;

        fragItem = $(this.constructor.template(template, data[i], { data: context }, this.templateNamespace));
        
        if (attach) {
          this.constructor.datum(fragItem.get(0), data[i]);
        }
        
        frag.append(fragItem);
      }
      
      return frag;
    },

    /**
     * Sets the delegate for a view. The delegate is typically a controller but is 
     * supposed to be whatevers gives the view its data.
     * 
     * @function
     * 
     * @instance
     * 
     * @param  {Object} delegate The delegate for this view.
     * 
     * @return {Object}
     */
    setDelegate: function(delegate) {
      this.delegate = delegate;
      
      return this;
    },

    /**
     * Return the template string by the given name.
     * 
     * @function
     * 
     * @instance
     * 
     * @param  {String}       name    Name of the handlebars template.
     * @param  {Object|Array} obj     Data to be passed to the DOM fragments/template.
     * @param  {Bool}         attach  Should we attach the rendered data to the DOM?
     * 
     * @return {String}
     */
    template: function(name, obj, attach) {
      if (!_.isString(name)) {
        //Scoot over the parameters to the left
        attach = obj;
        obj    = name;

        name   = this.templateName;
      }
      
      if (_.isArray(obj)) {
        return this.renderFragments(name, obj, attach);
      } else {
        return this.renderFragment(name, obj, attach);
      }
    },

    /**
     * Unloading the content of an elementing and calling the passed callback if it is a function.
     * 
     * @function
     * 
     * @instance
     * 
     * @param  {Function} cb Callback function to execute after the element is unloaded. 
     */
    unload: function(cb) {
      this.$el.empty();
      
      if (_.isFunction(cb)) {
        cb();
      }
    },
    
    /**
     * When the delegate for a view as been set, this is called so that the view can bind to property 
     * change events and do any necessary logic accordingly.
     * 
     * @function
     * 
     * @instance
     */
    watchDelegateProperties: function() { /* Do nothing. */ }

  });

  var BaseView = BaseObject.extend(BaseViewTemp.prototype);

  /**
   * Basic setup of the view object.
   * 
   * @function
   *
   * @param  {Object} element   The element we are doing the setup on.
   * @param  {Object} delegate  The controller for the view.
   * 
   * @return {Object}
   */
  BaseView.setup = function(element, delegate) {
    if (element instanceof $) {
      element = element.get(0);
    }
    
    var view = new this({ el: element });
    
    view.setDelegate(delegate);
    view.watchDelegateProperties();
    
    return view;
  };

  /**
   * Get or set the datum for an element.
   *
   * @function
   *
   * @param  {Object} el
   * @param  {Object} datum 
   * 
   * @return {Object}       
   */
  BaseView.datum = function(el, datum) {
    if (!el) {
      return undefined;
    }

    if (el instanceof $) {
      el = el.get(0);
    }
    
    // Check how many arguments were 
    // passed in so we know if we are 
    // setting.  Checking undefined 
    // means you cant set the data to 
    // undefined.
    if (arguments.length == 2) {
      el.__data__ = datum;
      $(el).addClass('__data__');
    }

    return el.__data__;
  };

  BaseView.getTemplates = function(namespace) {
    if (namespace) {
      return templateNamespaces[namespace] || {};
    }
    return templates || {};
  };

  /**
   * Apply the template object to the render helper.
   *
   * @function
   *
   * @param  {Object} newTemplates 
   */
  BaseView.setupTemplates = function(newTemplates, namespace) {
    if (_.isObject(newTemplates)) {
      if (_.isString(namespace)) {
        templateNamespaces[namespace] = newTemplates;
      } else {
        templates = newTemplates;
      }
    }
  };

  /**
   * Return a template with the given name and the given data.
   *
   * @function
   *
   * @param  {String} name  The name of the template you want to return.
   * @param  {Object} data  The data you want to pass into the template.
   * 
   * @return {String}       The processed string data returned from Handlebars.
   */
  BaseView.template = function(name, data, options, namespace) {
    var template = null;

    if (namespace) {
      template = (templateNamespaces[namespace] || {})[name];
    } else {
      template = templates[name];
    }

    if (template) {
      return template(data || {}, options);
    }

    return '';
  };

  /**
   * Check to see if a certain template exists;
   * @param  {String}  name 
   * @return {Boolean}      
   */
  BaseView.hasTemplate = function(name, namespace) {
    if (namespace) {
      if (templateNamespaces[namespace] && templateNamespaces[namespace][name]) {
        return true;
      }
      return false;
    }
    if (templates[name]) {
      return true;
    }
    return false;
  };

  BaseView.templateExists = BaseView.hasTemplate;

  /**
   * Extending the view object by mapping handlebar functions to instance functions that are usable inside the view.
   * 
   * @function
   *
   * @param  {Object} proto Default proto value when extending a view.
   * 
   * @return {Object}
   */
  BaseView.extend = function(proto) {

    _.each(proto.events, function(name, event) {
      if (String(name).indexOf('.') > -1) {
        var sections = name.split('.');

        proto.events[event] = function() {
          // get the function we are trying to call
          var fn = BaseObject.getPropertyByNamespace(this, name),
              //get the object that the function we got is attached to
              obj = BaseObject.getPropertyByNamespace(this, sections.slice(0, -1).join('.'));

          return fn.apply(obj, arguments);
        }
      }
    });

    if (_.isObject(proto.events) && !proto.overrideEvents) {
      if (_.isObject(this.prototype.events)) {
        proto.events = _.extend({}, this.prototype.events, proto.events);
      }
    }

    // Mapping the handlebar function(s) to the view.
    if (_.isObject(proto.templates)) {
      if (_.isObject(this.prototype.templates)) {
        proto.templates = _.extend({}, this.prototype.templates, proto.templates);
      }
      
      _.each(proto.templates, function(fnName, templateName) {
        if (!_.isFunction(proto[fnName])) {
          proto[fnName] = function(data, attach) {
            return this.template(templateName, data, attach);
          };
        }
      });
    }
    
    return BaseObject.extend.apply(this, arguments);
  };
/**
 * @namespace Vertebrae
 */


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

      var that             = this,
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

      return this.ajax(options)
        .then(function() {
          return that.processResponse.apply(that, arguments);
        })
        .then(function(payload) {
          var modelizer = that.getParser(uri, options.type) || that.defaultHandler;
          return that.resolve(modelizer.call(that, payload, params) || {}, params);
        });
    },

    processResponse: function(resp, textStatus, xhr) {
      if (this.getResponseDefaults()) {
        resp = _.defaults(resp || {}, this.getResponseDefaults());
      }
        // If we have a NULL response,= or it is not valid then we reject.
      if (!this.isValidResponse(resp || {}, textStatus, xhr)) {
        return this.reject(this.getResponseFailPayload(resp || {}));
      } else {
        // If it is valid, then we just return the response.
        return this.getResponseSuccessPayload(resp || {});
      }
    },

    ajax: function(options) {
      var d = $.Deferred();

      options.success = d.resolve;
      options.error   = d.reject;

      Backbone.ajax(options);

      return d.promise();
    },

    reject: function(resp) {
      return $.Deferred.reject(resp);
    },

    resolve: function(data, params, resp) {
      return $.Deferred().resolve(data, params, resp);
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
      return window.location.protocol + '//' + window.location.host + this.rootURI + uri;
    }

  });

  function createModelRequestMethods(map) {
    var routes       = {},
        createMethod = null,
        crud         = ['POST', 'GET', 'PUT', 'DEL'],
        crudMethods  = null;

    crudMethods  = {
      POST : 'requestCreate',
      GET  : 'requestOne',
      PUT  : 'requestUpdate',
      DEL  : 'requestDelete'
    };

    createMethod = function(options, route) {
      var sections     = String(route).trim().split(/\s+/),
          method       = String(sections[0]).trim().toLowerCase(),
          fn           = null,
          uri          = sections.slice(1).join('');


      if (_.isString(options)) {
        fn = options;
        options = null;
      } else if (_.isObject(options)) {
        fn = options.fn;
      } else  {
        throw new Error('The value of the model route mapping must be a string or an object.');
      }


      if (method == 'delete') {
        method = 'del';
      } else if (method == 'crud') {
        // if the crud method is given then we want to auto-generate the default crud interface
        // name = 'document', route = 'CRUD document'
        // generated functions:
        // requestCreateDocument -> POST document
        // requestOneDocument -> GET document/:$0
        // requestUpdateDocument -> PUT document/:id
        // requestDeleteDocument -> DEL document/:id
        _.each(crud, function(m) {
          var newRoute = m + ' ' + uri;

          switch (m) {
            case 'GET':
              newRoute += '/:$0';
              break;
            case 'PUT':
            case 'DEL':
              newRoute += '/:id';
              break;
          };

          createMethod(crudMethods[m] + StringUtils.camelCase(fn), newRoute);
        });
        // we don't actually want to create a method for CRUD so return
        return;
      }

      routes[fn] = function(params, opts) {
        var args     = arguments,
            counter  = 0,
            toDelete = [],
            data     = _.clone(params);

        var replacedUri = String(uri)
            .replace(/:[\$]?\w+/g, function(match) {
              var name  = match.slice(1),
                  value = null;

              if (name[0] == '$') {
                // if we have the $ then we use args for the data
                value = args[counter++];
                
                return value;
              } else if (data && data[name]) {
                value = data[name]; 
                toDelete.push(name);
                return value;
              } else {

                throw new Error('The route ' + route + ' must include ' + name + ' in your params');
              }
            });

        data    = _.clone(args[counter++]) || {};
        opts = _.clone(args[counter]) || {};

        _.each(toDelete, function(prop) {
          delete data[prop];
        });

        if (options) {
          _.defaults(opts, options);
        }

        return this[method](replacedUri, data, opts);
      };
    };

    _.each(map, createMethod);

    return routes;
  };


  /**
   * Parsing through the set of parsers to find the matching route.
   *
   * @function
   *
   * @static
   * 
   * @return {Object} Parser object with the matching route. Includes the callback function and type of parser.
   */
  function parseParsers(stat) {
    var rootURI = stat.rootURI;

    return _.map(stat.parsers || {}, function(fn, route) {
      var sections  = route.split(/\s+/),
          hasMethod = sections.length > 1,
          type      = hasMethod ? String(sections[0]).trim().toLowerCase() : null,
          route     = hasMethod ? sections.slice(1).join('') : sections.join('');

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
  };

  BaseModel.extend = function(proto, stat) {
    // See if the static properties has a parsers object.
    if (this.parsers && stat && stat.parsers) {
      stat._parsers = parseParsers(stat).concat(this._parsers || []);
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

    return BaseObject.extend.apply(this, arguments);
  };
/**
 * @namespace Vertebrae
 */


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
      
      this.$el = $(el);
      this.el = this.$el.get(0);
      this.setOptions(options || {});

      this.initializeControllerMappings();
      
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
          d          = $.when(),
          controller = null,
          len        = this.controllerMappings ? this.controllerMappings.length : 0,
          i          = 0;

      for (i = 0; i < len; ++i) {
        map = this.controllerMappings[i];
        controller = map.instance;

        controller.setup(this.$(map.selector));
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
      var controller = this.getContentController();

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

      controller.setup(el);

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
    canLeaveContentController: function() {
      return true;
    },

    canLoadContentController: function(Controller) {
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
            previousRouteDeferred = $.when(that.currentRouteDeferred).then(null, function() { return $.Deferred().resolve(); });


        return that.currentRouteDeferred = d = $.when(that.canLeaveContentController())
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
          // make sure the controller constructor is loaded
          return controllerD;
        }).then(function() {

          if (!that.canLoadContentController(Controller)) {

            return $.Deferred().reject(BaseApp.RouteErrors.DENIED);
          }
        }).then(function() {
          that.setActiveRoute(route);
          that.trigger('route', route);

          return that.hideController();
        }).then(function() {
          that.showLoading();
          return that.unloadController()
        }).then(function() {
          
          return that.destroyController();
        }).then(function() {
          controller = that.initializeController(Controller);

          that.setContentController(controller);
          that.trigger('init:contentController', controller);
          
          if (controller.start) {

            return controller.start.apply(controller, args);
          }
        }).then(function() {
          controller.trigger('data:ready');
          that.trigger('start:contentController', controller);
        }).always(function() {
          that.hideLoading();
        }).fail(function(reason) {

          switch (reason) {
            case BaseApp.RouteErrors.CANCELLED:
              return;
            case BaseApp.RouteErrors.DENIED:
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
      var d = this.setupControllerMappings();

      // setup the dynamic controller routes
      this.setupRoutes();

      this.trigger('start');

      return d;
    },

    routing: function() {
      if (!Backbone.history.start()) {
        this.navigate(this.getInitialRoute(), { trigger: true, replace: true });
      }
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
      CANCELLED: 'cancelled',
      DENIED: 'denied'
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

    // Copy over any existing controller mappings onto the proto controllerMappings
    Utils.mergeClassProperty(proto, this.prototype, 'controllerMappings');

    return BaseObject.extend.apply(this, arguments);
  };


  var Vertebrae = {
    Object     : BaseObject,
    App        : BaseApp,
    Controller : BaseController,
    View       : BaseView,
    Model      : BaseModel,
    Event      : BaseEvent,
    String     : StringUtils,
    Utils      : Utils,
    Validator  : Validator
  };


  var _Vertebrae  = win.Vertebrae,
      _V          = win.V;

  Vertebrae.noConflict = function(deep) {
    if (win.V === Vertebrae) {
      win.V = _V;
    }

    if (deep && win.Vertebrae === Vertebrae) {
      win.Vertebrae = _Vertebrae;
    }

    return Vertebrae;
  };

  if (typeof noGlobal === 'undefined') {
    win.Vertebrae = win.V = Vertebrae;
  }
  



  return Vertebrae;
  

}));