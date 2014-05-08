define([
  'vertebrae'
], function(Vertebrae) {
 
  var Page1View = Vertebrae.View.extend({
 
    templates: {
      'page1' : 'renderContent'
    },

    render: function() {
      this.$el.html(this.renderContent());
    }

  });
 
  return Page1View;
});