define([
  'underscore',
  './stringutils',
  './event'
], function(_, StringUtils, BaseEvent) {

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
          if (name == 'constructor') {
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
    }

  };

  return Utils;
});