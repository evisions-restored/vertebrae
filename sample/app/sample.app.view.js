define([
  'vertebrae/view',
], function(
  BaseView) {

  var SampleAppView = BaseView.extend({

    templates: {
      'app.init' : 'renderAppInit'
    },

    render: function() {
      this.$el.html(this.renderAppInit());
    },

    getContentElement: function() {
      return this.$("#content");
    }

  });

  return SampleAppView;

});
