define(['handlebars.runtime'], function(Handlebars) {
  var helper = null;
  /**
   * Helper class for the project views.
   * Mainly used for providing helper functions to handlebars.
   * 
   * @name EVIViewHelpers
   * 
   * @class EVIViewHelpers
   * 
   * @memberOf Evisions
   */
  var EVIViewHelpers = /** @lends  Evisions.EVIViewHelpers */{
    
    /**
     * Can we display a product on the eLaunch page?
     * 
     * @function
     * 
     * @instance
     * 
     * @param {Bool} touchDeviceFlg Lets us know if the user is on a touch device.
     * @param {Bool} macDesktopFlg Lets us know if hte user is on a MAC desktop.
     * @param {Object} options Options to let us know how to handle the display of the products.
     * 
     * @return {Object} 
     */
    canDisplayProduct: function(touchDeviceFlg, macDesktopFlg, options) {
      if (touchDeviceFlg || macDesktopFlg) { 
        return options.fn(this); 
      }
        
      return options.inverse(this);
    },
    
    /**
     * Rendering an apply button for the view.
     * 
     * @function
     * 
     * @instance
     * 
     * @return {String}
     */
    renderApplyButton: function() {
      var options = {
        text    : 'Apply',
        color   : 'blue',
        action  : 'apply',
        icon    : 'ok'
      };
      
      return this._renderButton(options);
    },
    
    /**
     * Rendering a cancel button for the view.
     * 
     * @function
     * 
     * @instance
     * 
     * @return {String} 
     */
    renderCancelButton: function() {
      var options = {
        text    : 'Cancel',
        action  : 'cancel',
        icon    : 'share-alt'
      };
      
      return EVIViewHelpers._renderButton(options);
    },
    
    /**
     * Rendering a close button for the view.
     * 
     * @function
     * 
     * @instance
     * 
     * @return {String} 
     */
    renderCloseButton: function() {
      var options = {
        text    : 'Close',
        action  : 'close',
        icon    : 'share-alt'
      };
      
      return EVIViewHelpers._renderButton(options);
    },
    
    /**
     * Rendering a date object as a string.
     * 
     * @param {String|Object} dateObject
     * 
     * @return {String} 
     */
    renderDateString: function(dateObject) {
      if (_.isDate(dateObject)) {
        return dateObject.toDateString();
      } else {
        return dateObject;
      }
    },
    
    _colorMap: {
      blue  : 'btn-primary',
      green : 'btn-success',
      black : 'btn-inverse',
      red   : 'btn-danger',
      white : '',
      link  : 'btn-link'
    },

    /**
     * Rendering text within the handlebar templates.
     * 
     * @function
     * 
     * @instance
     * 
     * @param {Object} options List of options to help us render the text.
     * 
     * @return {String}
     */
    _renderText: function (options) {
      var str = '<div class="';

      // Do we need to pull the text left?
      if (options.position == 'left') {
        str += ' pull-left';
      }

      str += '"';

      // Does the text have an ID property?
      if (options.id) {
        str += ' id="' + options.id + '"';
      }

      str += '><p>';

      for (j = 0; j < options.text.length-1; j++) {
        str += options.text[j];
        if (options.text.length != 1) {
          str += '</br>'
        }
      }

      str += options.text[options.text.length-1];

      str += '</p></div>';

      return new Handlebars.SafeString(str);
    },


    /**
     * Rendering a button within the handlebar templates.
     * 
     * @function
     * 
     * @instance
     * 
     * @param {Object} options List of options to help us render the button.
     * 
     * @return {String}
     */
    _renderButton: function(options) {
      var tagType = 'a';
      
      // Is this a help link?
      if (options.help != null) {
        options.target = helper.helpLink(options.help);
        options.position = 'left';
        options.icon = 'question-sign';
      }
      
      // What is the tag type of the button?
      if (options.tab) {
        tagType = 'button';
      }
      
      // Setting the base HTML of the button.
      var str = '<' + tagType + ' class="btn';
      
      // Setting the color configuration of the button.
      if (options.color) {
        str += ' ';
        if (this._colorMap[options.color]) {
          str += this._colorMap[options.color];
        } else {
          str += options.color;
        }
      }
      
      // Do we need to pull the button left?
      if (options.position == 'left') {
        str += ' pull-left';
      }
      
      // Closing the class declaration of the button.
      str += '"';
      
      // Does the button have an ID property?
      if (options.id) {
        str += ' id="' + options.id + '"';
      }
      
      // Does the button have an action property?
      if (options.action) {
        str += ' data-action="' + options.action + '"';
      }
      
      // Does the button have a tab index?
      if (options.tab) {
        str += ' tabindex="' + options.tab + '" type="button"';
      }
      
      // Does the button have a dismiss property to control a Twitter Bootstrap element?
      if (options.dismiss) {
        str += ' data-dismiss="modal"';
      }
      
      // Should this button be hidden?
      if (options.hide) {
        str += ' style="display: none;"';
      }
      
      // Does this button have a HREF target?
      if (options.target) {
        str += ' href="' + options.target + '" target="_blank"';
      }
      
      // Closing the first part of the button tag.
      str += '>';

      // Add an icon to the template string.
      var addIcon = function() {
        str += '<i class="icon-' + options.icon;
        
        // What color is the color of the icon?
        if (options.color && options.color != 'white' && options.color != 'link') {
          str += ' icon-white';
        }
        str += '"></i> ';
      };
      
      // Does the button have an icon that is not set to the right?
      if (options.icon && options.iconRight !== true) {
        addIcon();
      }
      
      // Closing the button tag.
      str += ((options.text != null) ? options.text : '');

      // Does the button have an icon set to the right?
      if (options.icon && options.iconRight === true) {
        // Add spacer between text and icon.
        str += ' ';
        addIcon();
      }

      str += '</' + tagType + '>';
      
      return new Handlebars.SafeString(str);
    }
    
  };
  
  return {
    initialize: function(initHelper) {
      //set the helper whose scope is visible by EVIViewHelpers
      helper = initHelper;

      Handlebars.registerHelper('applyButton', EVIViewHelpers.renderApplyButton);
      
      Handlebars.registerHelper('button', function(options) {
        return EVIViewHelpers._renderButton(options);
      });

      Handlebars.registerHelper('cancelButton', EVIViewHelpers.renderCancelButton);

      Handlebars.registerHelper('closeButton', EVIViewHelpers.renderCloseButton);

      Handlebars.registerHelper('dateString', function(dateObject) {
        return EVIViewHelpers.renderDateString()
      });

      Handlebars.registerHelper('displayProduct', function(touchDeviceFlg, macDesktopFlg, options) {
        return EVIViewHelpers.canDisplayProduct(touchDeviceFlg, macDesktopFlg, options)
      });

      Handlebars.registerHelper('footerText', function (options) {
        return EVIViewHelpers._renderText(options);
      });

      Handlebars.registerHelper('unescapeHTML', function(passedString) {
        return helper.unescapeHTML(passedString);
      });

      Handlebars.registerHelper('uriComponent', function(passedString) {
        return encodeURIComponent(passedString);
      });

      Handlebars.registerHelper('helpURLGenerate', function(helpId) {
        return helpURL + (helpId.length > 0 ? ('#CSHID=' + helpId) : '');
      });
      

      Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
        switch (operator) {
          case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
            break;
          case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
            break;
          case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
            break;
          case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            break;
          case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
            break;
          case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            break;
          case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
            break;
          case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
            break;               
          default:
            return options.inverse(this);
            break;
        }          
      });
  
      // Lowercase the passed in string
      Handlebars.registerHelper('LowerCase', function(passedString) {
        return passedString ? String(passedString).toLowerCase() : passedString;
      });
    }
  };
});