define([
  '../controller'
], function(
  BaseController) {
  /**
   * @class
   * @memberOf Vertebrae
   * @augments {Vertebrae.BaseController}
   */
  var BaseContentController = BaseController.extend(/** @lends  Vertebrae.BaseContentController */{

    properties: [
      'AppController'
    ],

    contentName: '',

    initialize: function(appController) {
      this._super();

      this.setAppController(appController);
    },

    /**
     * Show loading and lock the page
     * 
     * @return {Function} 
     */
    showLoading: function() {
      var that = this;
      this.getAppController().showLoading();
      
      return function() {
        return that.hideLoading();
      };
    },

    /**
     * Hide loading and unlock the page
     */
    hideLoading: function() {
      this.getAppController().hideLoading();
    },

    /**
     * Called by app.controller when the content is loaded 
     * and after the controller is initialized and view is setup
     */
    start: function() {
      // initialize -> setupViewProperties -> start
    }

  });

  return BaseContentController;
});