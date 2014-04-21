define([
  'underscore',
  './stringutils'
], function(_, StringUtils) {

  function getValidationErrorName(validationField) {
    return 'show' + StringUtils.camelCase(validationField) + 'Error';
  };

  function getValidationSuccessName(validationField) {
    return 'show' + StringUtils.camelCase(validationField) + 'Success';
  };

  function getValidationGetterName(validationField) {
    return 'get' + StringUtils.camelCase(validationField);
  };

  function makeFunction(cb) {
    return this.isFunction(cb)? cb: function() {};
  }

  var Validator = function(controller, view, filters) {
    var validators    = null,
        invalidItems  = null;

    if (!controller) { 
      return; 
    }
    if (!view) {
      view = controller.getView();
    }
    validators = controller.validators || {};

    invalidItems = _.chain(validators).map(function(middleware, validationField) {
      if (filters && !_.contains(filters, validationField)) {
        return true;
      }

      var getter  = makeFunction(view[getValidationGetterName(validationField)]),
          error   = makeFunction(view[getValidationErrorName(validationField)]),
          success = makeFunction(view[getValidationSuccessName(validationField)]),
          value   = '',
          ret     = false;

      value = getter.call(view);
      ret = this.validateValueWithMiddleware(value, validationField, middleware, controller);
      if (ret === true) {
        success.call(view);

        return true;
      } else {
        error.call(view, ret + '');

        return false;
      }
    }).reject(function(v) { return v; }).value();

    if (invalidItems.length) {
      return false;
    }

    return true;
  };

  Validator.validateValueWithMiddleware = function(value, field, middleware, controller) {
    if (_.isFunction(middleware)) {
      middleware = [middleware].concat($.makeArray(arguments).slice(2));
    } else if (!_.isArray(middleware)) {
      middleware = [];
    }

    var i   = 0,
        fn  = null,
        ret = false;

    for (i = 0; i < middleware.length; ++i) {
      fn = middleware[i];
      if (_.isString(fn)) {
        fn = controller[fn];
      }
      ret = fn.call(controller, value, field);
      if (ret !== true) {
        return ret;
      }
    }

    return true;
  }

  var validators = {};

  /**
   * Checking the length of a field.
   * 
   * @memberOf Evisions.Validator.Validation
   * @function
   * 
   * @param  {Integer} min
   * @param  {Integer} max
   * @param  {String} minMessage
   * @param  {String} maxMessage
   * 
   * @return {String|Boolean}
   */
  validators.checkLength = function(min, max, minMessage, maxMessage) {
    return function(value, field) {
      // DO NOT MODIFY -- if string is not required, this will invalidate validation
      if (value) {
        if (value.length < min) {
          return minMessage || 'This field must be a minimum length of ' + min + '.';
        }
        if (value.length > max) {
          return maxMessage || 'This field cannot have a length greater than ' + max + '.';
        }
      }
      return true;
    };
  };

  /**
   * Checking to make sure an email address is valid.
   * 
   * @memberOf Evisions.Validator.Validation
   * @function
   *
   * @param  {String} message
   * 
   * @return {String|Boolean}
   */
  validators.email = function(message) {
    return function(value, field) {
      var regex = /[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum|edu)\b/i;

      if (!value) {
        return true;
      }
      if (!regex.test(value)) {
        return message || 'An invalid email address was entered.';
      }

      return true; 
    }
  };

  /**
   * Checking to make sure a phone number is valid.
   * 
   * @memberOf Evisions.Validator.Validation
   * @function
   *
   * @param  {String} message
   * 
   * @return {String|Boolean}
   */
  validators.phone = function(message) {
    return function(value, field) {
      var regex = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;

      if (!value) {
        return true;
      }
      if (!regex.test(value)) {
        return message || 'An invalid phone number was entered.';
      }

      return true;
    };
  };


  /** 
   * Checking to make sure a postal code is valid.
   * US ONLY postal codes.
   * 
   * @param  {String} message
   * @param  {string} field
   * @return {boolean}
   */
  validators.postalCode = function(message){
    return function(value, field) {
      var regex = /^\d{5}(-\d{4})?$/g;

      if (!value) {
        return true;
      }
      if (!regex.test(value)) {
        return message || 'An invalid postal code was entered.';
      }

      return true;
    };
  };

  /**
   * An empty field validator.
   *
   * @memberOf Evisions.Validator.Validation
   * @function
   *
   * @param  {String} message
   *
   * @return {String|Boolean}
   */
  validators.empty = function(message) {
    return function(value, field) {
      if (!String(value == null ? '' : value).trim()) {
        return message || 'This field cannot be empty.';
      }

      return true;
    };
  };

  /**
   * A date field validator
   *
   * @param {String} message 
   *
   * @return {Function} 
   */
  validators.date = function(message) {
    message = message || 'This is an invalid date.';
    return function(date, field) {
      if (date) {
        try {
          var time = date.getTime();

          if (_.isNaN(time)) {

            return message;
          }
        } catch(e) {

          return message;
        }
      }

      return true;
    };
  };

  validators.number = function(message) {
    message = message || 'This is an invalid number.';
    return function(value, field) {
      if (String(value).length > 0 && _.isNaN(Number(value))) {

        return message;
      }
      
      return true;
    };
  };

  Validator.validators = validators;

  return Validator;

});