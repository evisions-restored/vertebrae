define([
  'vertebrae'
], function(Vertebrae) {
 
  var Page2View = Vertebrae.View.extend({
 
    templates: {
      'page2' : 'renderContent'
    },

    render: function() {
      this.$el.html(this.renderContent());
    }

  });
 
  return Page2View;
});