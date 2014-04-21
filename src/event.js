/**
 * @namespace Evisions
 */
define([
	'jquery'
], function($0) {
	var EVIEvent = {
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
		 * @param {String} event The name of the event that you want to fire.
		 * @param {Object} data The date you want to pass into the function listening to the passed event.
		 */
		fire: function(event, data) {
		  var d = $(document);

		  d.trigger.apply(d, arguments);
		},

		/**
		 * Set an event observer. Relates to the fire function. 
		 *
		 * @function
		 *
		 * @param {String} event The name of the event that you want to observe.
		 * @param {Function} callback The function you want to call if the observed event is fired.
		 */
		observe: function(event, callback) {
		  var doc = $(document).bind(event, callback);

		  return {
		    remove: function() {
		      doc.unbind(event, callback);
		    }
		  };
		}
	};

	return EVIEvent;
});