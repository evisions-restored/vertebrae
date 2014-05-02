define([
  'vertebrae/view'
], function(BaseView) {
 
  var Page1View = BaseView.extend({
 
    templates: {
      'page1' : 'renderContent'
    },

    render: function() {
      this.$el.html(this.renderContent());
    }

  });
 
  return Page1View;
});