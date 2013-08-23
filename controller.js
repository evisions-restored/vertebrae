define([
  'underscore', 
  'evisions/object', 
  'evisions/helper'
], function(_, EVIObject, helper) {

  function setupObserves(inst) {
    if (!_.isObject(inst.observes)) { return; }
    var observes = inst.observes,
        events = _.keys(observes),
        event = null,
        i = 0,
        fnName = null;
    for (i = 0; i < events.length; ++i) {
      event = events[i];
      fnName = observes[event];
      if (!_.isFunction(inst[fnName])) {
        throw new Error(fnName + ' does not exist for the global event ' + event);
      }
      helper.observe(event, inst[fnName].proxy(inst));
    }
  };

  /**
   * @class
   * @memberOf Evisions
   * @augments {Evisions.EVIObject}
   */
  var EVIController = EVIObject.extend(/** @lends  Evisions.EVIController */{

    properties: ['view'],

    initialize: function(options) {
      setupObserves(this);
      this.setupView();
    },

    /**
     * Destroy the controller
     *
     * @function
     * 
     * @instance
     */
    destroy: function() {
      if (this._unloaded !== true) {
        this.unload();
      }
      this.destroyView();
      this._super.apply(this, arguments);
    },

    /**
     * Destroy the view
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
     * Setup the view Object/Objects
     * 
     * @function
     * 
     * @instance
     */
    setupView: function() {},

    /**
     * Sets the element that a view delegates over and tells the view to render
     *
     * @function
     * 
     * @instance
     * 
     * @param {Element} el
     * @param {Object} delegate
     */
    setupViewProperties: function(el, delegate) {
      this.getView().setElement(el);
      this.getView().setDelegate(delegate || this);
      this.getView().watchDelegateProperties();
      this.viewIsReady();
      
      return this;
    },

    /**
     * Called when the view is ready
     *
     * @function
     * 
     * @instance
     * 
     * @override
     */
    viewIsReady: function() {
      this.getView().render();
    },
    
    /**
     * Unload the view
     *
     * @function
     * 
     * @instance
     * 
     * @param {Function} cb Callback when the view has unloaded
     */
    unload: function(cb) {
      if (this._unloaded !== true) {
        this._unloaded = true;
        this.getView().unload(cb);
      }
    }

  });
  
  /**
   * @function Evisions.EVIController.extend
   *
   * @function
   * 
   * @static
   * 
   * @param {Object} proto Prototype definition
   * 
   * @return {Constructor}   
   */
  EVIController.extend = function(proto) {
    if (_.isObject(proto.observes)) {
      if (_.isObject(this.prototype.observes)) {
        proto.observes = _.extend({}, this.prototype.observes, proto.observes);
      }
    }

    if (_.isObject(proto.validators) && !_.isFunction(proto.validate)) {
      proto.validate = function(view, filters) {
        return helper.Validator(this, view, filters); 
      };
    }

    return EVIObject.extend.apply(this, arguments);
  };

  return EVIController;
});