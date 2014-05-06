define([
  '../abstract/abstract.controller',
  './header.view'
], function(AbstractController, HeaderView) {

  var HeaderController = AbstractController.extend({

    events: {
      'init': 'init'
    },

    view: HeaderView,

    init: function() {
      var user = this.getUser();

      // listen for changes on the likes property of the user
      // This will cause "refreshLikesPropertyOnView" to be called
      this.sync('likes', user);
      //listen for changes on the current controller property on the app
      // this will cause "refreshControllerPropertyOnView" to be called
      this.sync('controller', this.getApp())
    },

    // syncs the property to the dom by emitting events when this property changes
    refreshLikesPropertyOnView: function(count) {
      this.getView().setLikeCount(count);
    },

    refreshControllerPropertyOnView: function(controller) {
      if (controller) {
        this.getView().setCurrentPage(controller.name);
      }
    },

    increaseLikeCount: function() {
      this.getUser().increaseLikeCount();
    }

  });

  return HeaderController;
});