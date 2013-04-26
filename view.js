define(['backbone', 'handlebars.runtime', 'evisions/object', 'evisions/helper'], function(Backbone, handlebars, EVIObject, helper) {
  handlebars = handlebars || window.Handlebars;

  var EVIView = Backbone.View.extend({

    initialize: function() {
      EVI.Helper.bindAll(this);
    },

    /**
     * Sets the delegate for a view.  The delegate is typically a controller but is supposed to be whatevers gives the view its data.
     * @param {Object} delegate The delegate for this view
     */
    setDelegate: function(delegate) {
      this.delegate = delegate;
      return this;
    },

    /**
     * Returns the current delegate
     * @return {[type]} [description]
     */
    getDelegate: function() {
      return this.delegate;
    },

    /**
     * When the delegate for a view as been set, this is called so that the view can bind to property change events and do any necessary logic accordingly
     * 
     * @return {None} 
     */
    watchDelegateProperties: function() {
      
    },

    renderFragment: function(template, datum, attach) {
      var frag = $(document.createDocumentFragment()),
          div = document.createElement('div'),
          i = 0;
      frag.append(this.handlebars(template, datum));
      if (attach) {
        helper.datum(frag.children().get(0), datum);
      }
      return frag;
    },


    renderFragments: function(template, data, attach) {
      var frag = $(document.createDocumentFragment()),
          fragItem = null,
          i = 0;
      for (i = 0; i < data.length; ++i) {
        fragItem = $(this.handlebars(template, data[i]));
        if (attach) {
          helper.datum(fragItem.get(0), data[i]);
          fragItem.addClass('__data__');
        }
        frag.append(fragItem);
      }
      return frag;
    },

    getElementDatum: function(el) {
      return helper.datum($(el).closest('.__data__').get(0));
    },

    handlebars: function(name, obj) {
      var output = handlebars.templates[name];
      if (output) {
        return output(obj || {});
      } else {
        return '';
      }
    },
    
    /**
     * Return the template string by the given name and 
     * 
     * @param  {[type]} name [description]
     * @param  {[type]} obj  [description]
     * 
     * @return {[type]}      [description]
     */
    template: function(name, obj, attach) {
      if (!_.isString(name)) {
        obj = name;
        name = this.templateName;
      }
      if (_.isArray(obj)) {
        return this.renderFragments(name, obj, attach);
      } else {
        return this.renderFragment(name, obj, attach);
      }
    }
  },
  {
    setup: function(element, delegate) {
      if (element instanceof $) {
        element = element.get(0);
      }
      var view = new this({ el: element });
      view.setDelegate(delegate);
      return view;
    }
  });

  EVIView.extend = function(proto) {
    if (_.isObject(proto.events) && !proto.overrideEvents) {
      if (_.isObject(this.prototype.events)) {
        proto.events = _.extend({}, this.prototype.events, proto.events);
      }
    };
    //create "magic" template functions
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
    return EVIObject.extend.apply(this, arguments);
  };

  _.extend(EVIView.prototype, EVIObject.prototype);

  return EVIView;
});