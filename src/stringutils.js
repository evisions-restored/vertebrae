define([
  'underscore'
], function(
  _) {
  
  /**
   * @class StringUtils
   *
   * @classdesc Common helper functions that haven't been categorized yet.
   */
  var StringUtils = _.extend(/** @lends Vertebrae.StringUtils */{

    /**
     * Return the input string with the first letter capitalized.
     *
     * @function
     *
     * @param  {String} str The string you would like to camel case.
     * 
     * @return {String} The camel cased string.
     */
    camelCase: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Return an array of camel cased strings.
     * The namespace will get exploded based off the "." within the namespace.
     *
     * @function
     *
     * @param  {String} str The namespace you would like to camel case.
     * 
     * @return {Array} Array of camel cased strings from the namespace.
     */
    camelCaseFromNamespace: function(str) {
      str = str.split('.');
      for (var i = 0; i < str.length; i++) {
        str[i] = StringUtils.camelCase(str[i]);
      }

      return str.join('');
    },

    /**
     * Formatting a number with commas and a decimal point.
     *
     * @function
     *
     * @param  {int|float} num The number you wish to format.
     * 
     * @return {string} The formatted number string.
     */
    formatNumber: function(num) {
      var sections = String(num).split('.'),
          number   = sections[0] || '0',
          decimal  = sections[1] || '',
          strArr   = number.split('').reverse(),
          arr      = [],
          finalStr = '';
          
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

    },

    /**
     * Converting the passed string to all lower case.
     * 
     * @function
     *
     * @param {String} str The string we want to lower case.
     * 
     * @return {String} The lower cased string.
     */
    toLowerCase: function(str) {
      return String(str).toLowerCase();
    },
  
    /**
     * Take an escaped html string and unescape it.
     *
     * @function
     *
     * @param {String} string 
     * 
     * @return {String}        
     */
    unescapeHTML: function(string) {
      return $('<div/>').html(string).text();
    }

  });

  String.camelCase = function() {
    return StringUtils.camelCase.apply(String, arguments);
  };

  String.camelCaseFromNamespace = function() {
    return StringUtils.camelCaseFromNamespace.apply(String, arguments);
  };

  String.formatNumber = function() {
    return StringUtils.formatNumber.apply(String, arguments);
  };

  String.unescapeHTML = function() {
    return StringUtils.unescapeHTML.apply(String, [this]);
  };

  return StringUtils;

});