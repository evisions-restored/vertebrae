/*!
 * Vertebrae JavaScript Library v@VERSION
 *
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function(global, factory) {

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.document ?
      factory(global, true) :
      function(w) {
        if (!w.document) {
          throw new Error("vertebrae requires a window with a document");
        }
        return factory(w);
      };
  } else {
    if (typeof define === 'function' && define.amd) {
      define('vertebrae', ['jquery', 'backbone', 'underscore'], factory);
    } else {
      factory(global);
    }
  }

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function(win, noGlobal) {

