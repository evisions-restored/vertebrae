define(['backbone', 'underscore', 'evisions/helper'], function(Backbone, _, helper) {
  var EVIObject = function() {
    var that = this,
        properties = this.properties,
        i = 0;

    for (i = 0; properties && i < properties.length; i++) {
      (function(prop){
        var setter = function(value) {
             that.set(prop, value);
             return that;
            },
            getter = function() {
              return that.get(prop);
            },
            cameld = EVI.Helper.camelCase(prop);
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

  function createSuper(parentFunction, childFunction) {
    return function() {
      var oldSuper = this._super;
      this._super = parentFunction;
      var ret = childFunction.apply(this, arguments);
      this._super = oldSuper;
      return ret;
    };
  };

  function createSuperForOverriddenFunctions(parentProto, childProto) {
    var childKeys = _.keys(childProto),
        name = null,
        i = 0;
    for (i = 0; i < childKeys.length; ++i) {
      name = childKeys[i];
      if (_.isFunction(parentProto[name]) && parentProto[name] !== childProto[name]) {
        childProto[name] = createSuper(parentProto[name], childProto[name]);
      }
    }

  };

  EVIObject.extend = function(proto) {
    var newProperties = [],
        oldProperties = [];
    if (_.isArray(proto.properties)) {
      newProperties = proto.properties;
      if (_.isArray(this.prototype.properties)) {
        oldProperties = this.prototype.properties;
      }
      proto.properties = [].concat(newProperties, oldProperties);
    };

    var child = Backbone.View.extend.apply(this, arguments);
    createSuperForOverriddenFunctions(this.prototype, child.prototype);

    return child;
  };

  EVIObject.prototype = {
    //placeholder so nothing breaks
    _super: function() { return this; },

    set: function(k,v) {
      var trigger = this[k] != v;
      this[k] = v;
      if (trigger) {
        this.trigger('change:' + k);
      }
    },

    get: function(k) {
      return this[k];
    },

    destroy: function() {
      this.destroyed = true;
      this.stopListening();
    },

    applyProperties: function(jsonObject) {
      for (key in jsonObject) {
        var setterFn = "set" + EVI.Helper.camelCase(key);
        if (_.isFunction(this[setterFn])) {
          this[setterFn](jsonObject[key]);
        } else {
          this[key] = jsonObject[key];
        }
      }
    }

  };

  _.extend(EVIObject.prototype, Backbone.Events);
  
  return EVIObject;
});