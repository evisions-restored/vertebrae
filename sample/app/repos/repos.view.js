define([
  'vertebrae/view' 
], function(BaseView) {

  var ReposView = BaseView.extend({

    templates: {
      'repos': 'renderContent'
    },

    render: function() {
      var delegate = this.getDelegate(),
          data     = delegate.getTemplateProperties();

      this.$el.html(this.renderContent(data));
    }

  });

  return ReposView;
});