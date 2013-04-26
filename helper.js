/**
 * Creating a Global Helper Object 
 */
var EVI = EVI || {};
EVI.Helper = EVI.Helper || {};
define(['jquery', 'underscore', 'evisions/viewhelpers', 'library/styles/styles'], function($, _, Handlebars) { 
  (function(helper) {
    /**
     * Output Debug to a Console 
     */
    helper.debug = false;
    
    /**
     * Consoling a Debug Message if DEBUG Variable is TRUE and a Console Window Exists 
     */
    helper.debugMessage = function() {
      try {
        if (!EVI.Helper.debug || (!window.console && !window.console.firebug)) return;
      } catch(e) { return; } 
      try {
        console.log.apply(console, arguments);
      } catch(e) { return; }
    };
    
    /**
     * Redenering Javascript Templates to the DOM
     */
    helper.fastHtmlToDom = function() {
        var htmlBuilder = document.createElement("div");
        
        return function fastInsert(html) {
            htmlBuilder.innerHTML = html;
            return htmlBuilder.firstChild;
        };
    };
  
    helper.camelCase = function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    /**
     * Fire an Event
     */
    helper.fire = function(event, data) {
      $(document).trigger(event, data);
    };
    
    /**
     * Checking if the Page is Secure(HTTPS) 
     */
    helper.isSecure = function() {
      return (window.location.protocol == 'https:');
    };
        
    /**
     * Set an Event Observer 
     */
    helper.observe = function(event, callback) {
      $(document).bind(event, callback);
    };
  
    /**
     * Open a Popup Window 
     */    
    helper.openPopup = function(location, width, height) {
      day = new Date();
      id = day.getTime();
      eval("page" + id + " = window.open('" + location + "','" + id + "','toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=" + width + ",height=" + height + "');");
    };
  
    /**
     * Sending a Track Event to Google Analytics 
     */
    helper.track = function(category, action, label, value) {
      try {
        this.debugMessage([action, label, value]);
        _gaq.push(['_trackEvent', category, action, label, value]);
      } catch (e) { return; }
    };
    
    helper.requireArray = function(passedArr, fn) {
      var i = 0,
          s = null;
      for (i = 0; i < passedArr.length; ++i) {
        s = passedArr[i];
        if (_.isString(s) && s.slice(0, 2) == '//') {
          passedArr[i] = s.slice(2);
        }
        s = passedArr[i];
        if (_.isString(s) && s.slice(-3) == '.js') {
          passedArr[i] = s.slice(0, -3);
        }
      }
      require(passedArr, fn);
    };
  
    helper.bindAll = function(obj) {
      var i = 0,
          keys = [],
          fn = null;
      for(var k in obj) { keys.push(k) };
      if (!obj || !obj.constructor)
        return obj;
      
      for (i = 0; i < keys.length; ++i) {
        fn = obj[keys[i]];
        if (_.isFunction(fn) && keys[i] !== 'constructor' && _.contains(obj.constructor.prototype, fn)) {
          obj[keys[i]] = _.bind(fn, obj);
        }
      }
      return obj;
    };
  
    helper.deferred = function() {
      return $.Deferred();
    };


    //d3 datum:
    // return arguments.length ? this.property("__data__", value) : this.property("__data__");
    helper.datum = function(el, datum) {
      if (el instanceof $) {
        el = el.get(0);
      }
      if (datum !== undefined) {
        return el.__data__ = datum;
        // return d3.select(el).datum(datum);
      } else {
        return el.__data__;
        // return d3.select(el).datum();
      }
    };

    helper.unescapeHTML = function(string) {
      return $('<div/>').html(string).text();
    };
  
    Function.prototype.proxy = function(obj) {
      var fn = this;
      return function() {
        return fn.apply(obj, arguments);
      };
    };

    Function.prototype.d3proxy = function(obj) {
      var fn = this;
      return function() {
        var arr = [].concat([$(this)], $.makeArray(arguments));
        fn.apply(obj, arr);
      };
    };

    _.makeFunction = function(fn) {
      return _.isFunction(fn) ? fn : function() {};
    };

    //creats a fake event that gets triggered when the enter key is pressed
    $.event.special.enterkey = {
      delegateType: 'keypress',
      bindType: 'keypress',
      handle: function(event) {
        var ret,
            target = this,
            code = event.which != null ? event.which : event.keyCode,
            handleObj = event.handleObj,
            fn = handleObj.handler;
        if (code == 13) {
          event.type = handleObj.origType;
          ret = fn.apply(this, arguments);
          event.type = 'keypress';
        }
        return ret;
      }
    };

    /**
     * Validator is a global field validator for use with controllers
     * @param {Controller} controller Any instance that has a validators object on it
     * @param {Boolean} view       Tells if the fields defined by the validators object on the controller are valid or not
     */
    helper.Validator = function(controller, view) {
      var controller = controller,
          validators = null;
      if (!controller) { return; }
      if (!view) {
        view = controller.getView();
      }
      validators = controller.validators || {};

      var valid = _.chain(validators).map(function(middleware, validationField) {
        var getter = _.makeFunction(view[getValidationGetterName(validationField)]),
            error  = _.makeFunction(view[getValidationErrorName(validationField)]),
            success = _.makeFunction(view[getValidationSuccessName(validationField)]),
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

      if (valid.length) {
        return false;
      }
      return true;
    };

    function getValidationErrorName(validationField) {
      return 'show' + helper.camelCase(validationField) + 'Error';
    };

    function getValidationSuccessName(validationField) {
      return 'show' + helper.camelCase(validationField) + 'Success';
    };

    function getValidationGetterName(validationField) {
      return 'get' + helper.camelCase(validationField);
    };

    helper.validateValueWithMiddleware = function(value, field, middleware, controller) {
      if (_.isFunction(middleware)) {
        middleware = [middleware].concat($.makeArray(arguments).slice(2))
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

    helper.validators.emptyCustom = function(message) {
      return function(value, field) {
        if (helper.validators.empty(value, field) !== true) {
          return message;
        }
        return true;
      };
    };

    helper.validators.empty = function(value, field) {
      if (!value) {
        return helper.camelCase(field) + ' cannot be empty';
      }
      return true;
    };
  
  })(EVI.Helper);
  return EVI.Helper;
});