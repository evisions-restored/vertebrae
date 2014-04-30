/**
 * @namespace Vertebrae
 */
define([
  'backbone', 
  './object', 
  './event'
], function(
  Backbone, 
  BaseObject, 
  BaseEvent) {

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

  return BaseView;
});