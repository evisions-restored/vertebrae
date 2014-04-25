define([
  '../core'
], function(Vertebrae) {
  if (typeof define === 'function' && define.amd) {
    define('vertebrae', ['jquery', 'backbone', 'underscore'], function() {

      return Vertebrae;
    });
  }
});