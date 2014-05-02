define([
  'vertebrae/view'
], function(BaseView) {
 
  var Page2View = BaseView.extend({
 
    templates: {
      'page2' : 'renderContent'
    },

    render: function() {
      this.$el.html(this.renderContent());
    }

  });
 
  return Page2View;
});