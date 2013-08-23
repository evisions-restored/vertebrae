define([], function() {
  return {
    initialize: function(helper) {

      /**
       * @namespace Evisions.Helper.Validation
       */
      
      /**
       * Validator is a global field validator for use with controllers
       *
       * @memberOf Evisions.Helper.Validation
       * @function
       * 
       * @param {Evisions.EVIController} controller Any instance that has a validators object on it
       * @param {None | Evisions.EVIView} view       Tells if the fields defined by the validators object on the controller are valid or not
       * @param {None | Array} filters 
       *
       * @return {Boolean} 
       */
      helper.Validator = function(controller, view, filters) {
        var validators = null,
            invalidItems = null;

        if (!controller) { return; }

        if (!view) {
          view = controller.getView();
        }
        validators = controller.validators || {};

        invalidItems = _.chain(validators).map(function(middleware, validationField) {
          if (filters && !_.contains(filters, validationField)) {
            return true;
          }
          var getter = helper.makeFunction(view[getValidationGetterName(validationField)]),
              error  = helper.makeFunction(view[getValidationErrorName(validationField)]),
              success = helper.makeFunction(view[getValidationSuccessName(validationField)]),
              value = '',
              ret = false;
          value = getter.call(view);
          ret = helper.validateValueWithMiddleware(value, validationField, middleware, controller);
          if (ret === true) {
            success.call(view);
            return true;
          } else {
            //make sure it is a string
            error.call(view, ret + '');
            return false;
          }
        }).reject(function(v) { return v; }).value();

        if (invalidItems.length) {
          return false;
        }
        return true;
      };

      function getValidationErrorName(validationField) {
        return 'show' + helper.camelCase(validationField) + 'Error';
      }

      function getValidationSuccessName(validationField) {
        return 'show' + helper.camelCase(validationField) + 'Success';
      }

      function getValidationGetterName(validationField) {
        return 'get' + helper.camelCase(validationField);
      }

      helper.validateValueWithMiddleware = function(value, field, middleware, controller) {
        if (_.isFunction(middleware)) {
          middleware = [middleware].concat($.makeArray(arguments).slice(2));
        } else if (!_.isArray(middleware)) {
          middleware = [];
        }
        var i = 0,
            fn = null,
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
      };

      helper.validators = {};

      /**
       * Create an empty field validator with a custom message
       *
       * @memberOf Evisions.Helper.Validation
       * @function
       * 
       * @param  {String} message 
       * 
       * @return {Function} 
       */
      helper.validators.emptyCustom = function(message) {
        return function(value, field) {
          if (helper.validators.empty(value, field) !== true) {
            return message || 'This field cannot be empty.';
          }
          return true;
        };
      };

      /**
       * An email address validator
       * @param  {Object} value 
       * @param  {String} field 
       * @return {Boolean}       
       */
      helper.validators.email = function(value, field) {
        var regex = /[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum|edu)\b/i;
        return regex.test(value) || 'An invalid email address was entered.';
      },


      /**
       * An empty field validator.
       *
       * @memberOf Evisions.Helper.Validation
       * 
       * @param  {Object} value 
       * @param  {String} field 
       * 
       * @return {Boolean}       
       */
      helper.validators.empty = function(value, field) {
        if (!value) {
          return 'This field cannot be empty.';
        }
        return true;
      };
    }
  };
});