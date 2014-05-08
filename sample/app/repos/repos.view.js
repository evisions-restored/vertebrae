define([
  'vertebrae' 
], function(Vertebrae) {

  var ReposView = Vertebrae.View.extend({

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