/* jshint forin:true, eqnull:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, unused:true, curly:true, browser:true, devel:true, jquery:true, indent:2, maxerr:50 */
/* global define, Modernizr, require, helpURL */

/**
 * Creating a Global Helper Object 
 *
 * @namespace Evisions.Helper
 */
var EVI = EVI || {};
EVI.Helper = EVI.Helper || {};
define([
  'jquery', 
  'underscore', 
  'bootstrap', 
  'evisions/validator', 
  'evisions/viewhelpers',
  'handlebars.runtime',
  'evisions/styles'
], function($, _, bootstrap, validator, viewhelpers, handlebars) { 

  handlebars = handlebars || window.Handlebars;
  
  (function(helper) {
  
    // Initializing the validators for the global helper.
    validator.initialize(helper);
    // Initializing the view helpers for the global helper.
    viewhelpers.initialize(helper);

    // Are we going to display the debug to the console?
    helper.debug = true;
    
    /**
     * Bind all the function on an object to the obj itself.  This will cause all functions to ALWAYS have the correct 'this'
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param  {Object} obj 
     * 
     * @return {Object}     
     */
    helper.bindAll = function(obj) {
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
    };
    
    /**
     * Return the input string with the first letter capitalized
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param {String} str The string you would like to camel case; most likely a variable name or function name.
     * 
     * @return {String}     
     */
    helper.camelCase = function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    helper.camelCaseFromNamespace = function(str) {
      str = str.split('.');
      for (var i = 0; i < str.length; i++) {
        str[i] = helper.camelCase(str[i]);
      }
      return str.join('');
    },


    helper.formatNumber = function(num) {
      var sections = String(num).split('.'),
          number   = sections[0] || '0',
          decimal  = sections[1] || '',
          strArr   = number.split('').reverse(),
          arr      = [],
          finalStr = ''
          
      if (number.length <= 3) {
        return String(num);
      }

      while (strArr.length) {
        arr.push(strArr.splice(0, 3).reverse().join(''));
      }

      finalStr = arr.reverse().join(',');

      if (decimal) {
        finalStr += '.' + decimal;
      }

      return finalStr;
    };
  
    /**
     * Get or set the datum for an element
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param  {Object} el
     * @param  {Object} datum 
     * 
     * @return {Object}       
     */
    helper.datum = function(el, datum) {
      if (el instanceof $) {
        el = el.get(0);
      }
      
      if (datum !== undefined) {
        el.__data__ = datum;
      }

      return el.__data__;
    };

    /**
     * Consoling a debug message if DEBUG variable is TRUE and a console window exists.
     * 
     * @memberOf Evisions.Helper
     * 
     * @function
     */
    helper.debugMessage = function() {
      try {
        if (!EVI.Helper.debug || (!window.console && !window.console.firebug)) { 
          return; 
        }
      } catch(e) { return; }

      try {
        console.log.apply(console, arguments);
      } catch(e) { return; }
    };

    helper.debugMessage = _.bind(console.log, console);

    /**
     * Proxy for UnderscoreJS defer function.
     * 
     * @memberOf Evisions.Helper
     * 
     * @function
     *
     * @return {Object} 
     */
    helper.defer = function() {
      return _.defer.apply(_, arguments);
    };

    /**
     * Create a deferred object
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @return {Object} 
     */
    helper.deferred = function() {
      var d               = $.Deferred(),
          cancelled       = false,
          cancelCallbacks = $.Callbacks("once memory"),
          resolve         = d.resolve,
          reject          = d.reject,
          rejectWith      = d.rejectWith,
          resolveWith     = d.resolveWith;

      // Proxy all the deferred functions and add the ability to cancel them.
      d.resolve = function() {
        if (cancelled === false) {
          return resolve.apply(this, arguments);
        }
        return d;
      };

      d.reject = function() {
        if (cancelled === false) {
          return reject.apply(this, arguments);
        }
        return d;
      };

      d.rejectWith = function() {
        if (cancelled === false) {
          return rejectWith.apply(this, arguments);
        }
        return d;
      };

      d.resolveWith = function() {
        if (cancelled === false) {
          return resolveWith.apply(this, arguments);
        }
        return d;
      };

      d.cancel = cancelCallbacks.add;

      d.cancel(function() { cancelled = true; });

      d.doCancel = cancelCallbacks.fireWith;

      return d;
    };

    /**
     * Destroy the custom scroll.
     *
     * @function
     * 
     * @memberOf Evisions.Helper
     */
    helper.destroyScroll = function(el) {
      if (!helper.isTouchDevice() && $.fn.mCustomScrollbar) {
        el.mCustomScrollbar('destroy');
      }
    };

    var calculationDropDownPosition = function(el, options) {
      // Setup the element options.
      options.vertical = options.vertical || 'bottom';
      options.horizontal = options.horizontal || 'left';
      options.offset = options.offset || {top: 0, left: 0};
      var ddWidth       = el.width(), 
          btHeight      = options.element.height(),
          docHeight     = $(document).height();

      el.find("ul").css("max-height",docHeight/2 - 2*btHeight - (btOffLeft || 0));

      var ddHeight      = el.height(),
          btWidth       = options.element.width(),
          btOffLeft     = options.element.offset().left,
          btOffTop      = options.element.offset().top,
          finalOffsets  = {top:0, left:0},
          vertCaret     = "", 
          horizCaret    = "";
          // Do some overriding of vertical/horizontal to check if the element will be off the screen and do the opposite.
          calculateVert = function(pos) {
            if (pos === 'top') {
              vertCaret = "bottom";
              
              // The menu goes above the element button.
              finalOffsets.top = btOffTop - ddHeight - btHeight;
            } else {
              vertCaret = "top";
              
              // The menu goes below the element button.
              finalOffsets.top = btOffTop + btHeight;
            }
          },
          calculateHoriz = function(pos) {
            if (pos === 'left') {
              horizCaret = "Right";
               
              // The menu goes to the left of the element.
              finalOffsets.left = btOffLeft-ddWidth+btWidth;
            } else {
              horizCaret = "Left";
               
              // The menu goes to the right of the element.
              finalOffsets.left = btOffLeft;
            } 
          };

      calculateVert(options.vertical);
      calculateHoriz(options.horizontal);

      // Did going down cut me off?
      if (options.vertical === 'bottom') {
        if (docHeight < finalOffsets.top + ddHeight) {
          calculateVert('top');
        }
      } else {
        // Did going up cut me off
        if (0 > finalOffsets.top){//} - ddHeight*1.5) { this used to be part of the condition, not sure why
          calculateVert('bottom');
        }
      }

      // Did going right cut me off?
      if (options.horizontal === 'right') {
        if ($(document).width() < finalOffsets.left + ddWidth) {
          calculateHoriz('left');
        }
      } else {
        // Did going left cut me off?
        if (0 > finalOffsets.left) {//} - ddWidth * 1.5) { this used to be part of the condition, not sure why
          calculateHoriz('right');
        }
      }

      finalOffsets.left += options.offset.left;
      finalOffsets.top += options.offset.top;

      el.css(finalOffsets);
      el.removeClass('topLeft').removeClass('topRight').removeClass('bottomRight').removeClass('bottomLeft');
      el.addClass(vertCaret + horizCaret);
    };

    helper.repositionDropDown = function() {
      if (helper._repositionFn) {
        helper._repositionFn();
      }
    };


    /**
     * Helper to handle showing a dropdown.
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param {Object} pos Contains the options that tell the dropdown how to display, (element:el, horizontal, vertical:(top|bottom), offset, top:px,left:px).
     * @param {Array} items The array of options to show.
     * 
     * @return {Deferred} A deffered for when done.
     */
    helper.dropdown = function(options, items) {
      var dd    = '<div class="evi-dropdown"><ul>',
          d     = helper.deferred(),
          body  = $(document.body),
          name  = null,
          item  = null,
          sameElement = helper._ddLastElement == options.element.get(0);
      //do i have the ability to close an existing dropdown?  if so, then do it
      if (options.ignoreIfSameElementShown && sameElement) {
        return d.reject();
      }
      //do i have the ability to close an existing dropdown?  if so, then do it
      if (helper._closeFn) {
        helper.dropdownClose();
        //did i close the one im about to just open?  if so then just exit.  dont reopen dropdowns we just closed
        if (sameElement) {
          d.reject();
          return d;
        }
      }

      helper._ddLastElement = options.element ? options.element.get(0) : null;

      for (var i = 0; i < items.length; ++i) {
        item = items[i];
        
        // If we have an item then add an entry.
        if (item) {
          if (item.name) {
            name = item.name;
          } else {
            name = item;
          }
          var classText = "";
          if (item.class) {
            classText = 'class="'+item.class+'"'
          }

          if (item.offset) {
            dd += '<li '+classText+' style="padding-left:' + (10 + item.offset) + 'px" data-index="' + i + '" tabindex="' + i + '"><span>';
          } else {
            dd += '<li '+classText+' data-index="' + i + '"><span>';
          }
          if (item.icon) {
            dd += ' <i class="icon-' + item.icon + '"></i>';
          }
          dd += name;
          dd += '</span></li>';
        } else {
          // If we have a falsy item then add a divider.
          dd += '<li class="divider"></li>';
        }
      }
      dd += '</ul></div>';
      
      var el = $(dd);

      if (options.container) {
        options.container.append(el);
      } else {
        body.append(el);
      }

      if (options.element && !options.container) {
        calculationDropDownPosition(el, options || {});
      } else {
        el.css({ 
          top: options.top, 
          left: options.left 
        });
      }

      if (options.caret) {
        el.addClass(options.caret);
      }

      if (options.customScroll) {
        helper.setupScroll(el.children());
      }

      // Internal function to close a dropdown
      helper._closeFn = function() {
        if (d.state() !== 'resolved') {
          d.reject();
        }
        helper._ddLastElement = null;
        el.off('click');
        el.remove();
      };

      // Internal function to reposition a dropdown
      helper._repositionFn = function() {
        if (options.parent && options.element) {
          if (options.element.offset().top < options.parent.offset().top) {
            return helper.dropdownClose();
          }
        }
        calculationDropDownPosition(el, options || {});
      };

      _.defer(function() { 
        body.one('click', function(ev) {  
          ev.preventDefault(); 
          ev.stopPropagation(); 
          helper.dropdownClose(); 
        }); 
      });
      el.one('click', 'li', function(ev) {
        ev.originalEvent.DropDownMenuClick = true;
        var canResolve  = false,
            index       = null;
            
        try {
          index = Number(ev.currentTarget.attributes['data-index'].value);
          if (!_.isNaN(index)) {
            canResolve = true;
          }
        } catch (e) { /* Do nothing. */ }
        
        if (canResolve) {
          return d.resolve(index);
        } else {
          return d.reject(-1);
        }
      });
      
      el.css('display', 'inline-block');
      
      return d;
    };

    /**
     * Closing the opened dropdown.
     * 
     * @memberOf Evisions.Helper
     * 
     * @function
     */
    helper.dropdownClose = function() {
      if (helper._closeFn) {
        //remove the body's "hide dd on click" event.  just in case it wasnt triggered via click
        $("body").unbind("click");
        helper._closeFn();
        helper._closeFn = null;
        helper._repositionFn = null;
      }

      // Close all open connection lists
      $('.connectionDropdown .dropdown-menu').hide();
    };

    /**
     * Proxy for UnderscoreJS extend function.
     * 
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @return {Object} 
     */
    helper.extend = _.extend;

    helper.contains = _.contains;

    helper.isNaN = _.isNaN;

    /**
     * Copy the underscore pluck function onto the helper
     */
    helper.pluck = _.pluck;


    /**
     * Clone an array.
     * 
     * @param  {Array} arr  
     * @param  {Boolean} deep Do you want to do a recursive clone?
     * 
     * @return {Array}      
     */
    helper.cloneArray = function(arr, deep) {
      if (deep === true) {
        var i      = 0,
            len    = arr.length,
            newArr = [],
            item   = null;

        for (i = 0; i < len; ++i) {
          item = arr[i];
          if (helper.isArray(item)) {
            newArr.push(helper.cloneArray(item, deep));
          } else {
            newArr.push(item);
          }
        }
        return newArr;
      }
      return arr.slice(0);
    };

    /**
     * Rendering javascript templates to the DOM.
     * 
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @return {Object} 
     */
    helper.fastHtmlToDom = function() {
      var htmlBuilder = document.createElement("div");
        
      return function fastInsert(html) {
        htmlBuilder.innerHTML = html;
        return htmlBuilder.firstChild;
      };
    };
    
    /**
     * Fire an event. This relates to the observe helper function.
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     */
    helper.fire = function(event, data) {
      var d = $(document);
      d.trigger.apply(d, arguments);
    };
    
    /**
     * Will iterate through the given array with the given iterator function.  
     * If the iterator returns a deferred then the next item in the array will not be called until that deferred is resolved.
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param {Array} models The array you want to iterate through.
     * @param {Function} cb The iterator function to call with each item in the array.
     * 
     * @return {Deferred} Will be resolved after all items of the array have been resolved.
     */
    helper.forEachSeries = function(models, cb) {
      var d         = helper.deferred(),
          currentD  = null,
          index     = 0,
          resolver  = null;

      cb = helper.makeFunction(cb);

      resolver = function() {
        if (index === models.length) {
          return d.resolve();
        }
        currentD = cb(models[index], index);
        index++;
        if (currentD && currentD.done && currentD.fail) {
          currentD
              .fail(d.reject)
              .done(resolver);
        } else {
          resolver();
        }
      };
      resolver();
      
      return d;
    };

    /**
     * Generates a new name that does not equale the names of the exclude list.
     * Used when creating new folders and we do not want the same name as any siblings.
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param  {String} type        
     * @param  {Array} excludeList 
     * 
     * @return {String}             
     */
    helper.generateNewName = function(type, excludeList) {
      var newName   = 'New ' + type,
          checkName = newName,
          index     = 1;
          
      while (_.contains(excludeList, checkName)) {
        checkName = newName + ' ' + index;
        index++;
      }
      
      return checkName;
    };

    /**
     * Generates a help url.
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param {String|Null} id The help id to insert into the help link.
     * 
     * @return {String}    
     */
    helper.helpLink = function(id) {
      return helpURL + (id ? ('#CSHID=' + id) : '');
    };

    /**
     * Proxy for UnderscoreJS invoke function.
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @return {Object}
     */
    helper.invoke = function() {
      return _.invoke.apply(_, arguments);
    };

    /**
     * Is the current user on a device with an ARM processor?
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @return {Boolean}
     */
    helper.isARMDevice = function() {
      try {
        return (navigator.userAgent.toLowerCase().search('arm') > 1);
      } catch (e) { /* Do nothing. */ }
      
      return false;
    };
    
    /**
     * Is the current variable(s)/argument(s) an array?
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     *
     * @return {Boolean}
     */
    helper.isArray = function() {
      return _.isArray.apply(_, arguments);
    };

    helper.isObject = _.isObject;

    /**
     * Is the given variable/argument a function?
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     *
     * @return {Boolean}
     */
    helper.isFunction = function() {
      return _.isFunction.apply(_, arguments);
    };

    /**
     * Is the current user on a MAC desktop? 
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     *
     * @return {Boolean} 
     */
    helper.isMacDesktop = function() {
      if (navigator !== undefined) {
        return (navigator.appVersion.indexOf("Mac") !== -1);
      }
      
      return false;
    };

    /**
     * Is the current page secure? 
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     *
     * @return {Boolean} 
     */
    helper.isSecure = function() {
      return (window.location.protocol === 'https:');
    };

    /**
     * Is the current user on a tablet device?
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @return {Boolean} 
     */
    helper.isTabletDevice = function() {
      return helper.isTouchDevice() || helper.isARMDevice();
    };

    /**
     * Is the user on a touch enabled device?
     * 
     * @memberOf Evisions.Helper
     * 
     * @function
     *
     * @return {Boolean} 
     */
    helper.isTouchDevice = function() {
      return ((!Modernizr.touch)? false: true);
    };

    /**
     * Load all the images in the specified array of image paths and resolve the deferred when done.
     * 
     * @param {Array} images 
     * 
     * @return {Object}        
     */
    helper.loadImages = function(images) {
      images = helper.isArray(images)? images: [];
      
      var d     = helper.deferred(),
          index = 0;

      var load = function() {
        if (index === images.length) {
          d.resolve();
        } else {
          $(new Image()).attr('src', images[index]).load(load).error(load);
          index++;
        }
      };
      load();
      
      return d;
    };

    /**
     * Returns the same object but with the first letter for every key lowercased
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param {Object} object 
     * 
     * @return {Object}    
     */
    helper.lowerKeyCase = function(object) {
      var ret     = {},
          newKey  = null;
          
      _.each(object, function(value, key) {
        if (key) {
          newKey = key[0].toLowerCase() + key.slice(1);
          ret[newKey] = value;
        } else {
          ret[key] = value;
        }
      });
      
      return ret;
    };

    /**
     * Will gaurantee that the given value is a function.
     * 
     * @param {Function} cb 
     * 
     * @return {Function}      
     */
    helper.makeFunction = function(cb) {
      return _.isFunction(cb)? cb: function() {};
    };

    /**
     * Set an event observer. Relates to the fire function. 
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     */
    helper.observe = function(event, callback) {
      var doc = $(document).bind(event, callback);
      return {
        remove: function() {
          doc.unbind(event, callback);
        }
      };
    };


    helper.toLowerCase = function(v) {
      return String(v).toLowerCase();
    };
  
    /**
     * Open a Popup Window 
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     *
     * @return {Object} 
     */    
    helper.openPopup = function(location, width, height) {
      var day = new Date(),
          id  = day.getTime();

      return window.open(location, id, "toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,resizable=1,width=" + width + ",height=" + height);
    };
    
    /**
     * Helper parse positioning strings and return their corresponding information
     *
     * @example "right+5 center-20" => { horizontal: 'right', horizontalOffset: 5, vertical: 'center', verticalOffset: -20 }
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @static
     * 
     * @param {String} position 
     * 
     * @return {Object}          
     */
    helper.parsePositionString = function(position) {
      position = position || 'center';

      var positions = position.split(' '),
          offsetRegExp              = /[+-]{1}\d+/,
          positionRegExp            = /^\w+/,
          horizontalPositionString  = positions[0],
          verticalPositionsString   = positions[1] || positions[0],
          horizontalMatch           = horizontalPositionString.match(positionRegExp) || '',
          verticalMatch             = verticalPositionsString.match(positionRegExp) || '';

      return {
        horizontal       : horizontalMatch.toString() || 'center',
        vertical         : verticalMatch.toString() || '',
        horizontalOffset : parseInt(horizontalPositionString.match(offsetRegExp), 10) || 0,
        verticalOffset   : parseInt(verticalPositionsString.match(offsetRegExp), 10) || 0
      };
    };

    /**
     * Position an element based of a config options
     *
     * @memberOf Evisions.Helper
     * @function
     * @static
     * 
     * @param  {String | jQuery} o Positioning options
     * 
     * @return {Boolean}   Did the element get positioned successfully?
     */
    helper.position = function(o) {
      var of      = $(o.of),
          target  = o.target;

      if (!of.length) {
        return false;
      }
      if (!target || !target.length) {
        return false;
      }

      var offset          = of.offset(),
          ofWidth         = of.outerWidth(),
          ofHeight        = of.outerHeight(),
          targetWidth     = target.outerWidth(),
          targetHeight    = target.outerHeight(),
          targetPosition  = helper.parsePositionString(o.my),
          ofPosition      = helper.parsePositionString(o.at);

      switch (targetPosition.horizontal) {
        case 'left':
          // Do nothing for left position.
          break;
        case 'right':
          offset.left -= targetWidth;
          break;
        default:
          offset.left -= (targetWidth/2);
          break;
      }
      offset.left += targetPosition.horizontalOffset;
      
      switch (targetPosition.vertical) {
        case 'top':
          // Do nothing for top position.
          break;
        case 'bottom':
          offset.top -= targetHeight;
          break;
        default:
          offset.top -= (targetHeight/2);
          break;
      }
      offset.top += targetPosition.verticalOffset;
      
      switch (ofPosition.horizontal) {
        case 'left':
          // Do nothing for left position.
          break;
        case 'right':
          offset.left += ofWidth;
          break;
        default:
          offset.left += (ofWidth/2);
          break;
      }
      offset.left += ofPosition.horizontalOffset;
      
      switch (ofPosition.vertical) {
        case 'top':
          // Do nothing for top position.
          break;
        case 'bottom':
          offset.top += ofHeight;
          break;
        default:
          offset.top += (ofHeight/2);
          break;
      }
      offset.top += ofPosition.verticalOffset;
      
      target.offset(offset);
      
      return true;
    };
    
    /**
     * Take an array of RequireJS module paths and call the callback once they are done loading.
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @async
     * 
     * @param {Array} passedArr 
     * @param {Function} fn        
     * 
     * @return {None}             
     */
    helper.requireArray = function(passedArr, fn) {
      var i = 0,
          s = null;

      for (i = 0; i < passedArr.length; ++i) {
        s = passedArr[i];
        if (_.isString(s) && s.slice(0, 2) === '//') {
          passedArr[i] = s.slice(2);
        }

        s = passedArr[i];
        if (_.isString(s) && s.slice(-3) === '.js') {
          passedArr[i] = s.slice(0, -3);
        }
      }
      
      require(passedArr, fn);
    };
    
    /**
     * Will resolve a deferred after the returned function is called as many times as the given count.
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param  {Deferred} deferred The deferred you want to resolve after the returned function is called "count" amount of times.
     * @param  {Number} count The amount of times you want the returned function to be called before the given deferred is resolved.
     * 
     * @return {Function} The function to call for each item of count.
     */
    helper.resolveAfter = function(deferred, count) {
      var extraArgs = $.makeArray(arguments).slice(2),
          current   = 0,
          resolver  = null;

      resolver = function() {
        current++;
        if (current === count) {
          deferred.resolve.apply(deferred, extraArgs);
        }
      };

      return resolver;
    };

    /**
     * Tells us if the given template name exists or not.
     *
     * @memberOf Evisions.Helper
     *
     * @function
     * 
     * @param  {String} name The template name.
     * 
     * @return {Boolean}      
     */
    helper.templateExists = function(name) {
      return !!handlebars.templates[name];
    };

    /**
     * Setup HTML classes on the body. Should be called when the main app loads.
     *
     * @memberOf Evisions.Helper
     * 
     * @return {None} 
     */
    helper.setupHTML = function() {
      var body = $(document.body);
      
      if (helper.isTouchDevice()) {
        body.addClass('yes-touch');
      } else {
        body.addClass('no-touch');
      }
    };

    /**
     * Sort an array of items by a specific property or function.
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param {Array} items   
     * @param {String} prop    
     * @param {Boolean} reverse Should we sort them in reverse?
     * 
     * @return {Array}         
     */
    helper.sortByProperty = function(items, prop, reverse) {
      var newItems =_.sortBy(items, function(item) {
        var val = _.result(item, prop);

        if (val == null) {
          return '     ';
        }

        if (_.isString(val)) {
          return val.toUpperCase();
        } else {
          return val;
        }
      });
      if (reverse) {
        newItems = newItems.reverse();
      }
      
      return newItems;
    };

    /**
     * Splits a an encoded path string by '.' while taking quotes into account
     * 
     * @example
     * 'Banner.Training.Test' => ['Banner', 'Training', 'Test']
     *
     * @memberOf Evisions.Helper
     * @function
     * 
     * @param  {String} path The path string to split
     * 
     * @return {Array} The path string as an array
     */
    helper.splitEncodedPath = function(path, escape) {
      path = path || '';
      
      var pathArray     = [],
          quotes        = [],
          currentFolder = '',
          letter        = null,
          pushCurrent   = function() {
            if (escape) {
              currentFolder = helper.encodePathComponent(currentFolder);
            }
            pathArray.push(currentFolder);
            currentFolder = '';
          };

      for (var i = 0; i < path.length; i++) {
        letter = path[i];
        if (letter === '"') {
          if (letter === path[i+1]) {
            i++;
          } else if (letter === _.last(quotes)) {
            quotes.pop();
            continue;
          } else {
            quotes.push(letter);
            continue;
          }
        } else if (letter === "." && quotes.length === 0) {
          pushCurrent();
          continue;
        } 
        
        currentFolder += letter;
      }

      if (currentFolder.length > 0) {
        pushCurrent();
      }

      return pathArray;
    };

    /**
     * Encode the component of the path.
     *
     * @example
     * 'hello.world' => '"hello.world"'
     * 'test"quotes' => 'test""quotes'
     *
     * @memberOf Evisions.Helper
     *
     * @function
     * @static
     * 
     * @param  {String} name The decoded path component.
     * @return {String}      The encoded path component.
     */
    helper.encodePathComponent = function(name) {
      name = name || '';
      name = name.replace(/\"/g, '""');

      if (name.match(/\./)) {
        name = '"' + name + '"';
      }
      return name;
    };

    helper.comparePathArrays = function(ary1,ary2) {
      if (!ary1 || !ary2 || ary1.length != ary2.length)
        return false;
      for (var i = 0; i < ary1.length; i++) {
        if (ary1[i] != ary2[i]) {
          return false;
        }
      }
      return true;
    },


    /**
     * Encode an entire path (explorer path)
     *
     * @example
     * 'hello.world' => '"hello.world"'
     * 'test"quotes' => 'test""quotes'
     *
     * @memberOf Evisions.Helper
     *
     * @function
     * @static
     * 
     * @param  {Array} pathArray  The decoded path array.
     * @return {String}      The encoded path component.
     */
    helper.encodePath = function(pathArray) {
      return  _.map(pathArray, helper.encodePathComponent).join('.');
    }

    /**
     * Take an escaped html string and unescape it.
     *
     * @memberOf Evisions.Helper
     * 
     * @function
     * 
     * @param {String} string 
     * 
     * @return {String}        
     */
    helper.unescapeHTML = function(string) {
      return $('<div/>').html(string).text();
    };

    /**
     * Take a namespace string and value and apply it to the given object
     *
     * @memberOf Evisions.Helper
     * @function
     * 
     * @param  {Object} obj   The object we want to apply the namespace to.
     * @param  {String} key   The namespace string
     * @param  {Any} value The value to set on the namespace
     */
    helper.setPropertyByNamespace = function(obj, key, value) {
      key = key || '';
      var namespaces = key.split('.'),
          o = obj,
          ns = null,
          i = 0;
      if (namespaces.length < 1) {
        return;
      }

      for (i = 0; i < namespaces.length-1; ++i) {
        ns = namespaces[i];
        // If the current namespace of the curent object is null or undefined, then define it.
        if (o[ns] == null) { o[ns] = {}; }
        o = o[ns];
      }

      ns = namespaces[namespaces.length-1];

      o[ns] = value;
      return value;
    };

    /**
     * Take a namespace string and get the value from the object.
     *
     * @memberOf Evisions.Helper
     * @function
     * 
     * @param  {Object} obj The object we are getting the value from
     * @param  {String} key The namespace we want.
     * 
     * @return {Any}     The value at the given namespace
     */
    helper.getPropertyByNamespace = function(obj, key) {
      key = key || '';
      var namespaces = key.split('.'),
          o = obj,
          ns = null,
          i = 0;

      if (namespaces.length < 1) {
        return null;
      }

      for (i = 0; i < namespaces.length; ++i) {
        ns = namespaces[i];
        if (o == null) {
          return null;
        }
        // If we are looking at the last namespace, then just return the value.
        if (i === namespaces.length-1) {
          return o[ns];
        }
        o = o[ns];
      }
      return null;
    };
  
    // Overwrite the prototype proxy functionality.
    Function.prototype.proxy = function(obj) {
      var fn = this;
      return function() {
        return fn.apply(obj, arguments);
      };
    };

    // Creates an event that gets triggered when the enter key is pressed.
    $.event.special.enterkey = {
      delegateType: 'keypress',
      bindType: 'keypress',
      handle: function(event) {
        var ret,
            code      = event.which != null? event.which: event.keyCode,
            handleObj = event.handleObj,
            fn        = handleObj.handler;
        
        if (code === 13) {
          event.type = handleObj.origType;
          ret = fn.apply(this, arguments);
          event.type = 'keypress';
        }
        
        return ret;
      }
    };

    /**
     * Setup a custom scroll on the given element
     *
     * @function
     * @memberOf Evisions.Helper
     * 
     * @param  {jQuery} el    
     * @param  {Boolean} light Do you want to scrollbar to have a light theme?
     */
    helper.setupScroll = function(el, light, callbacks) {
      if (!helper.isTouchDevice() && !helper.isARMDevice() && $.fn.mCustomScrollbar) {
        el.mCustomScrollbar({ 
          horizontalScroll: false,
          theme: light ? 'light-thick' : 'dark-thick',
          scrollInertia: 0,
          mouseWheel: true,
          mouseWheelPixels: 'auto',
          advanced: {
            scrollSpeed: 'auto',
            updateOnBrowserResize: true
          },
          callbacks: callbacks
        });
      }
    };

    /**
     * Update the custom scroll with.
     *
     * @function
     * @memberOf Evisions.Helper
     * 
     * @param  {jQuery} el 
     */
    helper.updateScroll = function(el) {
      if (!helper.isTouchDevice() && $.fn.mCustomScrollbar) {
        el.mCustomScrollbar('update');
      }
    };

    /**
     * Inherit from the parent constructor to the child constructor.  
     *
     * @function
     * @memberOf Evisions.Helper
     * 
     * @param  {Function} child  The child constructor.
     * @param  {Function} parent The parent constructor.
     * 
     * @return {Function}        
     */
    helper.inherit = function(child, parent) {
      var __hasProp = {}.hasOwnProperty;
      for (var key in parent) { 
        if (__hasProp.call(parent, key)) {
          child[key] = parent[key];
        } 
      } 
      function ctor() { 
        this.constructor = child;
      } 
      ctor.prototype = parent.prototype; 
      child.prototype = new ctor(); 
      child.__super__ = parent.prototype;
      return child;
    };

    /**
     * Returns a new instance of the constructor "func" with the given arguments.
     *
     * @function
     * @memberOf Evisions.Helper
     * 
     * @param  {Function} func The constructor we want initialize.
     * @param  {Array} args Array of arguments we want to initialize with.
     * 
     * @return {Object}      New instance
     */
    helper.createWithArgs = function(func, args) {
      // Use javascript blackmagic taken from coffeescript.
      // This allows us to initialize a constructor with a dynamic amount of arguments.
      var ctor = function() {},
          child = null,
          result = null;

      ctor.prototype = func.prototype;

      child = new ctor,
      result = func.apply(child, args);
      return Object(result) === result ? result : child;
    };

  })(EVI.Helper);

  // Globally listening for the window resize event and firing a custom event.
  $(window).on('resize', function() { 
    EVI.Helper.fire('window-resize', null); 
  });
  
  // Globally listening for the keypress event and firing a custom event.
  $(window).on('keyup', function(ev) {
    var code = ev.which != null? ev.which: ev.keyCode;
    EVI.Helper.fire('window-keypress', code);
  });

  return EVI.Helper;
});

// Adding Custom Functionality for TRIM
if (!String.prototype.trim) {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
}
// Adding Custom Functionality for LTRIM
if (!String.prototype.ltrim) {
  String.prototype.ltrim = function() {
    return this.replace(/^\s+/,'');
  };
}
// Adding Custom Functionality for RTRIM
if (!String.prototype.rtrim) {
  String.prototype.rtrim = function() {
    return this.replace(/\s+$/,'');
  };
}
// Adding Custom Functionality for FULLTRIM
if (!String.prototype.fulltrim) {
  String.prototype.fulltrim = function() {
    return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
  };
}