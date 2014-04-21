/**
 * @namespace Evisions
 */
define([
  'backbone',
  'underscore',
  'evisions/object'
], function(Backbone, _, EVIObject) {

  var ArrayProto = Array.prototype;

  var Collection = function() {
    // We are calling this function staticly...need to return a new instance of itself.
    if (!(this instanceof Collection)) {
      // This allows us to initialize a constructor with a dynamic amount of arguments.
      return EVIObject.createWithArgs(arguments.callee, arguments);
    }

    
    var args = Array.apply(this, arguments);


    // Add any items to this collection.
    ArrayProto.push.apply(this, args[0]);

    // Add Events.
    _.extend(this, Backbone.Events);
    
    EVIObject.call(this, arguments);
    
    this.setupInitialItems(_.toArray(args[0]));

    return this;
  };

  // Add Array-like functionality.
  EVIObject.inherit(Collection, Array);


  /**
   * Passes in an array of items that are setup and the construction of the COllection
   * 
   * @param  {Array} items 
   */
  Collection.prototype.setupInitialItems = function(items) {

  };

  /**
   * Use the push method from Array and trigger the change event if something changed.
   *
   * @function
   * 
   * @instance
   * 
   * @return {Number} The new array length
   */
  Collection.prototype.push = function() {
    var length    = this.length,
        newLength = ArrayProto.push.apply(this, arguments);

    if (newLength !== length) {
      this.trigger('change:add');
      this.trigger('change');
    }

    for (var i = 0, len = arguments.length; i < len; ++i) {
      this.trigger('add', arguments[i]);
    }
    
    return newLength;
  };

  /**
   * Use the pop method from Array and trigger the change event if something changed.
   *
   * @function
   * 
   * @instance
   * 
   * @return {Object} The objected that was popped off the end.
   */
  Collection.prototype.pop = function() {
    var length    = this.length,
        ret       = ArrayProto.pop.apply(this, arguments),
        newLength = this.length;

    if (newLength !== length) {
      this.trigger('change:remove');
      this.trigger('change');
    }

    if (ret) {
      this.trigger('remove', ret);
    }

    return ret;
  };

  /**
   * Use the shift method from Array and trigger the change event if something changed.
   * 
   * @return {Object} The object that was shifted off the end
   */
  Collection.prototype.shift = function() {
    var length    = this.length,
        ret       = ArrayProto.shift.apply(this, arguments),
        newLength = this.length;

    if (newLength !== length) {
      this.trigger('change:remove');
      this.trigger('change');
    }

    if (ret) {
      this.trigger('remove', ret);
    }
    
    return ret;
  };

  /**
   * Use the splice method from Array and trigger the change event if something changed.
   * 
   * @param  {Number} index The index of the splice
   * @param  {Number} howMany How many items you want to splice
   * 
   * @return {Array} The spliced items.
   */
  Collection.prototype.splice = function(index, howMany, add) {
    var length    = this.length,
        ret       = ArrayProto.splice.apply(this, arguments),
        change    = false,
        argCount  = arguments.length - 2;

    if (argCount > 0) {
      this.trigger('change:add');
      change = true;
      for (var i = 0, len = add.length; i < len; ++i) {
        this.trigger('add', add[i]);
      }
    }

    if (howMany > 0 && length > 0) {
      this.trigger('change:remove');
      change = true;
    }

    if (change) {
      this.trigger('change');
    }

    if (ret && ret.length) {
      for (var i = 0, len = ret.length; i < len; ++i) {
        this.trigger('remove', ret[i]);
      }
    }

    return ret;
  };

  // Copy Functions from EVIObject to Collection
  Collection.prototype.initialize        = EVIObject.prototype.initialize;
  Collection.prototype._super            = EVIObject.prototype._super;
  Collection.prototype.set               = EVIObject.prototype.set;
  Collection.prototype.get               = EVIObject.prototype.get;
  Collection.prototype.applyProperties   = EVIObject.prototype.applyProperties;
  Collection.prototype.destroy           = EVIObject.prototype.destroy;
  Collection.prototype.destroyProperties = EVIObject.prototype.destroyProperties;
  Collection.prototype.getProperties     = EVIObject.prototype.getProperties;

  Collection.extend = EVIObject.extend;

  return Collection;
});