/**
 * @namespace Vertebrae
 */
define([
  'jquery',
  'underscore',
  './object',
  './event',
  './stringutils'
], function(
  $, 
  _, 
  BaseObject, 
  BaseEvent, 
  StringUtils) {

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

  return BaseController;

});