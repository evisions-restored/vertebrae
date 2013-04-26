define(['underscore', 'evisions/object', 'evisions/helper'], function(_, EVIObject, helper) {

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

  var EVIController = EVIObject.extend({

    properties: ['view'],

  	initialize: function(options) {
      setupObserves(this);
      this.setupView();
  	},

    /**
     * Setup the view Object/Objects
     * 
     * @return {None} 
     */
    setupView: function() {

    },

    viewIsReady: function() {
      this.getView().render();
    },
    /**
     * Sets the element that a view delegates over and tells the view to render
     * 
     * @param  {Element} el
     * 
     * @return {None}
     */
    setupViewProperties: function(el, delegate) {
      this.getView().setElement(el);
      this.getView().setDelegate(delegate || this);
      this.getView().watchDelegateProperties();
      this.viewIsReady();
      return this;
    }

  });

  EVIController.extend = function(proto) {
    if (_.isObject(proto.observes)) {
      if (_.isObject(this.prototype.observes)) {
        proto.observes = _.extend({}, this.prototype.observes, proto.observes);
      }
    };

    if (_.isObject(proto.validators) && !_.isFunction(proto.validate)) {
      proto.validate = function(view) { return helper.Validator(this, view); }
    }

    return EVIObject.extend.apply(this, arguments);

  };

  return EVIController;
});