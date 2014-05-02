/*!
 * Vertebrae JavaScript Library v0.0.1
 *
 * Released under the MIT license
 *
 * Date: 2014-05-02T16:40Z
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
}(typeof window !== "undefined" ? window : this, function(window, noGlobal) {


  
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
/**
 * @namespace Vertebrae
 */


  function setupObserves() {
    var inst = this;
    
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

      this.once('unload', BaseEvent.observe(event, _.bind(inst[fnName], this)).remove);
    }
  };

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

      setupObserves.call(this);

      this.setupView();

      if (!this.getView()) {
        throw new Error('A view was not properly assigned.');
      }

      this.listenToOnce(this.getView(), 'change:available', this.viewIsAvailable);
    },

    /**
     * Keep properties on an object in sync with other properties and the view.
     *
     * @function
     *
     * @instance
     * 
     * @param  {String} property The property we want to look at.
     * @param  {Object} obj      The object whose properties we want to sync with.
     * @param  {Object} trigger  
     * 
     * @return {Object}          
     */
    sync: function(property, obj, trigger) {
      var fnController    = property + 'DidChange',
          that            = this,
          view            = this.getView(),
          hasListened     = false,
          camelProperty   = StringUtils.camelCase(property),
          getter          = null,
          updateOnAvaible = null,
          updateView      = null,
          getterFn        = 'get' + camelProperty,
          originalObj     = obj,
          fnView          = 'refresh' + camelProperty + 'PropertyOnView';

      // For the object we want to look at it can either be a passed in model OR just "this".
      obj = _.isObject(obj)? obj: this;

      // Gets the value for the property on the object we are watching.
      getter = function() {
        if (obj[getterFn]) {
          return obj[getterFn]();
        } else {
          return obj.get(property);
        }
      };

      // Update the view but only when the avaiable property has changed.
      updateOnAvaible = function() {
        if (hasListened) {
          return;
        }

        hasListened = true;
        that.listenToOnce(view, 'change:available', function() {
          hasListened = false;
          updateView();
        });
      };

      // Update the view but only if it is available else queue to update when avaiable changes.
      updateView = function() {
        if (that[fnView]) {
          if (view.getAvailable()) {
            that[fnView](getter());
          } else {
            updateOnAvaible();
          }
        }
      };

      // Listen to changes on the given object for the given property.
      this.listenTo(obj, 'change:' + property, function() {
        if (this[fnController]) {
          this[fnController](getter());
        }

        updateView();
      });

      // We want to immediately update the view to get it in sync with the state of the property we are watching.
      updateView();
      if (originalObj === true || trigger === true) {
        this.trigger('change:' + property);
      }

      return this;
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
      throw "'setupView' needs to be overridden";
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
    setupViewProperties: function(el, delegate) {
      this.getView().setElement(el);
      this.getView().setDelegate(delegate || this);
      this.getView().watchDelegateProperties();
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
      this.getView().render();
      this.getView().setRendered();
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
        this.trigger('unload');

        var unbind = this._unbind || [],
            fn     = null;

        while (unbind.length > 0) {
          unbind.pop().call(this);
        }

        this._unloaded = true;
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
    },

    /**
     * Creating a proxy for the jQuery when function and apply the passed arguments.
     *
     * @function
     *
     * @instance
     * 
     * @return {Object}
     */
    when: function() {
      return $.when.apply($, arguments);
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
    if (_.isObject(proto.observes)) {
      if (_.isObject(this.prototype.observes)) {
        proto.observes = _.extend({}, this.prototype.observes, proto.observes);
      }
    }

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
          
      frag.append(this.constructor.template(template, datum));
      
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

        fragItem = $(this.constructor.template(template, data[i], { data: context }));
        
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

  BaseView.getTemplates = function() {
    return templates || {};
  };

  /**
   * Apply the template object to the render helper.
   *
   * @function
   *
   * @param  {Object} newTemplates 
   */
  BaseView.setupTemplates = function(newTemplates) {
    if (_.isObject(newTemplates)) {
      templates = newTemplates;
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
  BaseView.template = function(name, data, options) {
    var template = templates[name];

    if (template) {
      return template(data || {}, options);
    }

    return '';
  };


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
        
        var replacedUri = String(uri).replace(escapeRegExp, '\\$&')
            .replace(/:\w+/g, function(match) {
              var name = match.slice(1);

              if (params && params[name]) {

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
   * @augments {Vertebrae.BaseObject}
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
      this.$el = $(el);
      this.el = this.$el.get(0);
      this.setOptions(options || {});
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
    getControllerElement: function() {
      return this.$el;
    },

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
          el              = this.getControllerElement(),
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
          return controller.start.apply(controller, args);
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
      this.setupRoutes();

      if (!Backbone.history.start()) {
        this.navigate(this.getInitialRoute(), { trigger: true, replace: true });
      }
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


  var Vertebrae = {
    Object     : BaseObject,
    App        : BaseApp,
    Controller : BaseController,
    View       : BaseView,
    Model      : BaseModel,
    Event      : BaseEvent
  };


  var _Vertebrae  = window.Vertebrae,
      _V          = window.V;

  Vertebrae.noConflict = function(deep) {
    if (window.V === Vertebrae) {
      window.V = _V;
    }

    if (deep && window.Vertebrae === Vertebrae) {
      window.Vertebrae = _Vertebrae;
    }

    return Vertebrae;
  };

  if (typeof noGlobal === 'undefined') {
    window.Vertebrae = window.V = Vertebrae;
  }
  



  return Vertebrae;
  

}));